CREATE TABLE "customer_product_reviews" (
	"id" serial PRIMARY KEY,
	"submission_id" uuid NOT NULL UNIQUE,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"author" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"comment" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"moderated_at" timestamp with time zone,
	CONSTRAINT "customer_reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
	CONSTRAINT "customer_reviews_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE INDEX "customer_reviews_product_status_idx" ON "customer_product_reviews" ("product_id","status","id");--> statement-breakpoint
CREATE INDEX "customer_reviews_moderation_idx" ON "customer_product_reviews" ("status","id");