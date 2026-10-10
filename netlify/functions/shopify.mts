import type { Config, Context } from '@netlify/functions';

const CHECKOUT_DOMAIN = 'checkout.lifeibeauty.com';

export default async (req: Request, context: Context) => {
  const responseHeaders = { 'Cache-Control': 'no-store' };
  if (req.method !== 'POST' && req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { ...responseHeaders, Allow: 'GET, POST' } });
  }

  const domain = (process.env.SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com')
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .trim();
  const token = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
  const privateToken = (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || '').trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION || '2026-10').trim();

  if (domain !== 'maison-co-store1.myshopify.com' || !/^\d{4}-(01|04|07|10)$/.test(apiVersion) || /^(shpat_|shpca_|shpss_)/.test(token) || /^(shpat_|shpca_)/.test(privateToken) || (token && privateToken)) {
    return Response.json({ error: 'Invalid Shopify Storefront configuration. Configure the existing store and either a public or private Storefront token, never an Admin API token.' }, { status: 503, headers: responseHeaders });
  }

  if (req.method === 'GET') {
    return Response.json({ domain, apiVersion, authentication: privateToken ? 'private' : token ? 'public' : 'tokenless' }, { headers: responseHeaders });
  }

  let body: { query?: string; variables?: Record<string, unknown> } = {};
  if (req.method === 'POST') {
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON request body' }, { status: 400, headers: responseHeaders });
    }
  }

  const query = body?.query;
  const variables = body?.variables || {};

  if (typeof query !== 'string' || !query.trim()) {
    return Response.json({ error: 'GraphQL query is required' }, { status: 400, headers: responseHeaders });
  }

  const shopifyEndpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) headers['X-Shopify-Storefront-Access-Token'] = token;
    if (privateToken) {
      headers['Shopify-Storefront-Private-Token'] = privateToken;
      if (context.ip) headers['Shopify-Storefront-Buyer-IP'] = context.ip;
    }
    const shopifyRes = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
    });

    if (!shopifyRes.ok) {
      return Response.json({ error: 'Shopify is unavailable or Storefront access was rejected. Check product publication and server configuration.' }, { status: shopifyRes.status, headers: responseHeaders });
    }
    const data = await shopifyRes.json();
    const cart = data.data?.cartCreate?.cart;
    if (typeof cart?.checkoutUrl === 'string') {
      const checkout = new URL(cart.checkoutUrl);
      if (checkout.protocol !== 'https:' || ![domain, CHECKOUT_DOMAIN, 'lifeibeauty.com', 'www.lifeibeauty.com'].includes(checkout.hostname)) {
        return Response.json({ error: 'Shopify returned an unexpected checkout destination. Please contact the store owner.' }, { status: 502, headers: responseHeaders });
      }
      checkout.hostname = CHECKOUT_DOMAIN;
      checkout.searchParams.set('_fd', '0');
      cart.checkoutUrl = checkout.toString();
    }
    return Response.json(data, {
      status: shopifyRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      { error: 'Failed to connect to Shopify Storefront API' },
      { status: 502, headers: responseHeaders }
    );
  }
};

export const config: Config = {
  path: ['/api/shopify/graphql', '/api/shopify'],
};
