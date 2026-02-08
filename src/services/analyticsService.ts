import { MetricEntry } from '../store/types';

export interface OneRepMax {
    exerciseName: string;
    weight: number;
    date: string;
    estimated: boolean;
}

export interface VolumeStat {
    date: string; // Week start or Session date
    volume: number; // Tonnage
}

export interface BodyCompStat {
    date: string;
    weight: number;
    leanMass: number;
    fatMass: number;
    bodyFat: number;
}

export const AnalyticsService = {
    /**
     * Calculates Estimated 1RM using Epley Formula: 
     * 1RM = weight * (1 + reps/30)
     */
    calculate1RM: (weight: number, reps: number): number => {
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30));
    },

    /**
     * Processes history to find best 1RM per unique exercise.
     * Takes raw set entries as input.
     */
    getPRs: (sets: { exerciseName: string; weight: number; reps: number; date: string }[]) => {
        const prs: Record<string, OneRepMax> = {};

        sets.forEach(set => {
            const e1rm = AnalyticsService.calculate1RM(set.weight, set.reps);

            if (!prs[set.exerciseName] || e1rm > prs[set.exerciseName].weight) {
                prs[set.exerciseName] = {
                    exerciseName: set.exerciseName,
                    weight: e1rm,
                    date: set.date,
                    estimated: set.reps > 1
                };
            }
        });

        return Object.values(prs);
    },

    /**
     * Computes Body Composition Trends from metrics history.
     */
    getBodyCompTrends: (history: MetricEntry[]): BodyCompStat[] => {
        return history
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(entry => {
                const fatMass = entry.bodyFat ? entry.weight * (entry.bodyFat / 100) : 0;
                const leanMass = entry.weight - fatMass;
                return {
                    date: entry.date,
                    weight: entry.weight,
                    bodyFat: entry.bodyFat,
                    fatMass: parseFloat(fatMass.toFixed(1)),
                    leanMass: parseFloat(leanMass.toFixed(1))
                };
            });
    },

    /**
     * Aggregates Volume (Tonnage) by Week.
     */
    getWeeklyVolume: (sets: { date: string; weight: number; reps: number }[]) => {
        const weekly: Record<string, number> = {};

        sets.forEach(set => {
            // Simple week identifier (ISO-ish) - roughly grouping by 7 days or Calendar Week
            const date = new Date(set.date);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];

            if (!weekly[weekStart]) weekly[weekStart] = 0;
            weekly[weekStart] += set.weight * set.reps;
        });

        return Object.entries(weekly)
            .map(([date, volume]) => ({ date, volume }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
};
