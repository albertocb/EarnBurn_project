export interface AthleteStats {
    name: string;
    age: number;
    height: number; // in cm
    weight: number; // in kg
    bodyFat: number; // percentage
    units: 'metric' | 'imperial';
}

export interface MetricEntry {
    date: string; // ISO date
    weight: number;
    bodyFat: number;
}

export type Focus = 'Hypertrophy' | 'Strength' | 'Peaking';

export interface Mesocycle {
    id: string;
    name: string;
    weeks: number; // 4-8
    focus: Focus;
    progressionModel: 'Linear' | 'Double Progression' | 'RPE Stop';
    splitId?: string; // ID of the split template used
    splitStrategy: 'Full Body' | 'Upper/Lower' | 'PPL';
    sessionsPerWeek: number; // 3-7
    volumePreset: 'Hypertrophy' | 'Strength';
    autoDeload: boolean;
    volumeRamp: boolean; // Simple mock
    exercises?: string[]; // Array of exercise IDs
}

export interface Macrocycle {
    id: string;
    name: string;
    startDate: string;
    mesocycles: Mesocycle[];
}
