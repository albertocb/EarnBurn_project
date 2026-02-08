import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { athleteProfile, bodyMetrics } from '../db/schema';
import { AthleteStats, MetricEntry } from '../store/types';

export const athleteRepository = {
    getProfile: async (): Promise<AthleteStats | null> => {
        const result = await db.select().from(athleteProfile).limit(1);
        if (result.length === 0) return null;

        // Map DB schema to Store type (if needed, but they match mostly)
        // DB has id, Store doesn't explicitly track ID for singleton
        const p = result[0];
        return {
            age: p.age,
            height: p.height,
            weight: p.weight,
            bodyFat: p.bodyFat ?? 0,
            units: p.units as 'metric' | 'imperial',
        };
    },

    updateProfile: async (stats: AthleteStats) => {
        // Check if exists
        const existing = await db.select().from(athleteProfile).limit(1);

        if (existing.length === 0) {
            await db.insert(athleteProfile).values({
                age: stats.age,
                height: stats.height,
                weight: stats.weight,
                bodyFat: stats.bodyFat,
                units: stats.units,
            });
        } else {
            await db.update(athleteProfile).set({
                age: stats.age,
                height: stats.height,
                weight: stats.weight,
                bodyFat: stats.bodyFat,
                units: stats.units,
            }).where(eq(athleteProfile.id, existing[0].id));
        }
    },

    getHistory: async (): Promise<MetricEntry[]> => {
        const result = await db.select().from(bodyMetrics).orderBy(desc(bodyMetrics.date));
        return result.map(r => ({
            date: r.date,
            weight: r.weight,
            bodyFat: r.bodyFat ?? 0,
        }));
    },

    addMetric: async (entry: MetricEntry) => {
        await db.insert(bodyMetrics).values({
            date: entry.date,
            weight: entry.weight,
            bodyFat: entry.bodyFat,
        });
    },
};
