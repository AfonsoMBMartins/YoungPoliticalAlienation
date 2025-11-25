import { NextResponse } from 'next/server';

const SR_ATOM_URL = 'https://api.sr.se/api/rss/program/83';

export async function GET() {
    try {
        console.log('Fetching news from SR Atom feed...');

        const response = await fetch(SR_ATOM_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyPartySimulator/1.0)',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const xmlText = await response.text();
        const items = parseAtomFeed(xmlText);

        const newsItems = items.slice(0, 10).map((item, index) => ({
            id: `sr-${index}-${Date.now()}`,
            title: item.title,
            summary: item.description,
            rolePlayPrompt: `A new report regarding "${item.title}" has been released. What is your party's stance?`,
            source: 'Sveriges Radio Ekot',
            category: 'Politics',
            date: item.pubDate || new Date().toISOString(),
            tags: ['news', 'sweden', 'politics'],
            url: item.link
        }));

        console.log(`Parsed ${newsItems.length} news items`);
        return NextResponse.json(newsItems);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json([]);
    }
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
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();

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
