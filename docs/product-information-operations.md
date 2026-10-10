# Source-backed product information

The existing Shopify catalog remains the only source of products, variants, prices, stock, galleries and checkout. The enhancement reads that catalog and stores evidence, OCR work and approved supplemental information in Netlify Database. It does not write to Shopify. The homepage, hero carousel, header, footer and brand assets are unchanged.

## Initial catalog audit

`docs/product-image-audit.md` records all nine live Shopify products and all 78 gallery images inspected on October 10, 2026. Each image received its own OCR analysis; images containing candidates received a separate verification pass. The prepared records contain 36 automatically eligible, description-corroborated facts. All nine products still need some manual verification. Nine possible comparison crops across seven products were retained for review; none were automatically enabled because the original labels, framing and crop boundaries require checking. No complete INCI list was automatically verified.

The existing Storefront token did not permit reading product metafields. The reader used existing descriptions, product metadata and galleries instead. No permissions, credentials or environment variables were changed. Products that depend on image-only evidence show explicit verification messages instead of invented content.

The new schema migration and audit seed migration are prepared in `netlify/database/migrations/`. Netlify applies them during deployment. Do not run migrations manually or edit any migration after it has been applied. The original three applied migrations were left unchanged. The seed uses existing Shopify IDs and does not create products or overwrite an existing analysis row.

## Automatic analysis

The production scheduled function runs every minute with a bounded execution budget. It scans the full paginated catalog daily, or after an authenticated scan request. It follows every image-gallery page and resumes individual OCR/verification steps using persisted jobs and fenced leases. Unchanged images reuse their evidence; missing analysis can be retried on a subsequent scan. Source changes invalidate publication, while changes to Shopify's update timestamp alone do not. Source-equivalent retries retain previously reviewed publication.

Netlify AI Gateway supplies the existing server-side provider configuration. Individual OCR uses `gpt-4.1-mini`; independent visual verification uses `gpt-4.1`. No model credentials enter client code. Rate limits, unavailable providers, unreadable images and exhausted retries produce review warnings without affecting purchase controls. No AI requests run in a customer browser, and unchanged records do not incur new image-analysis requests.

Verbatim existing Shopify description/metafield corroboration is necessary for automatic fact confirmation. Image-only statements are withheld even when both models agree. Ingredient functions and concentrations need explicit source wording. Unsupported medical promises, packaging volumes, product names misclassified as ingredients, conflicting concentrations and conflicting frequency statements are rejected or marked for review. Complete INCI lists need explicit complete-list evidence, preserved names and original order. The interface never invents benefits to reach a numerical target.

## Staff review and comparison approval

Open **Product Source Review** in the existing administration portal. This screen requires a confirmed Netlify Identity account with a server-assigned `admin` or `product_reviewer` role; the store-owner login alone cannot authorize publication. The existing Identity feature was activated without changing its configuration.

Review every original gallery image, description, candidate excerpt and warning. Select only facts checked against their source. Correct OCR mistakes with an accurate source-bound transcription, including a verbatim supporting excerpt. A complete ingredient transcription requires explicit confirmation of completeness and order. Do not infer missing ingredient functions, percentages, application order or frequency.

Before approving a comparison, check that the labelled photographs show the same subject and comparable angle, scale, framing and lighting. Open the original image links. Correct each photograph's normalized region using the percentage controls and inspect the preview. Coordinates must isolate the photograph itself, exclude captions and unrelated content, have compatible proportions and not overlap within a composite. The server checks original gallery ownership, original dimensions and geometry. It cannot independently prove clinical efficacy or authenticate a manufacturer's results. Do not approve an ambiguous pair.

Publishing requires explicit source acknowledgment, same-origin requests, a current product fingerprint and an unchanged review version. Only selected information is public. Unselected or unresolved information remains private. Download the current catalog audit from the same screen; it is generated from persisted evidence and review state. Run **Scan complete catalog** to queue a read-only rescan and start the resumable background worker.

## Product-page behavior

Reusable sections replace the previous generic information tabs while retaining the original product introduction, galleries, purchase details and reviews. Sections show verified benefits, key ingredients, full ingredients, suitability, application steps and documented precautions. Non-skincare products use appropriate feature/component labels rather than an empty skincare ingredient section. Missing full ingredients show “Full ingredient information is being verified.” Missing instructions explicitly require manual verification.

Approved comparisons appear after benefits and before ingredient details. They use original Shopify image URLs and SVG photo-region viewports; no images are replaced, generated, enhanced or retouched. Original proportions are preserved, and the divider supports pointer dragging, native touch, arrow keys, Home/End and Page Up/Down with accessible slider values. Vertical touch scrolling remains available. Information and below-fold images load near the viewport. Source links, result-variation wording and image-failure messages remain visible.

The public endpoint rechecks current Shopify evidence before returning publication. Any source mismatch hides stale information and queues a rescan. Missing tables, unavailable services and absent publication return a graceful verification state. React renders extracted content as text, never as executable HTML.

## Validation and release limits

`npm run lint`, `npm run check:product-analysis`, `npm run test:storefront` and `npm run test:shopify` passed locally (45 storefront tests and 41 Shopify tests). Tests cover supported facts, unsupported claims, complete-list safeguards, source pagination, permission fallback, comparison geometry, review authorization, stale edits, source-bound transcription, crop correction, resumable work and preserved purchase behavior.

Local Chromium checked every real product route at 390px, 768px and 1440px using actual Shopify responses and the prepared audit records substituted only at the supplemental-information endpoint. Separate component checks exercised mouse, native touch, keyboard and vertical scrolling with unpublished test crop fixtures. These were interaction tests, not evidence approval or deployed persistence tests. No comparison fixture was added to the live catalog or seed publication.

The new tables, persisted staff review, production scheduled work, platform deployment and final live endpoint checks still require validation after Netlify's automatic deployment. Do not present the feature as deployed before those checks succeed. Check all nine live product routes, prices, selected variants, stock, Add to Bag, Shopify checkout handoff, information fallbacks and any approved comparison after deployment. Do not complete a payment merely to test the handoff. Physical-device Safari/Android and cross-browser production checks remain release tasks.
