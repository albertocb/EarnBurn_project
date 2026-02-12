import { create } from 'zustand';
import {
    getRecommendationAutoKey,
    getRecommendedExerciseIds,
} from '../training/recommendedExercises';

type SelectionOrigin = 'auto' | 'manual';

interface RecommendationParams {
    splitStrategy: string;
    focus?: string;
    sessionsPerWeek?: number;
}

interface SelectionState {
    selectedExerciseIds: string[];
    selectionOrigin: SelectionOrigin;
    autoKey: string | null;
    toggleExercise: (id: string) => void;
    setSelectedExercises: (ids: string[], origin?: SelectionOrigin, autoKey?: string | null) => void;
    markSelectionManual: () => void;
    applyRecommendedDefaults: (params: RecommendationParams) => void;
    clearSelection: () => void;
    resetSelectionState: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
    selectedExerciseIds: [],
    selectionOrigin: 'manual',
    autoKey: null,
    toggleExercise: (id) =>
        set((state) => {
            const isSelected = state.selectedExerciseIds.includes(id);
            return {
                selectedExerciseIds: isSelected
                    ? state.selectedExerciseIds.filter((exId) => exId !== id)
                    : [...state.selectedExerciseIds, id],
                selectionOrigin: 'manual',
                autoKey: null,
            };
        }),
    setSelectedExercises: (ids, origin = 'manual', autoKey = null) =>
        set({ selectedExerciseIds: ids, selectionOrigin: origin, autoKey: origin === 'auto' ? autoKey : null }),
    markSelectionManual: () => set({ selectionOrigin: 'manual', autoKey: null }),
    applyRecommendedDefaults: (params) => {
        const nextIds = getRecommendedExerciseIds(params);
        const key = getRecommendationAutoKey(params);
        set({
            selectedExerciseIds: nextIds,
            selectionOrigin: 'auto',
            autoKey: key,
        });
    },
    clearSelection: () => set({ selectedExerciseIds: [], selectionOrigin: 'manual', autoKey: null }),
    resetSelectionState: () => set({ selectedExerciseIds: [], selectionOrigin: 'manual', autoKey: null }),
}));
