import { create } from 'zustand';
import { athleteRepository } from '../repositories/athleteRepository';
import { AthleteStats, MetricEntry } from './types';

interface UserState {
    profile: AthleteStats;
    history: MetricEntry[];
    init: () => Promise<void>;
    updateProfile: (updates: Partial<AthleteStats>) => Promise<void>;
    addMetric: (entry: MetricEntry) => Promise<void>;
    reset: () => void;
}

const DEFAULT_PROFILE: AthleteStats = {
    name: 'Campeón',
    age: 25,
    height: 175,
    weight: 75,
    bodyFat: 15,
    units: 'metric',
};

export const useUserStore = create<UserState>((set, get) => ({
    profile: DEFAULT_PROFILE,
    history: [],

    init: async () => {
        try {
            const profile = await athleteRepository.getProfile();
            const history = await athleteRepository.getHistory();
            set({
                profile: profile || DEFAULT_PROFILE,
                history: history
            });
        } catch (e) {
            console.error("Failed to init user store", e);
        }
    },

    updateProfile: async (updates) => {
        const current = get().profile;
        const newProfile = { ...current, ...updates };
        // Optimistic update? Or wait? 
        // Let's wait for safety or just do it.
        set({ profile: newProfile });
        await athleteRepository.updateProfile(newProfile);
    },

    addMetric: async (entry) => {
        // Optimistic
        set((state) => ({ history: [entry, ...state.history] }));
        await athleteRepository.addMetric(entry);
    },

    reset: () => {
        set({ profile: DEFAULT_PROFILE, history: [] });
    }
}));
