CREATE INDEX `idx_leads_created_at` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_leads_status_created_at` ON `leads` (`status`,`created_at`);