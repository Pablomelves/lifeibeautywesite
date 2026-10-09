# Li Fei Beauty production and checkout recovery

## Preserve the storefront

The production Netlify project is `lifeibeautyv2`
(`850459ba-b46d-4ef1-b6ad-6c8aedaf30e5`). Its public storefront is
`lifeibeauty.com`, and its production branch is `main` in
`Pablomelves/lifeibeautywesite`. Preserve those values, the existing DNS and TLS,
and all Shopify products, prices, payment settings, and customer records.

The application uses the existing Netlify Shopify function and its configured
canonical Shopify store. Missing or invalid API responses now fail visibly;
they do not switch to a browser-saved store or a demo catalog. Checkout uses
only the HTTPS `checkoutUrl` returned by Shopify after a successful cart
mutation. No checkout hostname or cart permalink is fabricated.

## Stop duplicate automatic deployments

The owner confirmed that the older Netlify `lifeibeauty` project and Vercel
deployment integration were obsolete. Do not delete either project.

The repository now contains two safeguards that take effect when these changes
reach the branches used by those integrations:

- `vercel.json` sets `git.deploymentEnabled` to `false`, disabling Vercel Git
  deployments without deleting existing deployments or the project.
- `scripts/netlify-ignore.cjs` skips Git-triggered builds only for the older
  Netlify project, `7e4e9271-a968-41bc-a215-fe7d86d8f68b`. Builds for
  `lifeibeautyv2` continue. The build command is consistently `bun run build`.

The ignore command is not a substitute for disabling the old project's builds:
Netlify build hooks bypass ignore commands. The settings API returned HTTP 401
for both stopping the old project's builds and enabling Git-only production on
the primary project. Those platform changes were not applied.

An authorized Netlify administrator must complete these steps:

1. Open **lifeibeauty**, not **lifeibeautyv2**.
2. Navigate to **Project configuration → Developer settings → Continuous
   deployment → Build settings**.
3. Select **Configure**, set **Build status** to **Stopped builds**, and save.
   This preserves the project and its existing published deployment.
4. Open **lifeibeautyv2** and keep its builds active.
5. Navigate to **Project configuration → Developer settings → Continuous
   deployment → Enforce deployment methods**.
6. Select **Configure** and require Git-based production deployments. Keep
   `main` as the production branch. Do not promote an agent or pull-request
   preview directly to production.

To disable the obsolete Vercel integration immediately, an authorized Vercel
administrator can open that project's **Settings → Git** and disconnect its
repository. Disconnect only that project, not the GitHub app globally or any
other project's repository. The repository-level safeguard remains useful
afterward. Confirm that no new legacy Netlify or Vercel production deployment
appears for the next `main` commit.

## Resolve the Shopify-side checkout domain

The audit created an anonymous cart successfully, with the correct Shopify
variant and price, but Shopify returned a checkout URL on `lifeibeauty.com`.
Netlify served the storefront at that URL. The canonical
`maison-co-store1.myshopify.com` hostname redirected back to the same storefront
domain. Changing the hostname in code, inventing a checkout URL, or adding a
redirect to the canonical hostname would therefore not fix the supported flow.

No Shopify administration connection was available, so the store's domain and
Markets settings could not be changed or fully verified. No checkout subdomain
was created. The application now reports this confirmed domain conflict instead
of navigating back to the homepage or claiming that an unpaid order succeeded;
the cart remains intact. This safety check is not a completed checkout repair.

An authorized Shopify administrator must verify and, if appropriate, correct the
Shopify-hosted target while keeping the public Netlify storefront unchanged:

1. In Shopify admin, open **Settings → Domains** and inspect the domain assigned
   as primary to the Shopify **Online Store** target. Check whether it is
   `lifeibeauty.com`, as the Storefront API reported during the audit.
2. Inspect the existing `maison-co-store1.myshopify.com` domain. Shopify's domain
   documentation permits a connected domain to be selected as a target's
   primary domain. Verify that this existing canonical domain is connected and
   selectable for this store before proceeding.
3. Review **Settings → Markets**, international domains, and customer-account
   links before changing a Shopify primary domain. Primary-domain changes can
   affect Shopify-hosted and market URLs. If those settings depend on the current
   primary domain, stop and have Shopify Support confirm the supported checkout
   configuration for this non-Hydrogen, externally hosted storefront.
4. If that review confirms that the existing canonical Shopify domain is suitable,
   click it in **Settings → Domains**, select **Change** in the **Type** row,
   choose **Primary domain** for the Shopify Online Store target, and select
   **Change domain type**. This is a Shopify-side setting, not a change to the
   Netlify public domain or its DNS. Do not remove `lifeibeauty.com`, reconnect
   its DNS to Shopify, alter payment settings, or change Storefront API access.
5. If Shopify does not offer that supported selection, have Shopify Support
   confirm a Shopify-hosted checkout domain for this store. Do not create
   `checkout.lifeibeauty.com`, add DNS records, change domain targets, or rewrite
   checkout URLs speculatively.
6. Create a fresh cart through the existing Storefront API integration and use
   its newly returned `checkoutUrl` unchanged. Verify that the browser reaches
   Shopify checkout over HTTPS without returning to the Netlify storefront.
7. Verify the product variant, quantity, price, shipping/contact step, and
   available payment methods. Do not place a real order or enter payment details
   merely to test navigation. A permitted Shopify test-payment transaction is a
   separate owner-controlled action.

The public website remains at `lifeibeauty.com` because its Netlify configuration
and DNS are unchanged. Do not consider checkout restored until the fresh official
checkout URL has been tested end to end; the canonical hostname alone was not a
working checkout destination during the audit.

## Verify the production release

At the audit, GitHub `main` pointed to
`5e899f6fefdfe1b9a429ebe7f4e91fcf98651aec`, with ready Netlify production deploy
`6ac8a16d1d66860008ad07f4`. The live website instead served agent preview
`6ac8a38f5315a4bf7192a900`. Their published artifacts differed, and the Git
deploy's protected permalink returned HTTP 401 to the audit environment.

Do not roll back blindly to the older Git deploy or upload the local `dist`
directory. Keep the current published deployment until an authorized preview
validates the intended release. Test the reviewed changes in a non-production
preview, correct the Shopify checkout domain first, and then verify real product
loading, detail views, search, navigation, mobile layout, cart quantities and
prices, and the official Shopify checkout flow. Merge only the verified changes
into `main` using the normal repository review process. Confirm that Netlify's
published deployment has `production` context, `main` branch, and the intended
GitHub commit, with the same public domain and successful checkout checks.

Historical deploys and customer data are not cleanup targets. In particular,
older source revisions used demo/admin catalog fallbacks, so republishing them
can reintroduce demo products. Keep those artifacts as history, not production.
