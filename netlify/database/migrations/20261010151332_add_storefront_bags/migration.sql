CREATE TABLE "storefront_bags" (
	"id" text PRIMARY KEY,
	"lines" jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "storefront_bags_expiry_idx" ON "storefront_bags" ("expires_at");