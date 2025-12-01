'use client';

import { AlignmentResult } from '@/lib/alignment';
import { motion } from 'framer-motion';

interface AlignmentResultsProps {
    results: AlignmentResult[];
    onRestart: () => void;
}

export default function AlignmentResults({ results, onRestart }: AlignmentResultsProps) {
    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Political Allies</h2>

            <div className="space-y-4 mb-8">
                {results.map((result, index) => (
                    <motion.div
                        key={result.party.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border-2"
                        style={{ borderColor: index === 0 ? result.party.color : 'transparent' }}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                            style={{ backgroundColor: result.party.color }}
                        >
                            {result.score}%
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{result.party.name}</h3>
                            <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    className="h-full"
                                    style={{ backgroundColor: result.party.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.score}%` }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button
                onClick={onRestart}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
                Start New Campaign
            </button>
        </div>
    );
}
