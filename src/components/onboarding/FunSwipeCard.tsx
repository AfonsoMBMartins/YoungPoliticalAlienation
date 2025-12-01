'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState } from 'react';

interface FunSwipeCardProps {
    question: string;
    options: {
        left: { label: string; icon: string; value: string };
        right: { label: string; icon: string; value: string };
        up: { label: string; icon: string; value: string };
    };
    onSwipe: (direction: 'left' | 'right' | 'up', value: string) => void;
}

export default function FunSwipeCard({ question, options, onSwipe }: FunSwipeCardProps) {
    const [exitX, setExitX] = useState(0);
    const [exitY, setExitY] = useState(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const bg = useTransform(
        x,
        [-200, 0, 200],
        ['rgba(255, 200, 200, 0.5)', 'rgba(255, 255, 255, 1)', 'rgba(200, 255, 200, 0.5)']
    );

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            setExitX(200);
            onSwipe('right', options.right.value);
        } else if (info.offset.x < -100) {
            setExitX(-200);
            onSwipe('left', options.left.value);
        } else if (info.offset.y < -100) {
            setExitY(-200);
            onSwipe('up', options.up.value);
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
            className="absolute w-full max-w-sm h-[450px] bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between border-2 border-gray-100 cursor-grab active:cursor-grabbing"
        >
            <div className="text-center mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{question}</h3>
                <p className="text-gray-400 text-sm">Swipe to choose!</p>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{options.left.icon}</span>
                    <span>{options.left.label}</span>
                </div>

                {/* Center/Up Option Indicator */}
                <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
                    <span className="text-xl">{options.up.icon}</span>
                    <span className="text-xs">{options.up.label}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{options.right.icon}</span>
                    <span>{options.right.label}</span>
                </div>
            </div>
        </motion.div>
    );
}
