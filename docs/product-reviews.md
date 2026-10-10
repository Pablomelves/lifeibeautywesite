# Product reviews

Every product page includes a review list and a “Write a review” form. Customers provide a public nickname, a 1–5 rating, a headline, their own experience, and consent to publication. Email, order numbers, addresses, and payment details are not requested. The form reminds customers not to include private information.

Submissions are stored in the Netlify Database `customer_product_reviews` table with `pending` status. Only approved reviews contribute to the public list, review count, and average rating. The same rules apply to positive and negative feedback. Approval does not verify a purchase, and the interface states this explicitly. No testimonials, customer identities, photographs, or ratings have been seeded.

The form includes an expandable **demo-only layout preview**. It displays the customer's current draft or neutral field placeholders, never invented product experiences. It is labeled as an unpublished preview, is not saved on its own, and never contributes to ratings. The old demo review data is not used.

## Deployment and moderator setup

1. Deploy through the existing Netlify workflow. The platform applies `20261010164206_create_customer_reviews` automatically. Do not apply it manually or edit the earlier applied migrations.
2. Confirm Netlify Identity is enabled. Its feature activation script has been run; the Identity integration is scoped to review moderation and does not replace the existing store-owner login.
3. Invite a moderator in Netlify Identity and assign `review_moderator` or `admin` in the user's server-managed `app_metadata.roles`. Public signup, client metadata, and the existing owner login alone do not grant review moderation permission. Consider using invite-only Identity registration.
4. Open the existing store-owner portal and select **Reviews**. Sign in with the confirmed Identity account. To accept an invitation, open its link, enter the owner portal, and select Reviews; the panel processes the invitation and lets the moderator set a password. Never share invitation links or credentials publicly.
5. Review pending submissions, preserving the original text. Approve genuine product feedback, including negative experiences. Reject spam, unrelated content, impersonation, or private information using a consistent moderation policy. Approved and rejected reviews can be returned to pending without changing their wording.
6. Verify a real submission after deployment, approve it, check the correct product page, and confirm another product's reviews are unaffected. Rejection or returning a review to pending should remove it from public counts.
7. Review merchant privacy disclosures for public review publication and Netlify processing. A nickname and review text become public only after approval.

## API and safeguards

- `GET /api/product-reviews?productId=<Shopify numeric ID>` returns approved reviews and product-specific totals. Optional `before` provides pagination.
- `POST /api/product-reviews/submit` validates the product against the existing US Shopify Storefront catalog and stores only validated review fields. Client-supplied status, product name, or purchase-verification flags are ignored.
- `GET /api/admin/product-reviews?status=pending` returns the moderation queue only for an authorized, confirmed Identity user. Approved and rejected queues are also supported.
- `PATCH /api/admin/product-reviews` changes only moderation status, not customer text. It requires the same role authorization and a same-origin request.

The submission route has Netlify IP rate limiting, a honeypot, text and request-size limits, same-origin checks, and a unique submission identifier for retry deduplication. Failure responses avoid internal database/provider details. Review text is rendered as text, not HTML. Moderation credentials are handled by `@netlify/identity`, and no API credentials are embedded in review code.

## Validation limits

Automated tests cover input validation, consent, unpublished submissions, idempotent retries, role restrictions, product isolation, approved-only counts, rejection, malformed requests, and clear failure states. Browser checks use explicit review API fixtures to exercise responsive forms, preview labeling, submission errors, retained drafts, duplicate-click protection, and escaped review text. They do not establish real database persistence or a live moderator session.

Before deployment, the new database table is unavailable and the review UI reports this honestly rather than showing sample customer feedback. The existing Shopify catalog remains live. After deployment, verify database-backed submission, a role-authorized moderator session, publication, and platform rate limiting. No build command was run locally; the platform validates the production build.
