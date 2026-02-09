import { create } from 'zustand';

export interface DraftExercise {
    id: string;
    name: string;
    description: string;
    prescription: string;
}

interface DraftWorkout {
    title: string;
    week: string;
    dayId: string;
    dayName: string;
    isDeload?: boolean;
    exercises: DraftExercise[];
}

interface WorkoutDraftState {
    draft: DraftWorkout | null;
    setDraft: (draft: DraftWorkout) => void;
    clearDraft: () => void;
}

export const useWorkoutDraftStore = create<WorkoutDraftState>((set) => ({
    draft: null,
    setDraft: (draft) => set({ draft }),
    clearDraft: () => set({ draft: null }),
}));
