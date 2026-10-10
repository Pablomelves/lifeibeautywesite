import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, jsonb, boolean, index, serial, uuid, check } from 'drizzle-orm/pg-core';

export const customerProductReviews = pgTable('customer_product_reviews', {
  id: serial('id').primaryKey(),
  submissionId: uuid('submission_id').notNull().unique(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  author: text('author').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  comment: text('comment').notNull(),
  status: text('status').$type<'pending' | 'approved' | 'rejected'>().notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
}, table => [
  index('customer_reviews_product_status_idx').on(table.productId, table.status, table.id),
  index('customer_reviews_moderation_idx').on(table.status, table.id),
  check('customer_reviews_rating_check', sql`${table.rating} BETWEEN 1 AND 5`),
  check('customer_reviews_status_check', sql`${table.status} IN ('pending', 'approved', 'rejected')`),
]);

export const storefrontBags = pgTable('storefront_bags', {
  id: text('id').primaryKey(),
  lines: jsonb('lines').$type<Array<{ productId: number; variantId: string; quantity: number }>>().notNull(),
  revision: integer('revision').notNull().default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, table => [index('storefront_bags_expiry_idx').on(table.expiresAt)]);

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
