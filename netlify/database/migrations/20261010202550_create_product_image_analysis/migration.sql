CREATE TABLE "product_analysis_scan" (
	"id" text PRIMARY KEY,
	"cursor" text,
	"scan_active" boolean DEFAULT true NOT NULL,
	"scan_requested" boolean DEFAULT false NOT NULL,
	"discovered_products" integer DEFAULT 0 NOT NULL,
	"next_scan_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"lock_token" text,
	"locked_until" timestamp with time zone,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "product_image_analysis" (
	"product_id" text PRIMARY KEY,
	"fingerprint" text NOT NULL,
	"source" jsonb NOT NULL,
	"work" jsonb NOT NULL,
	"information" jsonb,
	"published" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_image_analysis_status_check" CHECK ("status" IN ('pending', 'processing', 'needs_review', 'verified', 'failed'))
);
--> statement-breakpoint
CREATE INDEX "product_image_analysis_queue_idx" ON "product_image_analysis" ("status","next_attempt_at");