CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type_id` enum('parent_referral','child_referral','friend_registered') NOT NULL,
	`user_id` int NOT NULL,
	`metadata` json,
	`rewards` json,
	`title` varchar(200),
	`description` varchar(1000),
	`claimed_at` bigint,
	`created_at` bigint NOT NULL DEFAULT 0,
	`updated_at` bigint NOT NULL DEFAULT 0,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `alerts_user_id_idx` ON `alerts` (`user_id`);