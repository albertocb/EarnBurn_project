/*
import { and, eq } from 'drizzle-orm';
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

export const workoutDayStatusRepository = {
    // database migration now handles table creation
    // ensureTable removed

    setDayStatus: async (data: WorkoutDayStatusData) => {
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
        const result = await db.select()
            .from(workoutDayStatus)
            .where(and(eq(workoutDayStatus.week, week), eq(workoutDayStatus.dayId, dayId)))
            .limit(1);
        return result[0] || null;
    },

    getStatusesForWeek: async (week: string) => {
        const results = await db.select()
            .from(workoutDayStatus)
            .where(eq(workoutDayStatus.week, week));

        // Return as map for easy lookup: Record<dayId, statusData>
        const map: Record<string, WorkoutDayStatusData> = {};
        for (const r of results) {
            map[r.dayId] = r as WorkoutDayStatusData;
        }
        return map;
    }
};
*/
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
    if (!ensurePromise) {
        ensurePromise = (async () => {
            // If this throws, the promise rejects and callers see the error.
            // Also: if it fails, we reset ensurePromise so we can retry later.
            try {
                await db.run(sql`
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
            } catch (e) {
                ensurePromise = null;
                throw e;
            }
        })();
    }
    await ensurePromise;
}

/*
// One-time init gate (prevents race conditions)
let ensured = false;
let ensurePromise: Promise<void> | null = null;

async function ensureReady() {
    if (ensured) return;
    if (!ensurePromise) {
        ensurePromise = db.run(sql`
      CREATE TABLE IF NOT EXISTS workout_day_status (
        week TEXT NOT NULL,
        day_id TEXT NOT NULL,
        status TEXT NOT NULL,
        total_exercises INTEGER NOT NULL,
        completed_exercises INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        PRIMARY KEY (week, day_id)
      );
    `).then(() => {
            ensured = true;
        });
    }
    await ensurePromise;
}*/

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
    }
};
