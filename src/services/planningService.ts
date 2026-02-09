import { Mesocycle } from '../store/types';

// Types for internal planning
export interface SplitDay {
    dayIndex: number;
    name: string;
    bodyParts: string;
}

export interface SplitTemplate {
    id: string;
    name: string;
    daysPerWeek: number;
    days: SplitDay[];
}

// Hardcoded splits for seeding/fallback
export const DEFAULT_SPLIT: SplitTemplate = {
    id: 'ppl_6',
    name: 'Push Pull Legs (6 Day)',
    daysPerWeek: 6,
    days: [
        { dayIndex: 0, name: 'Push A', bodyParts: 'Chest, Shoulders, Triceps' },
        { dayIndex: 1, name: 'Pull A', bodyParts: 'Back, Biceps, Rear Delt' },
        { dayIndex: 2, name: 'Legs A', bodyParts: 'Quads, Hamstrings, Calves' },
        { dayIndex: 3, name: 'Push B', bodyParts: 'Chest, Shoulders, Triceps' },
        { dayIndex: 4, name: 'Pull B', bodyParts: 'Back, Biceps, Rear Delt' },
        { dayIndex: 5, name: 'Legs B', bodyParts: 'Quads, Hamstrings, Calves' },
    ]
};

export const PlanningService = {
    /**
     * Generates Microcycle structures for a Mesocycle.
     * Handles auto-deload logic.
     */
    generateMicrocycles: (meso: Mesocycle) => {
        const micros = [];
        // Generate N + 1 weeks (Work weeks + 1 Deload)
        const totalWeeks = meso.weeks + 1;

        for (let i = 0; i < totalWeeks; i++) {
            const isDeload = i === totalWeeks - 1; // Last week is ALWAYS deload

            micros.push({
                order: i,
                isDeload
            });
        }
        return micros;
    },

    /**
     * Generates Planned Sessions for a Microcycle based on the Split.
     * Applies Deload adjustments if needed.
     */
    generateSessionsForMicrocycle: (microId: string, isDeload: boolean, split: SplitTemplate) => {
        const sessions = split.days.map(day => {
            // In a real app, we would select exercises here.
            // For this phase, we just create the shell "PlannedSession".
            return {
                microcycleId: microId,
                dayOfWeek: day.dayIndex,
                name: day.name + (isDeload ? ' (Deload)' : ''),
                // We could store bodyParts or other metadata if schema supported it
            };
        });
        return sessions;
    },

    /**
     * Applies deload rules to a set scheme (future use).
     * Strategy: Reduce Sets by 50% or Intensity by 10%.
     */
    applyDeloadToScheme: (scheme: { numSets: number, targetRpe?: number }) => {
        // Example logic
        return {
            ...scheme,
            numSets: Math.max(1, Math.floor(scheme.numSets * 0.5)), // 50% volume cut
            // OR reduce RPE
            targetRpe: scheme.targetRpe ? Math.max(5, scheme.targetRpe - 2) : undefined
        };
    }
};
