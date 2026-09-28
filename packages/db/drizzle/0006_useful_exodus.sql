ALTER TABLE `units` ADD `name` varchar(20);--> statement-breakpoint
UPDATE `units` SET `name` = CONCAT('Капибара #', `id`);--> statement-breakpoint
ALTER TABLE `units` MODIFY `name` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_seen_at` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `inactivity_reminder_at` bigint;--> statement-breakpoint
CREATE INDEX `users_inactivity_idx` ON `users` (`inactivity_reminder_at`,`last_seen_at`);
