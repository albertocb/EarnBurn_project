import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { macrocycles, mesocycles, microcycles, plannedExercises, plannedSessions, plannedSetSchemes } from '../db/schema';
import { Macrocycle, Mesocycle } from '../store/types';

export const programRepository = {
    getAllMacrocycles: async (): Promise<Macrocycle[]> => {
        // We need to fetch macros and their mesocycles.
        // Drizzle's `with` (relations) is great, but we defined schema manually.
        // For now, simple separate queries or joins.
        // Let's do a simple fetch since data size is small.

        const macros = await db.select().from(macrocycles);
        const result: Macrocycle[] = [];

        for (const m of macros) {
            const mesos = await db.select().from(mesocycles).where(eq(mesocycles.macrocycleId, m.id));

            // We also need Microcycles if they are part of the Mesocycle object in the Store?
            // Store type `Mesocycle` has `weeks: number`. It doesn't seemingly hold the array of weeks in the type definition in types.ts?
            // Checking types.ts (Step 75): `Mesocycle` interface has `weeks: number`. It does NOT have a `microcycles` array.
            // So we just load the count?
            // Wait, `microcycles` table exists.
            // If the UI expects just `weeks` number, we stick to that for now.

            result.push({
                id: m.id,
                name: m.name,
                startDate: m.startDate,
                mesocycles: mesos.map(meso => ({
                    id: meso.id,
                    name: meso.name,
                    weeks: meso.weeks,
                    focus: meso.focus as any,
                    progressionModel: meso.progressionModel as any,
                    splitStrategy: 'Full Body',
                    sessionsPerWeek: 4,
                    volumePreset: 'Hypertrophy',
                    volumeRamp: meso.volumeRamp ?? false,
                })),
                // Store doesn't have isActive in Macrocycle type explicitly?
                // Checking types.ts: `Macrocycle` has id, name, startDate, mesocycles. No isActive.
                // But programStore has `activeMacrocycleId`.
            });
        }
        return result;
    },

    createMacrocycle: async (macro: Macrocycle) => {
        await db.transaction(async (tx) => {
            await tx.insert(macrocycles).values({
                id: macro.id,
                name: macro.name,
                startDate: macro.startDate,
                isActive: false, // Managed by store logic usually
            });

            // Insert mesos if any
            for (const [index, meso] of macro.mesocycles.entries()) {
                await tx.insert(mesocycles).values({
                    id: meso.id,
                    macrocycleId: macro.id,
                    order: index,
                    name: meso.name,
                    focus: meso.focus,
                    weeks: meso.weeks,
                    progressionModel: meso.progressionModel,
                    autoDeload: true,
                    volumeRamp: meso.volumeRamp,
                });

                // Also create Microcycles for this Meso?
                // If the system expects them to exist in DB.
                // For now, we just store the count in 'weeks'.
                // But if we want to store 'isDeload' status of specific weeks, we should populate `microcycles` table.
                // Let's populate it.
                for (let w = 0; w < meso.weeks; w++) {
                    await tx.insert(microcycles).values({
                        id: `${meso.id}-week-${w}`, // Simple ID generation
                        mesocycleId: meso.id,
                        order: w,
                        isDeload: w === meso.weeks - 1,
                    });
                }
            }
        });
    },

    deleteMacrocycle: async (id: string) => {
        await db.delete(macrocycles).where(eq(macrocycles.id, id));
    },

    addMesocycle: async (macroId: string, meso: Mesocycle, order: number) => {
        await db.transaction(async (tx) => {
            await tx.insert(mesocycles).values({
                id: meso.id,
                macrocycleId: macroId,
                order,
                name: meso.name,
                focus: meso.focus,
                weeks: meso.weeks,
                progressionModel: meso.progressionModel,
                autoDeload: true,
                volumeRamp: meso.volumeRamp
            });

            for (let w = 0; w < meso.weeks; w++) {
                await tx.insert(microcycles).values({
                    id: `${meso.id}-week-${w}`,
                    mesocycleId: meso.id,
                    order: w,
                    isDeload: w === meso.weeks - 1
                });
            }
        });
    },

    getSessionsForMicrocycle: async (microcycleId: string) => {
        return await db.select().from(plannedSessions)
            .where(eq(plannedSessions.microcycleId, microcycleId))
            .orderBy(plannedSessions.dayOfWeek);
    },

    getSessionDetails: async (sessionId: string) => {
        const session = await db.select().from(plannedSessions).where(eq(plannedSessions.id, sessionId)).get();
        if (!session) throw new Error('Session not found');

        const exercises = await db.select().from(plannedExercises)
            .where(eq(plannedExercises.sessionId, sessionId))
            .orderBy(plannedExercises.order);

        const resultExercises = [];
        for (const ex of exercises) {
            const sets = await db.select().from(plannedSetSchemes)
                .where(eq(plannedSetSchemes.exerciseId, ex.id));
            resultExercises.push({ ...ex, sets });
        }

        return { session, exercises: resultExercises };
    }
};
