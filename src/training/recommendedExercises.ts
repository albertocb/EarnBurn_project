import { exercises } from '../data/exercises';

export type SplitStrategy = 'Full Body' | 'Upper/Lower' | 'PPL' | 'Push/Pull/Legs';

interface RecommendationParams {
    splitStrategy: string;
    focus?: string;
    sessionsPerWeek?: number;
}

const byName = new Map(exercises.map((exercise) => [exercise.name, exercise.id]));

function pickFirstExisting(names: string[]): string | null {
    for (const name of names) {
        const id = byName.get(name);
        if (id) return id;
    }
    return null;
}

function compactUnique(ids: (string | null)[]): string[] {
    return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

function getBaseDefaults(): string[] {
    return compactUnique([
        pickFirstExisting(['Pendulum Squat', 'Barbell Squat', 'Leg Press']),
        pickFirstExisting(['Romanian Deadlift', 'Deadlift', 'Hip Thrust']),
        pickFirstExisting(['Pull Up', 'Assisted Pull-Up Machine', 'Lat Pulldown']),
        pickFirstExisting(['Seated Cable Row', 'Dumbbell Row', 'Barbell Row']),
        pickFirstExisting(['Incline Bench Press', 'Bench Press', 'Incline Dumbbell Press']),
        pickFirstExisting(['Overhead Press']),
        pickFirstExisting(['Lateral Raise']),
        pickFirstExisting(['Bicep Curl']),
        pickFirstExisting(['Triceps Pushdown']),
        pickFirstExisting(['Double Leg Drop (Abs)']),
        pickFirstExisting(['Leg Curl']),
        pickFirstExisting(['Calf Raise']),
    ]);
}

function getUpperLowerDefaults(): string[] {
    return compactUnique([
        ...getBaseDefaults(),
        pickFirstExisting(['Incline Dumbbell Press', 'Bench Press']),
        pickFirstExisting(['Barbell Row', 'Dumbbell Row']),
        pickFirstExisting(['Face Pull']),
        pickFirstExisting(['Leg Extension']),
    ]);
}

function getPplDefaults(): string[] {
    return compactUnique([
        ...getBaseDefaults(),
        pickFirstExisting(['Decline Bench Press', 'Cable Fly']),
        pickFirstExisting(['Close-Grip Bench Press']),
        pickFirstExisting(['Lat Prayer', 'Face Pull']),
        pickFirstExisting(['Barbell Row', 'Pendlay Row']),
        pickFirstExisting(['Bulgarian Split Squat', 'Front Squat']),
        pickFirstExisting(['Leg Extension']),
    ]);
}

export function getRecommendedExerciseIds(params: RecommendationParams): string[] {
    const normalizedSplit = params.splitStrategy === 'Push/Pull/Legs' ? 'PPL' : params.splitStrategy;
    const defaults = normalizedSplit === 'Upper/Lower'
        ? getUpperLowerDefaults()
        : normalizedSplit === 'PPL'
            ? getPplDefaults()
            : getBaseDefaults();

    const sessionsBump = params.sessionsPerWeek && params.sessionsPerWeek >= 6
        ? compactUnique([
            ...defaults,
            pickFirstExisting(['Face Pull']),
            pickFirstExisting(['Leg Extension']),
        ])
        : defaults;

    if (params.focus === 'Strength') {
        return compactUnique([
            pickFirstExisting(['Barbell Squat', 'Front Squat', 'Pendulum Squat']),
            pickFirstExisting(['Bench Press', 'Incline Bench Press']),
            pickFirstExisting(['Deadlift', 'Romanian Deadlift']),
            pickFirstExisting(['Overhead Press']),
            pickFirstExisting(['Barbell Row', 'Pull Up']),
            ...sessionsBump,
        ]);
    }

    return sessionsBump;
}

export function getRecommendationAutoKey(params: RecommendationParams): string {
    return [params.splitStrategy, params.focus ?? '', params.sessionsPerWeek ?? ''].join('|');
}
