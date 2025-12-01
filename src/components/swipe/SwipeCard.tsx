'use client';

import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { NewsItem } from '@/types';
import { useState } from 'react';
import { Check, X, Minus, Info, RotateCcw, ExternalLink } from 'lucide-react';

interface SwipeCardProps {
    item: NewsItem;
    onSwipe: (direction: 'left' | 'right' | 'up') => void;
}

export default function SwipeCard({ item, onSwipe }: SwipeCardProps) {
    const [exitX, setExitX] = useState(0);
    const [exitY, setExitY] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

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
            style={{ x, y, rotate, opacity }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: exitX, y: exitY }}
            exit={{ x: exitX, y: exitY, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute w-full max-w-sm h-[700px] cursor-grab active:cursor-grabbing perspective-1000"
        >
            <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face */}
                <motion.div
                    className="absolute w-full h-full bg-white rounded-3xl shadow-xl flex flex-col justify-between border border-gray-100 overflow-hidden backface-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        backgroundColor: bg,
                        pointerEvents: isFlipped ? 'none' : 'auto'
                    }}
                >
                    <div className="p-6 flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-start mb-4 shrink-0">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600">
                                {item.category}
                            </span>
                            <div className="text-right">
                                <div className="text-xs text-gray-400">{item.source}</div>
                                <div className="text-xs text-gray-400">
                                    {new Date(item.date).toLocaleDateString('sv-SE', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-4">
                            {item.title}
                        </h3>

                        <div className="bg-indigo-50 p-3 rounded-xl mb-3 shrink-0 flex-1">
                            <p className="text-sm text-indigo-900 font-medium overflow-y-auto max-h-full">
                                {item.rewrittenPrompt || item.rolePlayPrompt}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
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
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 text-indigo-600 text-sm font-semibold p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            <Info size={16} />
                            Read More & Details
                        </button>
                    </div>
                </motion.div>

                {/* Back Face */}
                <motion.div
                    className="absolute w-full h-full bg-white rounded-3xl shadow-xl flex flex-col border border-gray-100 overflow-hidden backface-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: bg,
                        pointerEvents: isFlipped ? 'auto' : 'none'
                    }}
                >
                    <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Details</h3>
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFlipped(false);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Title</h4>
                                <p className="text-gray-900 font-medium">{item.title}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Summary</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.rewrittenSummary || item.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Source</h4>
                                    <p className="text-sm text-gray-700">{item.source}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</h4>
                                    <p className="text-sm text-gray-700">
                                        {new Date(item.date).toLocaleString('sv-SE')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                        {item.url && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink size={16} />
                                Read Full Story
                            </a>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
