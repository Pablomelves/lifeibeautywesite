CREATE TABLE "shopify_product_jobs" (
	"product_id" text PRIMARY KEY,
	"revision" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopify_product_reviews" (
	"product_id" text PRIMARY KEY,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"product_status" text NOT NULL,
	"reasons" jsonb NOT NULL,
	"matched_collections" jsonb NOT NULL,
	"verified_collections" jsonb NOT NULL,
	"storefront_verified" boolean DEFAULT false NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopify_sync_state" (
	"id" text PRIMARY KEY,
	"cursor" text,
	"scan_active" boolean DEFAULT true NOT NULL,
	"scan_requested" boolean DEFAULT false NOT NULL,
	"scan_count" integer DEFAULT 0 NOT NULL,
	"scan_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scan_completed_at" timestamp with time zone,
	"next_scan_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_until" timestamp with time zone,
	"lock_token" text,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "shopify_webhook_events" (
	"id" text PRIMARY KEY,
	"topic" text NOT NULL,
	"product_id" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "shopify_jobs_due_idx" ON "shopify_product_jobs" ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "shopify_events_pending_idx" ON "shopify_webhook_events" ("processed_at");