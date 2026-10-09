import type { Config, Context } from '@netlify/functions';

const DEFAULT_DOMAIN = 'lifeibeauty.myshopify.com';
const DEFAULT_TOKEN = '28514afc85b8fa8d004788302c17417e';
const DEFAULT_API_VERSION = '2024-01';

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Storefront-Access-Token',
      },
    });
  }

  const domain = (process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN || DEFAULT_DOMAIN)
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .trim();
  const token = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || DEFAULT_TOKEN).trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || DEFAULT_API_VERSION).trim();

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

  if (!query) {
    return Response.json({ error: 'GraphQL query is required' }, { status: 400 });
  }

  const shopifyEndpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const shopifyRes = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await shopifyRes.json();
    return Response.json(data, {
      status: shopifyRes.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Shopify proxy error';
    return Response.json(
      { error: 'Failed to connect to Shopify Storefront API', details: msg },
      { status: 502 }
    );
  }
};

export const config: Config = {
  path: ['/api/shopify/graphql', '/api/shopify'],
};
