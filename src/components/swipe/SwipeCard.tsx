'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { NewsItem } from '@/types';
import { useState } from 'react';
import { Check, X, Minus, Info } from 'lucide-react';

interface SwipeCardProps {
    item: NewsItem;
    onSwipe: (direction: 'left' | 'right' | 'up') => void;
}

export default function SwipeCard({ item, onSwipe }: SwipeCardProps) {
    const [exitX, setExitX] = useState(0);
    const [exitY, setExitY] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Neutral background color interpolation
    const bg = useTransform(
        x,
        [-200, 0, 200],
        ['rgba(255, 230, 230, 1)', 'rgba(255, 255, 255, 1)', 'rgba(230, 255, 230, 1)']
    );

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            setExitX(200);
            onSwipe('right');
        } else if (info.offset.x < -100) {
            setExitX(-200);
            onSwipe('left');
        } else if (info.offset.y < -100) {
            setExitY(-200);
            onSwipe('up');
        }
    };

    return (
        <motion.div
            style={{ x, y, rotate, opacity, backgroundColor: bg }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: exitX, y: exitY }}
            exit={{ x: exitX, y: exitY, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute w-full max-w-sm h-[550px] bg-white rounded-3xl shadow-xl flex flex-col justify-between border border-gray-100 cursor-grab active:cursor-grabbing overflow-hidden"
        >
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600">
                        {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{item.source}</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {item.title}
                </h3>

                <div className="bg-indigo-50 p-4 rounded-xl mb-4">
                    <p className="text-sm text-indigo-900 font-medium">
                        {item.rolePlayPrompt}
                    </p>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.summary}
                </p>

                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg"
                    >
                        <p>Tags: {item.tags.join(', ')}</p>
                        <p className="mt-1">Date: {new Date(item.date).toLocaleDateString()}</p>
                    </motion.div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center text-gray-400 text-sm font-medium mb-4">
                    <div className="flex items-center gap-1">
                        <X size={16} className="text-red-500" />
                        <span>Oppose</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Minus size={16} className="text-gray-500" />
                        <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Support</span>
                        <Check size={16} className="text-green-500" />
                    </div>
                </div>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-center gap-2 text-indigo-600 text-sm font-semibold mb-2"
                >
                    <Info size={16} />
                    {showDetails ? 'Hide Details' : 'Read More'}
                </button>

                {item.url && (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center text-xs text-gray-400 hover:text-indigo-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Read full story at {item.source}
                    </a>
                )}
            </div>
        </motion.div>
    );
}
