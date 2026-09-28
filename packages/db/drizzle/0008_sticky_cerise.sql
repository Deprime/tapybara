UPDATE `units` SET `skin_uuid` = '' WHERE `skin_uuid` IS NULL;--> statement-breakpoint
ALTER TABLE `units` MODIFY COLUMN `skin_uuid` varchar(28) NOT NULL DEFAULT '';
