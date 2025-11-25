'use client';

import { motion } from 'framer-motion';
import { Party } from '@/types';
import { ArrowLeft, TrendingUp, Users } from 'lucide-react';

interface WeeklyRecapProps {
    party: Party;
    onBack: () => void;
}

// Mock data for alignment - Informational Tone
const ALIGNMENT_DATA = [
    { name: 'Socialdemokraterna', match: 75, color: '#E3000F' },
    { name: 'Moderaterna', match: 60, color: '#52BDEC' },
    { name: 'Miljöpartiet', match: 85, color: '#53A045' },
    { name: 'Sverigedemokraterna', match: 30, color: '#DDDD00' },
    { name: 'Vänsterpartiet', match: 70, color: '#DA291C' },
];

export default function WeeklyRecap({ party, onBack }: WeeklyRecapProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Daily Feed
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Recap</h1>
                <p className="text-gray-500 mb-8">Here is how your party has evolved this week.</p>

                {/* Trends Section */}
                <section className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" /> Key Trends
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-xl">
                            <h3 className="font-bold text-indigo-900 mb-1">Environmental Focus</h3>
                            <p className="text-sm text-indigo-800">
                                You have supported 80% of environmental proposals this week.
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <h3 className="font-bold text-purple-900 mb-1">Education Reform</h3>
                            <p className="text-sm text-purple-800">
                                You showed strong interest in school funding redistribution.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Alignment Section */}
                <section className="bg-white p-6 rounded-3xl shadow-sm">
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <Users className="text-indigo-600" /> Political Landscape
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Based on recent decisions, these parties most often agreed with your choices.
                    </p>

                    <div className="space-y-4">
                        {ALIGNMENT_DATA.sort((a, b) => b.match - a.match).map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.match}%
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full"
                                            style={{ backgroundColor: item.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.match}%` }}
                                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
