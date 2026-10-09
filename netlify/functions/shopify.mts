import type { Config, Context } from '@netlify/functions';

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
  }

  const domain = (process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com')
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .trim();
  const token = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || '2026-10').trim();

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain) || !/^\d{4}-(01|04|07|10)$/.test(apiVersion) || /^(shpat_|shpca_|shpss_)/.test(token)) {
    return Response.json({ error: 'Invalid Shopify Storefront configuration. Use the canonical store domain, a supported API version and only a public Storefront token.' }, { status: 503 });
  }

  let body: { query?: string; variables?: Record<string, unknown> } = {};
  if (req.method === 'POST') {
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }
  }

  const query = body.query;
  const variables = body.variables || {};

  if (typeof query !== 'string' || !query.trim()) {
    return Response.json({ error: 'GraphQL query is required' }, { status: 400 });
  }

  const shopifyEndpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) headers['X-Shopify-Storefront-Access-Token'] = token;
    const shopifyRes = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
    });

    const data = await shopifyRes.json();
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
      { status: 502 }
    );
  }
};

export const config: Config = {
  path: ['/api/shopify/graphql', '/api/shopify'],
};
