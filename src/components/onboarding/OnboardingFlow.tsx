'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types';
import { ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';
import FunSwipeCard from './FunSwipeCard';

interface OnboardingFlowProps {
    onComplete: (profile: UserProfile) => void;
}

const REGIONS = ['Stockholm', 'Gothenburg', 'Malmö', 'North', 'South', 'Central'];
const INTERESTS = ['Environment', 'Economy', 'Education', 'Healthcare', 'Technology', 'Culture'];

const FUN_QUESTIONS = [
    {
        key: 'mascotVibe',
        question: "Your party mascot vibe is...",
        options: {
            left: { label: 'Turtle', icon: '🐢', value: 'turtle' },
            right: { label: 'Dog', icon: '🐕', value: 'dog' },
            up: { label: 'Penguin', icon: '🐧', value: 'penguin' },
        }
    },
    {
        key: 'snack',
        question: "Favorite brainstorming snack...",
        options: {
            left: { label: 'Banana', icon: '🍌', value: 'banana' },
            right: { label: 'Pizza', icon: '🍕', value: 'pizza' },
            up: { label: 'Croissant', icon: '🥐', value: 'croissant' },
        }
    },
    {
        key: 'hqVibe',
        question: "Your HQ vibe...",
        options: {
            left: { label: 'Forest', icon: '🌲', value: 'forest' },
            right: { label: 'City', icon: '🏙️', value: 'city' },
            up: { label: 'Beach', icon: '🌊', value: 'beach' },
        }
    },
    {
        key: 'communicationStyle',
        question: "Communication style...",
        options: {
            left: { label: 'Nerdy', icon: '🤓', value: 'nerdy' },
            right: { label: 'Chill', icon: '😎', value: 'chill' },
            up: { label: 'Chaotic', icon: '🤡', value: 'chaotic' },
        }
    },
    {
        key: 'themeMusic',
        question: "Party theme music...",
        options: {
            left: { label: 'Rock', icon: '🎸', value: 'rock' },
            right: { label: 'Pop', icon: '🎶', value: 'pop' },
            up: { label: 'Techno', icon: '🎧', value: 'techno' },
        }
    }
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState(0); // 0: Demographics, 1: Fun Swipes
    const [swipeIndex, setSwipeIndex] = useState(0);

    const [profile, setProfile] = useState<UserProfile>({
        ageRange: '18-24', // Default or hidden
        region: '',
        interests: [],
        mascotVibe: 'turtle',
        snack: 'banana',
        hqVibe: 'forest',
        communicationStyle: 'nerdy',
        themeMusic: 'rock',
    });

    const updateProfile = (key: keyof UserProfile, value: any) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
    };

    const toggleInterest = (interest: string) => {
        setProfile((prev) => {
            const interests = prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest];
            return { ...prev, interests };
        });
    };

    const handleSwipe = (direction: string, value: string) => {
        const currentQuestion = FUN_QUESTIONS[swipeIndex];
        updateProfile(currentQuestion.key as keyof UserProfile, value);

        setTimeout(() => {
            if (swipeIndex < FUN_QUESTIONS.length - 1) {
                setSwipeIndex(swipeIndex + 1);
            } else {
                onComplete({ ...profile, [currentQuestion.key]: value });
            }
        }, 200);
    };

    if (step === 0) {
        return (
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl min-h-[500px] flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us a bit about you</h2>

                <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <select
                            value={profile.region}
                            onChange={(e) => updateProfile('region', e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white"
                        >
                            <option value="">Select Region</option>
                            {REGIONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interests (Pick 3+)</label>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS.map((interest) => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={clsx(
                                        'px-3 py-2 rounded-full text-sm border transition-all',
                                        profile.interests.includes(interest)
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                    )}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setStep(1)}
                    disabled={!profile.region || profile.interests.length < 3}
                    className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    Next: Build Your Party <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto h-[600px] relative flex flex-col items-center justify-center">
            <div className="absolute top-0 w-full text-center mb-8 z-10">
                <h2 className="text-xl font-bold text-gray-900">Let's build your party vibe!</h2>
                <p className="text-gray-500 text-sm">Question {swipeIndex + 1} of {FUN_QUESTIONS.length}</p>
            </div>

            <AnimatePresence mode="wait">
                {FUN_QUESTIONS.slice(swipeIndex, swipeIndex + 2).reverse().map((q, i) => (
                    <FunSwipeCard
                        key={q.key}
                        question={q.question}
                        options={q.options}
                        onSwipe={handleSwipe}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
