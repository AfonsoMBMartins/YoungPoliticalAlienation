import { NextResponse } from 'next/server';
import { UserProfile, Party } from '@/types';

const ADJECTIVES = {
    nerdy: ['Rational', 'Logical', 'Data-Driven', 'Smart', 'Tech'],
    chill: ['Relaxed', 'Easy', 'Smooth', 'Vibe', 'Cool'],
    chaotic: ['Wild', 'Radical', 'Storm', 'Chaos', 'Flux'],
    default: ['Future', 'United', 'Free', 'New', 'Nordic']
};

const NOUNS = {
    forest: ['Roots', 'Grove', 'Leaf', 'Nature', 'Wood'],
    city: ['Metro', 'Urban', 'Block', 'Street', 'Tower'],
    beach: ['Wave', 'Tide', 'Coast', 'Surge', 'Flow'],
    default: ['Alliance', 'Party', 'Union', 'Voice', 'Front']
};

const EMBLEMS = {
    turtle: ['🐢', '🛡️', '🟢'],
    dog: ['🐕', '🦴', '🟤'],
    penguin: ['🐧', '❄️', '⚫'],
    banana: ['🍌', '🟡'],
    pizza: ['🍕', '🔴'],
    croissant: ['🥐', '🟠']
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { profile } = body;

        // Use profile data to seed generation, but allow randomization overrides
        const adjKey = (profile.communicationStyle || 'nerdy') as keyof typeof ADJECTIVES;
        const nounKey = (profile.hqVibe || 'forest') as keyof typeof NOUNS;

        const adjectivePool = [...(ADJECTIVES[adjKey] || []), ...ADJECTIVES.default];
        const nounPool = [...(NOUNS[nounKey] || []), ...NOUNS.default];

        const randomAdjective = adjectivePool[Math.floor(Math.random() * adjectivePool.length)];
        const randomNoun = nounPool[Math.floor(Math.random() * nounPool.length)];

        const name = `The ${randomAdjective} ${randomNoun}`;

        // Emblem logic
        const mascotKey = (profile.mascotVibe || 'turtle') as keyof typeof EMBLEMS;
        const snackKey = (profile.snack || 'banana') as keyof typeof EMBLEMS;

        const emblemPool = [
            ...(EMBLEMS[mascotKey] || []),
            ...(EMBLEMS[snackKey] || []),
            '🇸🇪', '✨', '🗳️'
        ];
        const emblem = emblemPool[Math.floor(Math.random() * emblemPool.length)];

        // Description generation
        const description = `A ${profile.communicationStyle} party for ${profile.region}, powered by ${profile.snack}s and ${profile.themeMusic}.`;

        const party: Party = {
            id: Math.random().toString(36).substring(7),
            name,
            description,
            emblem,
            color: profile.favoriteColor || '#4F46E5', // Fallback
            stats: {
                members: Math.floor(Math.random() * 1000) + 100,
                popularity: Math.floor(Math.random() * 20) + 5,
            },
            history: []
        };

        return NextResponse.json(party);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate party' }, { status: 500 });
    }
}
