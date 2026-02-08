CREATE TABLE `athlete_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`age` integer NOT NULL,
	`height` real NOT NULL,
	`weight` real NOT NULL,
	`body_fat` real,
	`units` text DEFAULT 'metric' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `body_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`weight` real NOT NULL,
	`body_fat` real
);
--> statement-breakpoint
CREATE TABLE `macrocycles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`is_active` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `mesocycles` (
	`id` text PRIMARY KEY NOT NULL,
	`macrocycle_id` text NOT NULL,
	`order` integer NOT NULL,
	`name` text NOT NULL,
	`focus` text NOT NULL,
	`weeks` integer NOT NULL,
	`progression_model` text NOT NULL,
	`auto_deload` integer DEFAULT false NOT NULL,
	`volume_ramp` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`macrocycle_id`) REFERENCES `macrocycles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `microcycles` (
	`id` text PRIMARY KEY NOT NULL,
	`mesocycle_id` text NOT NULL,
	`order` integer NOT NULL,
	`is_deload` integer DEFAULT false,
	FOREIGN KEY (`mesocycle_id`) REFERENCES `mesocycles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `planned_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`order` integer NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`target_rpe` real,
	FOREIGN KEY (`session_id`) REFERENCES `planned_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `planned_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`microcycle_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`microcycle_id`) REFERENCES `microcycles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `planned_set_schemes` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`num_sets` integer NOT NULL,
	`target_reps` text NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `planned_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `set_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_id` text NOT NULL,
	`exercise_name` text NOT NULL,
	`set_order` integer NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real,
	`is_warmup` integer DEFAULT false,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`planned_session_id` text,
	`date` text NOT NULL,
	`duration_seconds` integer,
	`rpe` real,
	`notes` text
);
