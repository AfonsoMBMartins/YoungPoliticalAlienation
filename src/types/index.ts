export interface UserProfile {
    // Demographics
    ageRange: string;
    region: string;
    interests: string[];

    // Fun Swipe Answers (Personality)
    mascotVibe: 'turtle' | 'dog' | 'penguin';
    snack: 'banana' | 'pizza' | 'croissant';
    hqVibe: 'forest' | 'city' | 'beach';
    communicationStyle: 'nerdy' | 'chill' | 'chaotic';
    themeMusic: 'rock' | 'pop' | 'techno';
}

export interface Party {
    id: string;
    name: string;
    description: string;
    emblem: string; // Emoji or SVG string
    color: string;
    stats: {
        members: number;
        popularity: number;
    };
    // History of decisions
    history: {
        date: string;
        decisions: UserDecision[];
    }[];
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string; // Neutral, B1-B2 level
    rolePlayPrompt: string; // Neutral tone
    source: string;
    category: string;
    date: string;
    tags: string[];
    url?: string;
}

export interface UserDecision {
    newsId: string;
    decision: 'support' | 'oppose' | 'neutral';
    timestamp: number;
}
