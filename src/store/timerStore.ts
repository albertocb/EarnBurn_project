import { create } from 'zustand';

interface TimerState {
    isRunning: boolean;
    startedAtMs: number | null;
    accumulatedMs: number;

    start: () => void;
    pause: () => void;
    reset: () => void;
    toggle: () => void;
    getElapsedMs: () => number;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    isRunning: false,
    startedAtMs: null,
    accumulatedMs: 0,

    start: () => {
        const { isRunning } = get();
        if (isRunning) return;
        set({
            isRunning: true,
            startedAtMs: Date.now(),
        });
    },

    pause: () => {
        const { isRunning, startedAtMs, accumulatedMs } = get();
        if (!isRunning || startedAtMs === null) return;

        const now = Date.now();
        const elapsedSinceStart = now - startedAtMs;

        set({
            isRunning: false,
            startedAtMs: null,
            accumulatedMs: accumulatedMs + elapsedSinceStart,
        });
    },

    reset: () => {
        const { isRunning } = get();
        set({
            isRunning, // Keep running state or reset? Requirement says reset to 0. Usually reset implies stop.
            // Requirement A: "reset(): startedAtMs = isRunning ? Date.now() : null; accumulatedMs = 0"
            // Let's follow requirement A strictly, but usually reset stops the timer too.
            // Actually, if we reset while running, we want to restart counting from 0 immediately.
            startedAtMs: isRunning ? Date.now() : null,
            accumulatedMs: 0,
        });
    },

    toggle: () => {
        const { isRunning } = get();
        if (isRunning) {
            get().pause();
        } else {
            get().start();
        }
    },

    getElapsedMs: () => {
        const { isRunning, startedAtMs, accumulatedMs } = get();
        if (isRunning && startedAtMs !== null) {
            return accumulatedMs + (Date.now() - startedAtMs);
        }
        return accumulatedMs;
    }
}));
