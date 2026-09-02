CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrer_id` int NOT NULL,
	`referee_id` int NOT NULL,
	`created_at` bigint NOT NULL DEFAULT 0,
	`claimed_at` bigint NOT NULL DEFAULT 0,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referee_id_uq` UNIQUE(`referee_id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`rarity` enum('base','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'base',
	`exp` int NOT NULL DEFAULT 0,
	`balance_sol` decimal(12,2) NOT NULL DEFAULT '0',
	`points` int NOT NULL DEFAULT 0,
	`status` enum('harvest','pre_party','party','staking') NOT NULL DEFAULT 'harvest',
	`generation` int NOT NULL DEFAULT 0,
	`harvest_at` bigint NOT NULL DEFAULT 0,
	`created_at` bigint NOT NULL DEFAULT 0,
	`updated_at` bigint NOT NULL DEFAULT 0,
	CONSTRAINT `units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_uuid_uq` UNIQUE(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int,
	`telegram_id` bigint NOT NULL,
	`uuid` varchar(36) NOT NULL,
	`username` varchar(64) NOT NULL,
	`balance` decimal(12,2) NOT NULL DEFAULT '0',
	`balance_sol` decimal(12,2) NOT NULL DEFAULT '0',
	`wallet_usdt` varchar(128),
	`created_at` bigint NOT NULL DEFAULT 0,
	`updated_at` bigint NOT NULL DEFAULT 0,
	`blocked_at` bigint,
	`block_reason` varchar(255),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_telegram_id_uq` UNIQUE(`telegram_id`),
	CONSTRAINT `users_uuid_uq` UNIQUE(`uuid`)
);
--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referee_id_users_id_fk` FOREIGN KEY (`referee_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `units` ADD CONSTRAINT `units_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `referrals_referrer_id_idx` ON `referrals` (`referrer_id`);--> statement-breakpoint
CREATE INDEX `units_user_id_idx` ON `units` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_parent_id_idx` ON `users` (`parent_id`);