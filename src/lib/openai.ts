// OpenAI Assistant service for rewriting news articles
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const OPENAI_API_BASE = 'https://api.openai.com/v1';

interface AssistantResponse {
    rewrittenText: string;
    success: boolean;
    error?: string;
}

export async function rewriteWithAssistant(originalText: string): Promise<AssistantResponse> {
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
        console.error('OpenAI credentials not configured');
        return { rewrittenText: originalText, success: false, error: 'Missing credentials' };
    }

    try {
        // Step 1: Create a thread
        const thread = await createThread();

        // Step 2: Add message to thread
        await addMessage(thread.id, originalText);

        // Step 3: Run assistant
        const run = await runAssistant(thread.id);

        // Step 4: Wait for completion and get response
        const response = await waitForCompletion(thread.id, run.id);

        return { rewrittenText: response, success: true };
    } catch (error) {
        console.error('Error rewriting with assistant:', error);
        return { rewrittenText: originalText, success: false, error: String(error) };
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
            assistant_id: ASSISTANT_ID
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to run assistant: ${response.statusText}`);
    }

    return response.json();
}

async function waitForCompletion(threadId: string, runId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

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
            // Get messages
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
