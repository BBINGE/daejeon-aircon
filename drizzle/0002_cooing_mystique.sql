ALTER TABLE `leads` ADD `consent_version` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `consent_at` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `closed_at` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `delete_after` text;--> statement-breakpoint
CREATE INDEX `idx_leads_delete_after` ON `leads` (`delete_after`);