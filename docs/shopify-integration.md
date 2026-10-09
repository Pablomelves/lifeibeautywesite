# Existing Shopify storefront connection

Li Fei Beauty uses its existing Netlify Shopify function for catalog queries, collections, search, and Shopify Cart API checkout. The connection is restricted to the existing maison-co-store1.myshopify.com store. Browser settings cannot replace, disconnect, or reset it. The website's layout, styles, banners, navigation, and Netlify domain configuration are unchanged.

## Runtime configuration

Configure `SHOPIFY_STORE_DOMAIN` with the canonical Shopify hostname supplied by the store owner and `SHOPIFY_API_VERSION` with the supported version pinned in the function's default configuration. Use the Netlify Functions scope and all deployment contexts, including production and deploy previews. Retain these project-level settings across releases; do not put them in browser settings.

The existing store supported tokenless product, collection, and cart requests during verification on October 9, 2026. No credential was needed for those tested operations. If authenticated Storefront access becomes necessary, configure either `SHOPIFY_STOREFRONT_ACCESS_TOKEN` for a public Storefront token or `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` for a private Storefront token in the Functions scope. Mark credentials as secret. Never configure both, use an Admin API token, or introduce a frontend `VITE_` credential.

Review Shopify's supported API versions during maintenance and validate an updated version before changing the runtime setting. Product publication, API support, store availability, and platform permissions still require ordinary operational maintenance; no integration can guarantee those external conditions indefinitely.

## Product synchronization

Published Shopify products and additional variant pages are fetched with cursor pagination. Real descriptions, images, prices, options, handles, and availability are used without demo product fallback or fabricated product metadata. Initial failures display the existing error state. Background failures retain the last successfully fetched real catalog.

Requests use `no-store`. The visible storefront refreshes its catalog every minute and on regained tab focus or connectivity. Open product details and cart prices/availability use the refreshed catalog. Shopify validates the final cart and prices at checkout. Changes in Shopify appear on the next successful refresh without reconnecting the website.

## Shopify checkout handoff

The store's generated checkout URLs used lifeibeauty.com, which serves the Netlify application. Changing only the checkout hostname caused Shopify to redirect back to that domain. The function therefore keeps Shopify's generated cart path and key, uses the canonical Shopify hostname, and applies Shopify's domain-redirect bypass parameter. No DNS, Shopify domain, or Netlify redirect configuration change is needed for this handoff.

Browser verification reached a Shopify-hosted checkout page with HTTP 200 and a visible contact email field. No customer information or payment details were submitted, and no paid order was placed. Failed cart creation or unavailable products do not trigger a simulated order or clear the customer's shopping bag.

## Production release prerequisite

Allow the platform's normal validation to build the updated source, then publish the validated deployment. Do not publish the workspace's preexisting `dist` artifacts. Verify the Shopify endpoint and real catalog on lifeibeauty.com, desktop/mobile product details, variant prices and availability, cart add/remove/quantity changes, search, and the final Shopify checkout page before declaring production complete.

During verification, Netlify CLI configuration requests returned successfully, but the live API did not confirm the settings. A direct environment-write request returned HTTP 401. The live website still used the older deployment and its Shopify endpoint returned HTTP 404. The owner selected dashboard-managed configuration and publication. No further environment-write or publication attempts are required from this session.

### Dashboard handoff

1. Open this Netlify project's environment-variable settings. Set `SHOPIFY_STORE_DOMAIN` to the existing store's canonical hostname supplied in the request. Set `SHOPIFY_API_VERSION` to the pinned API version in `netlify/functions/shopify.mts`. Use the Functions scope and all deployment contexts. Do not add a frontend credential or change existing unrelated settings.
2. Allow the platform's automatic source validation to finish. Publish the newly validated release containing both the updated frontend and the Shopify function, using the existing production workflow. Do not republish the older deployment or upload stale `dist` files. No DNS, Shopify domain, or build-configuration change is required.
3. Confirm `/api/shopify` returns JSON configuration for the requested Shopify store and `/api/shopify/graphql` responds to catalog requests with real Shopify products rather than a 404 or HTML page.
4. On lifeibeauty.com, hard-refresh and test product details, variant prices and availability, search, cart quantities/removal, and Shopify-hosted checkout on desktop and mobile. Do not place a paid order solely for verification. A Shopify admin product update should appear on the next successful catalog refresh without reconnecting.

Production cannot be declared verified until the new release is published and these live-domain checks pass.
