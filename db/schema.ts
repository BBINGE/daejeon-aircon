import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  region: text("region").notNull(),
  inquiryType: text("inquiry_type").notNull(),
  airconType: text("aircon_type").notNull(),
  phone: text("phone").notNull(),
  sourceUrl: text("source_url"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [
  index("idx_leads_created_at").on(table.createdAt),
  index("idx_leads_status_created_at").on(table.status, table.createdAt),
]);
