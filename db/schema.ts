import { pgTable, text, timestamp, integer, jsonb, boolean, index } from 'drizzle-orm/pg-core';

export const shopifySyncState = pgTable('shopify_sync_state', {
  id: text('id').primaryKey(),
  cursor: text('cursor'),
  scanActive: boolean('scan_active').notNull().default(true),
  scanRequested: boolean('scan_requested').notNull().default(false),
  scanCount: integer('scan_count').notNull().default(0),
  scanStartedAt: timestamp('scan_started_at', { withTimezone: true }).notNull().defaultNow(),
  scanCompletedAt: timestamp('scan_completed_at', { withTimezone: true }),
  nextScanAt: timestamp('next_scan_at', { withTimezone: true }).notNull().defaultNow(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lockToken: text('lock_token'),
  lastError: text('last_error'),
});

export const shopifyProductJobs = pgTable('shopify_product_jobs', {
  productId: text('product_id').primaryKey(),
  revision: integer('revision').notNull().default(1),
  status: text('status').notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('shopify_jobs_due_idx').on(table.status, table.nextAttemptAt)]);

export const shopifyWebhookEvents = pgTable('shopify_webhook_events', {
  id: text('id').primaryKey(),
  topic: text('topic').notNull(),
  productId: text('product_id'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, table => [index('shopify_events_pending_idx').on(table.processedAt)]);

export const shopifyProductReviews = pgTable('shopify_product_reviews', {
  productId: text('product_id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  productStatus: text('product_status').notNull(),
  reasons: jsonb('reasons').$type<string[]>().notNull(),
  matchedCollections: jsonb('matched_collections').$type<string[]>().notNull(),
  verifiedCollections: jsonb('verified_collections').$type<string[]>().notNull(),
  storefrontVerified: boolean('storefront_verified').notNull().default(false),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
});
