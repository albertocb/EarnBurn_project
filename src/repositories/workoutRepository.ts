import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { setEntries, workoutSessions } from '../db/schema';

// Types for workout logging
export interface WorkoutSessionData {
    id: string;
    date: string;
    durationSeconds?: number;
    rpe?: number;
    notes?: string;
}

export interface SetEntryData {
    id: string;
    workoutSessionId: string;
    exerciseName: string;
    setOrder: number;
    weight: number;
    reps: number;
    rpe?: number;
    isWarmup: boolean;
}

export const workoutRepository = {
    createSession: async (session: WorkoutSessionData) => {
        await db.insert(workoutSessions).values({
            id: session.id,
            date: session.date,
            durationSeconds: session.durationSeconds,
            rpe: session.rpe,
            notes: session.notes,
        });
    },

    addSet: async (set: SetEntryData) => {
        await db.insert(setEntries).values({
            id: set.id,
            workoutSessionId: set.workoutSessionId,
            exerciseName: set.exerciseName,
            setOrder: set.setOrder,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
            isWarmup: set.isWarmup,
        });
    },

    getSessionSets: async (sessionId: string) => {
        return await db.select().from(setEntries).where(eq(setEntries.workoutSessionId, sessionId)).orderBy(setEntries.setOrder);
    },

    // For history/analytics
    getAllSessions: async () => {
        // return sessions ordered by date
        return await db.select().from(workoutSessions).orderBy(desc(workoutSessions.date));
    }
};
