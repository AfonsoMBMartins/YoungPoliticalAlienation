'use client';

import { useState } from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import DailyFeed from '@/components/dashboard/DailyFeed';
import WeeklyRecap from '@/components/results/WeeklyRecap';
import { UserProfile, Party } from '@/types';
import { motion } from 'framer-motion';

export default function Home() {
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'onboarding' | 'dashboard' | 'recap'>('onboarding');
  const [storedProfile, setStoredProfile] = useState<UserProfile | null>(null);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      setParty(data);
      // Store profile for randomization usage
      setStoredProfile(profile);
    } catch (error) {
      console.error('Failed to generate party', error);
    } finally {
      setLoading(false);
    }
  };

  const randomizeParty = async (type: 'name' | 'symbol') => {
    if (!storedProfile || !party) return;

    // In a real app, we'd have specific endpoints or params. 
    // Here we re-fetch and just update the specific field for simplicity in prototype
    const response = await fetch('/api/generate-party', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: storedProfile }),
    });
    const newData = await response.json();

    setParty(prev => prev ? ({
      ...prev,
      name: type === 'name' ? newData.name : prev.name,
      emblem: type === 'symbol' ? newData.emblem : prev.emblem
    }) : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (party && view === 'onboarding') {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-4 border-indigo-100"
        >
          <div className="text-6xl mb-4">{party.emblem}</div>
          <button onClick={() => randomizeParty('symbol')} className="text-xs text-indigo-500 underline mb-4">Randomize Symbol</button>

          <h1 className="text-3xl font-black mb-2 text-gray-900">{party.name}</h1>
          <button onClick={() => randomizeParty('name')} className="text-xs text-indigo-500 underline mb-6">Randomize Name</button>

          <p className="text-gray-600 mb-8">{party.description}</p>

          <button
            onClick={() => setView('dashboard')}
            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:opacity-90 transition-opacity bg-indigo-600"
          >
            Start Daily Decisions
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === 'dashboard' && party) { // Added new conditional block for dashboard
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <header className="max-w-md mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{party.emblem}</div>
            <div>
              <h1 className="font-bold text-gray-900">{party.name}</h1>
            </div>
          </div>
          <div className="bg-white p-2 rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {party.name.charAt(0)}
            </div>
          </div>
        </header>
        <DailyFeed party={party} onViewRecap={() => setView('recap')} />
      </main>
    );
  }

  if (view === 'recap' && party) {
    return <WeeklyRecap party={party} onBack={() => setView('dashboard')} />;
  }

  return ( // This block now only renders if view is 'onboarding'
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
          My Party <span className="text-indigo-600">Simulator</span>
        </h1>
        <p className="text-xl text-gray-600">Create your own political party and rule Sweden (sort of).</p>
      </div>

      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </main>
  );
}
