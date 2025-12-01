import { NextResponse } from 'next/server';
import { rewriteWithAssistant } from '@/lib/openai';

const SR_ATOM_URL = 'https://api.sr.se/api/rss/program/83';

const POLITICAL_KEYWORDS = [
    'politik', 'riksdag', 'regering', 'minister', 'statsminister',
    'lag', 'förslag', 'beslut', 'reform', 'budget', 'parti',
    'val', 'debatt', 'proposition', 'motion', 'omröstning',
    'skatt', 'välfärd', 'migration', 'klimat', 'energi',
    'government', 'parliament', 'policy', 'election'
];

export async function GET() {
    try {
        console.log('Fetching and filtering political news...');

        const response = await fetch(SR_ATOM_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MyPartySimulator/1.0)' },
        });

        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const xmlText = await response.text();
        const allItems = parseAtomFeed(xmlText);
        const filteredItems = filterPoliticalNews(allItems);

        // Rewrite articles with OpenAI Assistant in parallel
        console.log('Rewriting articles with OpenAI Assistant...');
        const rewritePromises = filteredItems.slice(0, 10).map(async (item, index) => {
            const newsItem = {
                id: `sr-${index}-${Date.now()}`,
                title: item.title,
                summary: item.description,
                rolePlayPrompt: `A new report regarding "${item.title}" has been released. What is your party's stance?`,
                source: 'Sveriges Radio Ekot',
                category: 'Politics',
                date: item.pubDate || new Date().toISOString(),
                tags: ['news', 'sweden', 'politics'],
                url: item.link
            };

            // Rewrite summary and prompt with assistant
            const summaryResult = await rewriteWithAssistant(item.description);
            const promptResult = await rewriteWithAssistant(newsItem.rolePlayPrompt);

            return {
                ...newsItem,
                rewrittenSummary: summaryResult.success ? summaryResult.rewrittenText : undefined,
                rewrittenPrompt: promptResult.success ? promptResult.rewrittenText : undefined
            };
        });

        const newsItems = await Promise.all(rewritePromises);

        console.log(`Filtered ${allItems.length} items to ${newsItems.length} political news (rewritten)`);
        return NextResponse.json(newsItems);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json([]);
    }
}

function filterPoliticalNews(items: Array<{ title: string, description: string, link: string, pubDate: string }>) {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    return items
        .filter(item => {
            const itemDate = new Date(item.pubDate).getTime();
            if (itemDate < oneWeekAgo) return false;

            const text = `${item.title} ${item.description}`.toLowerCase();
            return POLITICAL_KEYWORDS.some(keyword => text.includes(keyword));
        })
        .map(item => ({ ...item, score: calculateScore(item) }))
        .sort((a, b) => b.score - a.score)
        .map(({ score, ...item }) => item);
}

function calculateScore(item: { title: string, description: string }): number {
    const text = `${item.title} ${item.description}`.toLowerCase();
    let score = 0;

    for (const keyword of POLITICAL_KEYWORDS) {
        const matches = text.match(new RegExp(keyword, 'gi'));
        if (matches) score += matches.length;
    }

    const titleText = item.title.toLowerCase();
    for (const keyword of POLITICAL_KEYWORDS) {
        if (titleText.includes(keyword)) score += 2;
    }

    return score;
}

function parseAtomFeed(xml: string): Array<{ title: string, description: string, link: string, pubDate: string }> {
    const items: Array<{ title: string, description: string, link: string, pubDate: string }> = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;

    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
        const entryXml = match[1];
        const titleMatch = entryXml.match(/<title[^>]*>(.*?)<\/title>/);
        const summaryMatch = entryXml.match(/<summary[^>]*>(.*?)<\/summary>/);
        const linkMatch = entryXml.match(/<link[^>]*href="([^"]*)"/);
        const updatedMatch = entryXml.match(/<updated>(.*?)<\/updated>/);

        if (titleMatch && summaryMatch) {
            const cleanDesc = summaryMatch[1]
                .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
                .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

            items.push({
                title: titleMatch[1],
                description: cleanDesc.length > 250 ? cleanDesc.substring(0, 250) + '...' : cleanDesc,
                link: linkMatch ? linkMatch[1] : '',
                pubDate: updatedMatch ? new Date(updatedMatch[1]).toISOString() : new Date().toISOString()
            });
        }
    }

    return items;
}
