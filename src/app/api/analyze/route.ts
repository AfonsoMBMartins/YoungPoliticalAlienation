import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANALYSIS_ASSISTANT_ID = 'asst_hOeHkPilIx8GaDjukFqFT5yc';
const OPENAI_API_BASE = 'https://api.openai.com/v1';

interface UserDecision {
    newsId: string;
    decision: 'support' | 'oppose' | 'neutral';
    timestamp: number;
}

export async function POST(request: NextRequest) {
    try {
        const { decisions, newsItems } = await request.json();

        // Validate that we have at least one decision
        if (!decisions || decisions.length === 0) {
            return NextResponse.json(
                { error: 'At least one decision is required for analysis' },
                { status: 400 }
            );
        }

        if (!OPENAI_API_KEY) {
            console.error('OpenAI API key not configured');
            return NextResponse.json(
                { error: 'Analysis service not configured' },
                { status: 500 }
            );
        }

        // Format decisions with news context (title, summary, and user response only)
        const formattedDecisions = decisions.map((decision: UserDecision) => {
            const newsItem = newsItems?.find((item: any) => item.id === decision.newsId);
            return {
                title: newsItem?.title || 'Unknown',
                summary: newsItem?.summary || 'No summary available',
                userResponse: decision.decision
            };
        });

        // Create thread
        const thread = await createThread();
        console.log('Thread ID:', thread.id);

        // Send formatted decisions as JSON to the assistant
        await addMessage(thread.id, JSON.stringify(formattedDecisions, null, 2));

        // Run the assistant
        const run = await runAssistant(thread.id);

        // Wait for completion and get response
        const analysisResult = await waitForCompletion(thread.id, run.id);

        // Parse the markdown response from the assistant
        let parsedAnalysis: any = {};

        try {
            // Clean up the response if it's wrapped in markdown code blocks
            let cleanJson = analysisResult.trim();
            if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }

            // Try JSON parsing
            parsedAnalysis = JSON.parse(cleanJson);
        } catch (e) {
            // Parse markdown format
            const whatThisMeansMatch = analysisResult.match(/## What This Means For You\s*([\s\S]*?)(?=##|$)/i);
            const politicalMatchMatch = analysisResult.match(/## Your Political Match\s*([\s\S]*?)$/i);

            if (whatThisMeansMatch) {
                parsedAnalysis.whatThisMeans = whatThisMeansMatch[1].trim();
            }

            if (politicalMatchMatch) {
                const matchText = politicalMatchMatch[1].trim();
                // Parse party matches - looking for patterns like "Party Name: 75%"
                const partyMatches = matchText.matchAll(/[-*]\s*\*\*(.+?)\*\*:\s*(\d+)%/g);
                parsedAnalysis.politicalMatch = Array.from(partyMatches).map(match => ({
                    party: match[1].trim(),
                    percentage: parseInt(match[2])
                }));
            }

            // Keep raw response as fallback
            if (!parsedAnalysis.whatThisMeans && !parsedAnalysis.politicalMatch) {
                parsedAnalysis.rawResponse = analysisResult;
            }
        }

        return NextResponse.json(parsedAnalysis);

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze decisions' },
            { status: 500 }
        );
    }
}

async function createThread() {
    const response = await fetch(`${OPENAI_API_BASE}/threads`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.statusText}`);
    }

    return response.json();
}

async function addMessage(threadId: string, content: string) {
    const response = await fetch(`${OPENAI_API_BASE}/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            role: 'user',
            content: content
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to add message: ${response.statusText}`);
    }

    return response.json();
}

async function runAssistant(threadId: string) {
    const response = await fetch(`${OPENAI_API_BASE}/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            assistant_id: ANALYSIS_ASSISTANT_ID
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to run assistant: ${response.statusText}`);
    }

    return response.json();
}

async function waitForCompletion(threadId: string, runId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${OPENAI_API_BASE}/threads/${threadId}/runs/${runId}`, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to check run status: ${response.statusText}`);
        }

        const run = await response.json();

        if (run.status === 'completed') {
            const messagesResponse = await fetch(`${OPENAI_API_BASE}/threads/${threadId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            if (!messagesResponse.ok) {
                throw new Error(`Failed to get messages: ${messagesResponse.statusText}`);
            }

            const messages = await messagesResponse.json();
            const assistantMessage = messages.data.find((m: any) => m.role === 'assistant');

            if (assistantMessage && assistantMessage.content[0]?.text?.value) {
                return assistantMessage.content[0].text.value;
            }

            throw new Error('No assistant response found');
        }

        if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
            throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
        }
    }

    throw new Error('Timeout waiting for assistant response');
}
