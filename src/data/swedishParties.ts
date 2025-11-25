export interface RealParty {
    id: string;
    name: string;
    color: string;
    stances: Record<string, 'support' | 'oppose' | 'neutral'>; // key is category
}

export const SWEDISH_PARTIES: RealParty[] = [
    {
        id: 's',
        name: 'Socialdemokraterna',
        color: '#E3000F',
        stances: {
            'Environment': 'support',
            'Education': 'support',
            'Healthcare': 'support',
            'Defense': 'support',
            'Infrastructure': 'support',
        }
    },
    {
        id: 'm',
        name: 'Moderaterna',
        color: '#52BDEC',
        stances: {
            'Environment': 'neutral',
            'Education': 'support',
            'Healthcare': 'support', // Private
            'Defense': 'support',
            'Infrastructure': 'support',
        }
    },
    {
        id: 'sd',
        name: 'Sverigedemokraterna',
        color: '#DDDD00',
        stances: {
            'Environment': 'oppose',
            'Education': 'neutral',
            'Healthcare': 'support',
            'Defense': 'support',
            'Infrastructure': 'neutral',
        }
    },
    {
        id: 'mp',
        name: 'Miljöpartiet',
        color: '#53A045',
        stances: {
            'Environment': 'support',
            'Education': 'support',
            'Healthcare': 'support',
            'Defense': 'oppose',
            'Infrastructure': 'support', // Trains
        }
    },
    {
        id: 'v',
        name: 'Vänsterpartiet',
        color: '#DA291C',
        stances: {
            'Environment': 'support',
            'Education': 'support',
            'Healthcare': 'support', // Public
            'Defense': 'oppose',
            'Infrastructure': 'support',
        }
    }
];
