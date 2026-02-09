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
