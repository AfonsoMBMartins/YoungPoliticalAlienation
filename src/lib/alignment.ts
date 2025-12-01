import { SWEDISH_PARTIES, RealParty } from '@/data/swedishParties';
import { NewsItem } from '@/types';

interface UserDecision {
    id: string;
    decision: string; // 'left' (oppose), 'right' (support), 'up' (neutral)
}

export interface AlignmentResult {
    party: RealParty;
    score: number; // 0-100
}

export function calculateAlignment(decisions: UserDecision[], news: NewsItem[]): AlignmentResult[] {
    // Map decisions to categories
    const categoryDecisions: Record<string, string> = {};

    decisions.forEach(d => {
        const item = news.find(n => n.id === d.id);
        if (item) {
            // Map swipe direction to stance
            let stance = 'neutral';
            if (d.decision === 'right') stance = 'support';
            if (d.decision === 'left') stance = 'oppose';

            categoryDecisions[item.category] = stance;
        }
    });

    // Calculate score for each party
    const results = SWEDISH_PARTIES.map(party => {
        let matchCount = 0;
        let totalCount = 0;

        Object.entries(categoryDecisions).forEach(([category, userStance]) => {
            // Simple matching: if party has a defined stance for this category
            // In a real app, this would be more granular (per issue)
            // Here we assume the category stance applies to the specific issue

            // Fallback: if party stance is undefined for category, assume neutral
            const partyStance = party.stances[category] || 'neutral';

            if (userStance === partyStance) {
                matchCount += 1;
            } else if (userStance === 'neutral' || partyStance === 'neutral') {
                matchCount += 0.5; // Partial match
            }

            totalCount += 1;
        });

        const score = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 50;

        return {
            party,
            score
        };
    });

    return results.sort((a, b) => b.score - a.score);
}
