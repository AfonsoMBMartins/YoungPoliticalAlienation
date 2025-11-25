'use client';

import { useState, useEffect } from 'react';
import { Party, NewsItem, UserDecision } from '@/types';
import SwipeCard from '@/components/swipe/SwipeCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Check, X } from 'lucide-react';

interface DailyFeedProps {
    party: Party;
    onViewRecap: () => void;
}

export default function DailyFeed({ party, onViewRecap }: DailyFeedProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [decisions, setDecisions] = useState<UserDecision[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const res = await fetch('/api/news');
                const data = await res.json();
                setNews(data);

                // Simulate notification after a delay
                setTimeout(() => setShowNotification(true), 1500);
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
        const decision: UserDecision = {
            newsId: currentItem.id,
            decision: direction === 'left' ? 'oppose' : direction === 'right' ? 'support' : 'neutral',
            timestamp: Date.now()
        };

        setDecisions([...decisions, decision]);

        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 200);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Fetching daily briefing...</p>
            </div>
        );
    }

    if (currentIndex >= news.length) {
        return (
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">All caught up!</h2>
                <p className="text-gray-500 mb-6">You've made {decisions.length} decisions today.</p>

                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar size={16} /> Weekly Trend
                    </h3>
                    <p className="text-sm text-gray-600">
                        Your party is showing a strong focus on <span className="font-semibold text-indigo-600">Environment</span> and <span className="font-semibold text-indigo-600">Education</span> this week.
                    </p>
                </div>

                <button
                    onClick={onViewRecap}
                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                    See Full Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto h-[600px] relative flex items-center justify-center">
            {/* Notification Toast */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-0 z-50 w-full px-4"
                    >
                        <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                            <div className="bg-indigo-500 p-2 rounded-lg">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">New Decisions Available</h4>
                                <p className="text-xs text-gray-300">Your party has 5 new items to review.</p>
                            </div>
                            <button
                                onClick={() => setShowNotification(false)}
                                className="ml-auto text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {news.slice(currentIndex, currentIndex + 2).reverse().map((item, index) => (
                    <SwipeCard
                        key={item.id}
                        item={item}
                        onSwipe={handleSwipe}
                    />
                ))}
            </AnimatePresence>

            <div className="absolute bottom-0 w-full text-center pb-4">
                <div className="text-gray-400 text-sm mb-2">Decision {currentIndex + 1} of {news.length}</div>
                <button
                    onClick={onViewRecap}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                    View Weekly Recap
                </button>
            </div>
        </div>
    );
}
