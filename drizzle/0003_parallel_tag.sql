PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_athlete_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT 'Campeón' NOT NULL,
	`age` integer NOT NULL,
	`height` real NOT NULL,
	`weight` real NOT NULL,
	`body_fat` real,
	`units` text DEFAULT 'metric' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_athlete_profile`("id", "name", "age", "height", "weight", "body_fat", "units") SELECT "id", "name", "age", "height", "weight", "body_fat", "units" FROM `athlete_profile`;--> statement-breakpoint
DROP TABLE `athlete_profile`;--> statement-breakpoint
ALTER TABLE `__new_athlete_profile` RENAME TO `athlete_profile`;--> statement-breakpoint
PRAGMA foreign_keys=ON;