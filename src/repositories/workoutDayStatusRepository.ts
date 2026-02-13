import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { workoutDayStatus } from '../db/schema';

export interface WorkoutDayStatusData {
    week: string;
    dayId: string;
    status: 'completed' | 'partial';
    totalExercises: number;
    completedExercises: number;
    completedAt: string;
}

let ensured = false;
let ensurePromise: Promise<void> | null = null;

async function ensureReady() {
    if (ensured) return;

    // Create table if missing (matches schema.ts)
    // Fire-and-forget (sync-friendly driver assumption)
    db.run(sql`
        CREATE TABLE IF NOT EXISTS workout_day_status (
            week TEXT NOT NULL,
            day_id TEXT NOT NULL,
            status TEXT NOT NULL,
            total_exercises INTEGER NOT NULL,
            completed_exercises INTEGER NOT NULL,
            completed_at TEXT NOT NULL,
            PRIMARY KEY (week, day_id)
        );
    `);

    ensured = true;
}

export const workoutDayStatusRepository = {
    ensureTable: async () => {
        await ensureReady();
    },

    setDayStatus: async (data: WorkoutDayStatusData) => {
        await ensureReady();
        await db.insert(workoutDayStatus)
            .values({
                week: data.week,
                dayId: data.dayId,
                status: data.status,
                totalExercises: data.totalExercises,
                completedExercises: data.completedExercises,
                completedAt: data.completedAt,
            })
            .onConflictDoUpdate({
                target: [workoutDayStatus.week, workoutDayStatus.dayId],
                set: {
                    status: data.status,
                    totalExercises: data.totalExercises,
                    completedExercises: data.completedExercises,
                    completedAt: data.completedAt,
                },
            });
    },

    getDayStatus: async (week: string, dayId: string) => {
        await ensureReady();
        const result = await db.select()
            .from(workoutDayStatus)
            .where(and(eq(workoutDayStatus.week, week), eq(workoutDayStatus.dayId, dayId)))
            .limit(1);
        return result[0] || null;
    },

    getStatusesForWeek: async (week: string) => {
        await ensureReady();
        const results = await db.select()
            .from(workoutDayStatus)
            .where(eq(workoutDayStatus.week, week));

        const map: Record<string, WorkoutDayStatusData> = {};
        for (const r of results) map[r.dayId] = r as WorkoutDayStatusData;
        return map;
    },

    getAllStatuses: async () => {
        await ensureReady();
        const results = await db.select().from(workoutDayStatus);
        return results as WorkoutDayStatusData[];
    }
};
