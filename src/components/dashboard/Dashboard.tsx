'use client';

import { useState, useEffect } from 'react';
import { Party, NewsItem } from '@/types';
import SwipeCard from '@/components/swipe/SwipeCard';
import AlignmentResults from '@/components/results/AlignmentResults';
import { calculateAlignment, AlignmentResult } from '@/lib/alignment';
import { AnimatePresence, motion } from 'framer-motion';

interface DashboardProps {
    party: Party;
}

export default function Dashboard({ party }: DashboardProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [decisions, setDecisions] = useState<{ id: string; decision: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<AlignmentResult[] | null>(null);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const res = await fetch('/api/news');
                const data = await res.json();
                setNews(data);
            } catch (error) {
                console.error('Failed to load news', error);
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, []);

    const handleSwipe = (direction: 'left' | 'right' | 'up') => {
        const currentItem = news[currentIndex];
        const newDecisions = [...decisions, { id: currentItem.id, decision: direction }];
        setDecisions(newDecisions);

        // Delay to allow animation to complete
        setTimeout(() => {
            if (currentIndex + 1 >= news.length) {
                // Calculate results
                const alignmentResults = calculateAlignment(newDecisions, news);
                setResults(alignmentResults);
            }
            setCurrentIndex((prev) => prev + 1);
        }, 200);
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setDecisions([]);
        setResults(null);
    };

    if (loading) {
        return <div className="text-center p-8">Loading briefing...</div>;
    }

    if (results) {
        return <AlignmentResults results={results} onRestart={handleRestart} />;
    }

    if (currentIndex >= news.length) {
        // Fallback if results haven't set yet (shouldn't happen with logic above but good for safety)
        return <div className="text-center p-8">Calculating results...</div>;
    }

    return (
        <div className="w-full max-w-md mx-auto h-[600px] relative flex items-center justify-center">
            <AnimatePresence>
                {news.slice(currentIndex, currentIndex + 2).reverse().map((item, index) => (
                    <SwipeCard
                        key={item.id}
                        item={item}
                        onSwipe={handleSwipe}
                    />
                ))}
            </AnimatePresence>

            <div className="absolute bottom-0 w-full text-center pb-4 text-gray-400 text-sm">
                Card {currentIndex + 1} of {news.length}
            </div>
        </div>
    );
}
