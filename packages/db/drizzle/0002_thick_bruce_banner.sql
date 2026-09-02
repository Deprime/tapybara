CREATE TABLE `auth_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expires_at` bigint NOT NULL,
	`created_at` bigint NOT NULL DEFAULT 0,
	CONSTRAINT `auth_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_tokens_token_uq` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `auth_tokens` ADD CONSTRAINT `auth_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `auth_tokens_user_id_idx` ON `auth_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_tokens_expires_at_idx` ON `auth_tokens` (`expires_at`);