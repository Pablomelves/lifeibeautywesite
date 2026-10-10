# Shopify collection automation

## Current activation status

The automation is implemented but **inactive until authorized Admin access is configured and this release is deployed**. The existing Storefront integration is tokenless and cannot write memberships or read unpublished products. No live collection assignments, full Admin scan, or newly imported-product test have been completed without that authorization.

A read-only Storefront audit on October 10, 2026 returned nine published products and these three visible collections: `Home page`, `Winter Essentials`, and `Healthcare example products`. `Targeted Serum`, `Bio Collagen Masks`, and `Pore Cleanser` were not visible through this Storefront connection. They may exist in Shopify Admin without being published to this sales channel; the audit cannot determine that. The automation discovers their real IDs through Admin access, never creates them, and flags missing matches instead of substituting unrelated collections.

## What the automation does

The first enabled worker paginates every Admin product, without filtering by publication or status. It queues active, draft, archived, imported, and already-assigned products for review. Subsequent product-create/update/delete webhooks use the same pipeline. AutoDS products are included once they exist in Shopify; publications and subsequent updates are re-evaluated. Collection-change webhooks request another scan. A five-minute scheduled worker drains durable events and retries, and a daily complete scan recovers missed deliveries. Large scans resume from a saved cursor; a protected background worker accelerates the initial pass.

Jobs, event deduplication, scan cursors, concurrency leases, and manual-review reports use Netlify Database with Drizzle. The release includes generated migrations, which Netlify applies at deploy time. There is no process-memory or local-file dependency for operational state. Failed assignments and unavailable Storefront memberships use exponential backoff capped at six hours, with no destructive retry or retry limit that silently drops products. A terminated worker resumes durable work after its lease expires. Event IDs are retained for fourteen days; even later duplicates cannot duplicate memberships because current assignments are checked again.

Matching recognizes the owner's exact names `Targeted Serum`, `Bio Collagen Masks`, and `Pore Cleanser`, plus equivalent existing cream, eye-care, tool, and bundle collections. Titles, product types, Shopify taxonomy, corroborated tags/descriptions, and vendor information are reviewed. The classifier distinguishes product identity from ingredients or routine recommendations; eye patches are not facial masks, hair serums are not facial treatments, and an unclear capsule or balm is not silently labeled a serum. Existing seasonal or brand collections need explicit matching metadata with corroborating product identity. Recognized bundles can receive multiple appropriate memberships. Unknown collection meanings are not invented.

Only missing memberships in existing **manual** Shopify collections are added, using `collectionAddProducts`. Product data, valid manual memberships, collection names and rules, images, checkout, payment configuration, domains, integrations, and website styling are not changed. Existing smart/automated collections are governed by Shopify's own rules: their rules and products are not rewritten to force a match. A confident product that fails those existing rules is flagged for manual review. Shopify Flow is not required for this implementation.

After each assignment, Admin membership is read back. Storefront visibility and saved memberships are independently verified. An active product whose expected collection is unpublished or has not propagated remains pending, not verified. Draft/archived products can be categorized but are not described as visible. Unclear products keep all assignments and appear in the protected manual-review report.

The existing website's category cards and tabs now filter **saved, Storefront-visible collection memberships**, including multiple memberships, rather than the former default-serum inference. Counts are calculated from the real visible catalog, including zero, with no sample counts. Card labels, layout, styles, navigation, responsiveness, and checkout remain intact. Until the intended collections are accessible and memberships are saved, those cards may show zero; all real products remain in the unfiltered shop view.

## Required activation steps

1. In Shopify, install an authorized Admin API app for the already-connected `maison-co-store1.myshopify.com` store. Grant effective `read_products` and `write_products` access. Collection assignment also requires the installing user to have permission to add products to collections; Shopify does not support this mutation on Starter or Retail plans. Keep the app installed. Use a supported non-expiring installed-app token or maintain token renewal outside this integration if your app issues expiring tokens.
2. In this Netlify project's environment settings, add these **Functions-scoped production** variables, marking credential values secret. Do not use `VITE_` variables, commit secrets, or paste credentials into messages:

   | Variable | Required value |
   | --- | --- |
   | `SHOPIFY_ADMIN_ACCESS_TOKEN` | The authorized installed app's Admin token; not a Storefront token |
   | `SHOPIFY_WEBHOOK_SECRET` | That same app's client secret for Shopify webhook HMAC verification |
   | `SHOPIFY_SYNC_SECRET` | A new strong random operator-only bearer secret |
   | `SHOPIFY_SYNC_ENABLED` | `true` only when ready for production assignments |

   Keep `SHOPIFY_STORE_DOMAIN` pointing to the existing store and `SHOPIFY_API_VERSION` at the supported `2026-10` version used by the existing integration. Retain any existing Storefront token settings unchanged. Never enable live assignment on deploy previews; a second production-context guard prevents preview workers from operating on the live store.
3. In Shopify Admin, confirm the intended collections actually exist under their exact names. Publish both intended collections and products to the sales channel/catalog visible to the **existing Storefront integration**, including any access settings needed for tokenless reading. Do not rename or recreate collections to satisfy the code. If Shopify smart-collection rules exclude a product, resolve the flagged case manually under your own collection policy; this automation preserves those rules.
4. Deploy this release. Netlify creates the database/branch and applies the included migrations automatically. This session could not inspect a preview database branch before deployment, so migration application has not been claimed as verified. Confirm successful migration application and function deployment in Netlify before activation testing.
5. Securely make `SHOPIFY_SYNC_SECRET` available in a trusted local shell (do not pass its value on the command line). Run `npm run shopify:collections -- setup`. This checks the Admin permission, discovers actual collections, installs only missing app-owned HTTPS subscriptions at `https://lifeibeauty.com/api/shopify/collection-webhook`, and requests a full scan. Registered topics are products/create, products/update, products/delete, collections/create, collections/update, and collections/delete. The setup operation does not change existing unrelated subscriptions.
6. Run `npm run shopify:collections -- run` to request the initial background pass, then `npm run shopify:collections -- status`. A queued/HTTP 202 response is **not** proof that synchronization has completed. Continue checking saved reports; large catalogs can need subsequent scheduled passes or another `run` invocation. Scheduled execution is production-only and processes work every five minutes. Disabling `SHOPIFY_SYNC_ENABLED` pauses mutations without deleting persistent reports or memberships.

## Operations and reports

The operator API is `GET/POST /api/shopify/collection-sync`, authenticated with `Authorization: Bearer` and the operator secret. GET reports scan enumeration progress, pending events, job and review counts, the last safe error code, and up to 100 product reports. Follow `nextReviewCursor` using the `after` query parameter to read subsequent pages. `allEnumeratedProductsProcessed` requires finished enumeration and no outstanding jobs/events; it is not a claim that manual-review cases have been resolved.

Report statuses distinguish `verified`, `manual_review`, `publication_pending`, and `categorized_unpublished`. Each report includes Shopify product ID, reasons, candidate IDs, actual Admin memberships, and whether all candidate memberships were visible through Storefront. A manual-review flag is stored in this report, not written into product tags or made public. Product deletion removes the stale review on the next pass without altering Shopify objects.

POST accepts `setup`, `scan`, or `product` with a valid Shopify product GID. Local commands are:

```sh
npm run shopify:collections -- setup
npm run shopify:collections -- scan
npm run shopify:collections -- run
npm run shopify:collections -- status
npm run shopify:collections -- product 'gid://shopify/Product/YOUR_NUMERIC_PRODUCT_ID'
npm run shopify:collections -- audit
```

`audit` is read-only, needs no Admin token, and reviews every Storefront-visible product against actual Storefront-visible collections. It reports published-product counts and missing visible collection families; it is not a full Admin synchronization and never changes assignments. The script always targets the existing production store/site rather than a user-supplied destination.

## Verification checklist after activation

- Record product and collection totals in Shopify Admin, including drafts/archived products. Complete the scan, confirm the enumeration count matches that scope, inspect every report page, and investigate pending retries or permission errors before claiming completion.
- Pick an existing confidently identifiable product. Confirm every reported appropriate manual collection contains it in Shopify Admin, all prior valid manual assignments remain, and a second scan adds nothing duplicate.
- Create or import a genuine new product through the normal Shopify/AutoDS workflow. Publish it to the existing Storefront channel. Confirm the webhook is received, the job is processed, Admin assignments are saved, and the report becomes `verified`. Do not create demo products just to make the website appear populated.
- Change a real product's relevant metadata. Confirm a products/update delivery and a new review. Missing appropriate memberships are added; old manually saved memberships are never automatically removed.
- Check the existing website after its next successful one-minute catalog refresh or focus/connectivity refresh. Confirm each appropriate category displays the product, multi-membership products appear in every relevant card/filter, and counts match Storefront-visible memberships (not unpublished Admin inventory).
- Inspect an unclear product's `manual_review` report and confirm Shopify memberships stayed unchanged. Check draft products show `categorized_unpublished`, and publication delays show pending rather than success.
- Compare the original Admin totals and IDs with the final inventory. This implementation cannot create products or collections and has no delete, rename, remove-membership, or product-update mutations. Confirm zero duplicate objects and inspect Shopify webhook delivery/function logs for live scheduled execution.

## Local validation

`npm run test:shopify` exercises classification, misleading keywords, multi-membership filtering, HMAC, auth, Admin pagination/retries, assignment read-back, idempotent reprocessing, unpublished products, delayed propagation, smart-collection preservation, and manual-review behavior using isolated HTTP fixtures. `npm run check:shopify` checks the server-side TypeScript; `npm run lint` checks the existing frontend. These checks do not substitute for the live verification checklist. No build command is required or run in this editing session.
