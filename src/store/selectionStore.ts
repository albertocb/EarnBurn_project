import { create } from 'zustand';

interface SelectionState {
    selectedExerciseIds: string[];
    toggleExercise: (id: string) => void;
    setSelection: (ids: string[]) => void;
    clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
    selectedExerciseIds: [],
    toggleExercise: (id) =>
        set((state) => {
            const isSelected = state.selectedExerciseIds.includes(id);
            return {
                selectedExerciseIds: isSelected
                    ? state.selectedExerciseIds.filter((exId) => exId !== id)
                    : [...state.selectedExerciseIds, id],
            };
        }),
    setSelection: (ids) => set({ selectedExerciseIds: ids }),
    clearSelection: () => set({ selectedExerciseIds: [] }),
}));
