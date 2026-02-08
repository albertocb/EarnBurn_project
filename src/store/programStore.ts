import { create } from 'zustand';
import { programRepository } from '../repositories/programRepository';
import { Macrocycle, Mesocycle } from './types';

interface ProgramState {
    activeMacrocycleId: string | null;
    macrocycles: Macrocycle[];
    init: () => Promise<void>;
    createMacrocycle: (name: string) => Promise<void>;
    addMesocycle: (macrocycleId: string, meso: Mesocycle) => Promise<void>;
    deleteMacrocycle: (id: string) => Promise<void>;
}

export const useProgramStore = create<ProgramState>((set, get) => ({
    activeMacrocycleId: null,
    macrocycles: [],

    init: async () => {
        try {
            const macrocycles = await programRepository.getAllMacrocycles();
            // Determine active/latest macrocycle ?
            // For now just pick the first one or logic based on dates.
            const activeId = macrocycles.length > 0 ? macrocycles[0].id : null;
            set({ macrocycles, activeMacrocycleId: activeId });
        } catch (e) {
            console.error("Failed to init program store", e);
        }
    },

    createMacrocycle: async (name) => {
        const newMacro: Macrocycle = {
            id: Date.now().toString(),
            name,
            startDate: new Date().toISOString(),
            mesocycles: [],
        };

        // Optimistic
        set((state) => ({
            macrocycles: [...state.macrocycles, newMacro],
            activeMacrocycleId: newMacro.id,
        }));

        await programRepository.createMacrocycle(newMacro);
    },

    addMesocycle: async (macrocycleId, meso) => {
        const state = get();
        const macro = state.macrocycles.find(m => m.id === macrocycleId);
        if (!macro) return;

        // Calculate order based on existing mesos
        const order = macro.mesocycles.length;

        // Optimistic
        set((state) => ({
            macrocycles: state.macrocycles.map((m) =>
                m.id === macrocycleId
                    ? { ...m, mesocycles: [...m.mesocycles, meso] }
                    : m
            ),
        }));

        await programRepository.addMesocycle(macrocycleId, meso, order);
    },

    deleteMacrocycle: async (id) => {
        set((state) => ({
            macrocycles: state.macrocycles.filter((m) => m.id !== id),
            activeMacrocycleId: state.activeMacrocycleId === id ? null : state.activeMacrocycleId,
        }));
        await programRepository.deleteMacrocycle(id);
    },
}));
