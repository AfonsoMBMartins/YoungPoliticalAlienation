import { NewsItem } from '@/types';

export async function fetchNews(): Promise<NewsItem[]> {
    try {
        // Fetch from our own API route (server-side proxy)
        const response = await fetch('/api/news');
        if (!response.ok) {
            throw new Error('Failed to fetch news from API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}
