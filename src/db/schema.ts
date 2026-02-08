import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// --- User & Metrics ---
export const athleteProfile = sqliteTable('athlete_profile', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().default('Campeón'),
    age: integer('age').notNull(),
    height: real('height').notNull(), // cm
    weight: real('weight').notNull(), // kg
    bodyFat: real('body_fat'), // percentage
    units: text('units', { enum: ['metric', 'imperial'] }).notNull().default('metric'),
});

export const bodyMetrics = sqliteTable('body_metrics', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(), // ISO string
    weight: real('weight').notNull(),
    bodyFat: real('body_fat'),
});

// --- Program Structure ---
export const macrocycles = sqliteTable('macrocycles', {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(),
    startDate: text('start_date').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(false),
});

export const mesocycles = sqliteTable('mesocycles', {
    id: text('id').primaryKey(),
    macrocycleId: text('macrocycle_id').references(() => macrocycles.id, { onDelete: 'cascade' }).notNull(),
    order: integer('order').notNull(),
    name: text('name').notNull(), // "Block 1" etc
    focus: text('focus').notNull(), // Hypertrophy, Strength, Peaking
    weeks: integer('weeks').notNull(),
    progressionModel: text('progression_model').notNull(),
    splitId: text('split_id').references(() => splits.id), // Link to the split template
    autoDeload: integer('auto_deload', { mode: 'boolean' }).notNull().default(false),
    volumeRamp: integer('volume_ramp', { mode: 'boolean' }).notNull().default(false),
});

// --- Templates ---
export const splits = sqliteTable('splits', {
    id: text('id').primaryKey(), // e.g., 'ppl_6'
    name: text('name').notNull(), // 'Push Pull Legs (6 Day)'
    daysPerWeek: integer('days_per_week').notNull(),
});

export const splitDays = sqliteTable('split_days', {
    id: text('id').primaryKey(),
    splitId: text('split_id').references(() => splits.id, { onDelete: 'cascade' }).notNull(),
    dayIndex: integer('day_index').notNull(), // 0-6 (0 = Monday usually, or just order)
    name: text('name').notNull(), // "Push A"
    bodyParts: text('body_parts'), // "Chest, Quad, Calves"
});

// Expanded: Microcycles (Weeks)
export const microcycles = sqliteTable('microcycles', {
    id: text('id').primaryKey(),
    mesocycleId: text('mesocycle_id').references(() => mesocycles.id, { onDelete: 'cascade' }).notNull(),
    order: integer('order').notNull(), // Week number (0-indexed or 1-indexed)
    isDeload: integer('is_deload', { mode: 'boolean' }).default(false),
});

// --- Workout Templates ---
export const plannedSessions = sqliteTable('planned_sessions', {
    id: text('id').primaryKey(),
    microcycleId: text('microcycle_id').references(() => microcycles.id, { onDelete: 'cascade' }).notNull(),
    dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sun-Sat) or just order
    name: text('name').notNull(), // "Push A"
});

export const plannedExercises = sqliteTable('planned_exercises', {
    id: text('id').primaryKey(),
    sessionId: text('session_id').references(() => plannedSessions.id, { onDelete: 'cascade' }).notNull(),
    order: integer('order').notNull(),
    exerciseId: text('exercise_id').notNull(), // Reference to some exercise DB (future) or just string name
    name: text('name').notNull(),
    targetRpe: real('target_rpe'),
});

export const plannedSetSchemes = sqliteTable('planned_set_schemes', {
    id: text('id').primaryKey(),
    exerciseId: text('exercise_id').references(() => plannedExercises.id, { onDelete: 'cascade' }).notNull(),
    numSets: integer('num_sets').notNull(),
    targetReps: text('target_reps').notNull(), // "8-12" or "5"
});

// --- Workout Logs ---
export const workoutSessions = sqliteTable('workout_sessions', {
    id: text('id').primaryKey(),
    plannedSessionId: text('planned_session_id'), // Optional link to plan
    date: text('date').notNull(),
    durationSeconds: integer('duration_seconds'),
    rpe: real('rpe'), // Session RPE
    notes: text('notes'),
});

export const setEntries = sqliteTable('set_entries', {
    id: text('id').primaryKey(),
    workoutSessionId: text('workout_session_id').references(() => workoutSessions.id, { onDelete: 'cascade' }).notNull(),
    exerciseName: text('exercise_name').notNull(),
    setOrder: integer('set_order').notNull(),
    weight: real('weight').notNull(),
    reps: integer('reps').notNull(),
    rpe: real('rpe'),
    isWarmup: integer('is_warmup', { mode: 'boolean' }).default(false),
});
