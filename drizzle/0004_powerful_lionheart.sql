CREATE TABLE IF NOT EXISTS `workout_day_status` (
	`week` text NOT NULL,
	`day_id` text NOT NULL,
	`status` text NOT NULL,
	`total_exercises` integer NOT NULL,
	`completed_exercises` integer NOT NULL,
	`completed_at` text NOT NULL,
	PRIMARY KEY(`week`, `day_id`)
);
--> statement-breakpoint
ALTER TABLE `workout_sessions` ADD `duration_ms` integer;