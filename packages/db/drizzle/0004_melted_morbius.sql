ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_uq` UNIQUE(`user_id`);--> statement-breakpoint
DROP INDEX `sessions_user_id_idx` ON `sessions`;