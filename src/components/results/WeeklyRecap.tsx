'use client';

import { motion } from 'framer-motion';
import { Party, UserDecision, NewsItem, AnalysisResult } from '@/types';
import { ArrowLeft, TrendingUp, Users, History, ThumbsUp, ThumbsDown, Minus, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface WeeklyRecapProps {
    party: Party;
    decisions: UserDecision[];
    newsItems: NewsItem[];
    onBack: () => void;
}

export default function WeeklyRecap({ party, decisions, newsItems, onBack }: WeeklyRecapProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

    const decisionHistory = decisions.map(decision => {
        const newsItem = newsItems.find(item => item.id === decision.newsId);
        return { decision, newsItem };
    }).filter(item => item.newsItem);

    const hasFetched = useRef(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (decisions.length === 0 || hasFetched.current) {
                return; // Don't fetch if no decisions or already fetched
            }

            hasFetched.current = true;
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ decisions, newsItems }),
                });

                if (!response.ok) {
                    throw new Error('Failed to analyze decisions');
                }

                const data = await response.json();
                setAnalysis(data);
                setIsHistoryExpanded(false); // Auto-collapse history when analysis is ready
            } catch (err) {
                console.error('Analysis error:', err);
                setError('Unable to generate analysis. Please try again later.');
                hasFetched.current = false; // Allow retry on error
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [decisions]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} /> Back to Daily Feed
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Party</h1>
                <p className="text-gray-500 mb-8">Here is how your party has evolved based on your decisions.</p>



                {/* Decision History */}
                {decisionHistory.length > 0 && (
                    <section className="bg-white p-6 rounded-3xl shadow-sm mb-6 transition-all duration-300">
                        <button
                            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                            className="w-full flex items-center justify-between group"
                        >
                            <h2 className="font-bold text-xl flex items-center gap-2 text-gray-900">
                                <History className="text-indigo-600" /> Decision History
                            </h2>
                            {isHistoryExpanded ? (
                                <ChevronUp className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            ) : (
                                <ChevronDown className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            )}
                        </button>

                        {isHistoryExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 mt-4 overflow-hidden"
                            >
                                {decisionHistory.map(({ decision, newsItem }, index) => (
                                    <motion.div key={decision.newsId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg shrink-0 ${decision.decision === 'support' ? 'bg-green-100' : decision.decision === 'oppose' ? 'bg-red-100' : 'bg-gray-200'}`}>
                                                {decision.decision === 'support' && <ThumbsUp size={16} className="text-green-600" />}
                                                {decision.decision === 'oppose' && <ThumbsDown size={16} className="text-red-600" />}
                                                {decision.decision === 'neutral' && <Minus size={16} className="text-gray-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{newsItem!.title}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {decision.decision === 'support' ? 'Supported' : decision.decision === 'oppose' ? 'Opposed' : 'Neutral stance'}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </section>
                )}

                {/* Loading state */}
                {loading && decisions.length > 0 && (
                    <section className="bg-white p-8 rounded-3xl shadow-sm mb-6">
                        <div className="flex flex-col items-center justify-center">
                            <Loader2 className="text-indigo-600 animate-spin mb-4" size={48} />
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Analyzing Your Decisions...</h3>
                            <p className="text-sm text-gray-500 text-center">
                                Our AI is reviewing your political stance and finding patterns.
                            </p>
                        </div>
                    </section>
                )}

                {/* Error state */}
                {error && decisions.length > 0 && (
                    <section className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-600 shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-red-900 mb-1">Analysis Error</h3>
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </section>
                )}


                {/* Analysis Results */}
                {analysis && !loading && decisions.length > 0 && (
                    <>
                        {/* Statement Section - New JSON Format */}
                        {analysis.Statement && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-lg mb-6 text-white relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="relative z-10">
                                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                                        <TrendingUp size={28} /> What This Means For You
                                    </h2>
                                    <p className="text-white/95 leading-relaxed text-lg">
                                        {analysis.Statement}
                                    </p>
                                </div>
                            </motion.section>
                        )}

                        {/* Party Matches Section - New JSON Format */}
                        {analysis.partyMatches && analysis.partyMatches.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-3xl shadow-sm mb-6"
                            >
                                <h2 className="font-bold text-2xl mb-6 flex items-center gap-2 text-gray-900">
                                    <Users className="text-indigo-600" size={28} /> Your Political Match
                                </h2>
                                <div className="space-y-4">
                                    {analysis.partyMatches
                                        .sort((a, b) => b.matchPercentage - a.matchPercentage)
                                        .map((match, index) => (
                                            <motion.div
                                                key={match.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {match.name}
                                                    </h3>
                                                    <span className="text-3xl font-black text-indigo-600">
                                                        {match.matchPercentage}%
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {match.explanation}
                                                </p>
                                            </motion.div>
                                        ))}
                                </div>
                            </motion.section>
                        )}

                        {/* What This Means For You - Markdown format (old) */}
                        {analysis.whatThisMeans && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-lg mb-6 text-white relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="relative z-10">
                                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                                        <TrendingUp size={28} /> What This Means For You
                                    </h2>
                                    <p className="text-white/95 leading-relaxed text-lg whitespace-pre-wrap">
                                        {analysis.whatThisMeans}
                                    </p>
                                </div>
                            </motion.section>
                        )}

                        {/* Your Political Match - Progress bars */}
                        {analysis.politicalMatch && analysis.politicalMatch.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-3xl shadow-sm mb-6"
                            >
                                <h2 className="font-bold text-2xl mb-6 flex items-center gap-2 text-gray-900">
                                    <Users className="text-indigo-600" size={28} /> Your Political Match
                                </h2>
                                <div className="space-y-5">
                                    {analysis.politicalMatch
                                        .sort((a, b) => b.percentage - a.percentage)
                                        .map((match, index) => (
                                            <motion.div
                                                key={match.party}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                className="space-y-2"
                                            >
                                                <div className="flex justify-between items-baseline">
                                                    <span className="font-semibold text-gray-900 text-base">
                                                        {match.party}
                                                    </span>
                                                    <span className="text-2xl font-bold text-indigo-600">
                                                        {match.percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${match.percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Political Tendencies Summary */}
                        {(analysis.summary || analysis.politicalTendencies) && (
                            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-sm mb-6 text-white">
                                <h2 className="font-bold text-xl mb-3 flex items-center gap-2">
                                    <TrendingUp size={24} /> Your Political Profile
                                </h2>
                                <p className="text-indigo-50 leading-relaxed">
                                    {analysis.summary || analysis.politicalTendencies}
                                </p>
                            </section>
                        )}

                        {/* Decision Patterns */}
                        {analysis.patterns && analysis.patterns.length > 0 && (
                            <section className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <TrendingUp className="text-indigo-600" /> Key Patterns
                                </h2>
                                <div className="space-y-3">
                                    {analysis.patterns.map((pattern, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-indigo-50 rounded-xl"
                                        >
                                            <p className="text-sm text-indigo-900">{pattern}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Party Alignment */}
                        {analysis.partyAlignment && analysis.partyAlignment.length > 0 && (
                            <section className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Users className="text-indigo-600" /> Party Alignment
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">Based on your decisions, here's how you align with different parties.</p>
                                <div className="space-y-4">
                                    {analysis.partyAlignment.sort((a, b) => b.match - a.match).map((item, index) => (
                                        <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0" style={{ backgroundColor: item.color || '#6366f1' }}>
                                                {item.match}%
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <motion.div className="h-full" style={{ backgroundColor: item.color || '#6366f1' }} initial={{ width: 0 }} animate={{ width: `${item.match}%` }} transition={{ duration: 1, delay: 0.5 + index * 0.1 }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Allies */}
                        {analysis.allies && analysis.allies.length > 0 && (
                            <section className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                                <h2 className="font-bold text-xl mb-4">Potential Allies</h2>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.allies.map((ally, index) => (
                                        <motion.span
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                        >
                                            {ally}
                                        </motion.span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Raw response fallback */}
                        {analysis.rawResponse && !analysis.summary && !analysis.politicalTendencies && (
                            <section className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                                <h2 className="font-bold text-xl mb-4">Analysis Results</h2>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">{analysis.rawResponse}</p>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
