CREATE TABLE `split_days` (
	`id` text PRIMARY KEY NOT NULL,
	`split_id` text NOT NULL,
	`day_index` integer NOT NULL,
	`name` text NOT NULL,
	`body_parts` text,
	FOREIGN KEY (`split_id`) REFERENCES `splits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `splits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`days_per_week` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `mesocycles` ADD `split_id` text REFERENCES splits(id);