import { db } from './client';
import {
    athleteProfile, bodyMetrics,
    macrocycles, mesocycles, microcycles,
    plannedExercises,
    plannedSessions,
    plannedSetSchemes,
    setEntries,
    workoutSessions
} from './schema';

export const resetDatabase = async () => {
    try {
        await db.transaction(async (tx) => {
            // Delete in order of dependencies (child first)
            await tx.delete(setEntries);
            await tx.delete(workoutSessions);

            await tx.delete(plannedSetSchemes);
            await tx.delete(plannedExercises);
            await tx.delete(plannedSessions);

            await tx.delete(microcycles);
            await tx.delete(mesocycles);
            await tx.delete(macrocycles);

            await tx.delete(bodyMetrics);
            await tx.delete(athleteProfile);
        });
        console.log('Database reset complete');
    } catch (e) {
        console.error('Failed to reset database', e);
        throw e;
    }
};
