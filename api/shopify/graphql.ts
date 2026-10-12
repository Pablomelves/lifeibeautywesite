import { checkRateLimit, getSecurityHeaders } from '../lib/security.js';

interface GraphqlPart {
  data?: Record<string, unknown>;
  path?: (string | number)[];
  errors?: unknown[];
  incremental?: GraphqlPart[];
  hasNext?: boolean;
}

async function readShopifyResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('multipart/mixed')) return response.json();
  const boundary = /boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType);
  if (!boundary) throw new Error('Missing Shopify response boundary.');
  const text = await response.text();
  const result: { data: Record<string, unknown>; errors?: unknown[] } = { data: {} };
  let hasNext = true;
  let partCount = 0;
  const merge = (part: GraphqlPart) => {
    if (part.errors?.length) result.errors = [...(result.errors || []), ...part.errors];
    if (part.data) {
      let target = result.data;
      for (const segment of part.path || []) {
        if (['__proto__', 'prototype', 'constructor'].includes(String(segment))) throw new Error('Invalid Shopify response path.');
        const value = target[segment];
        if (!value || typeof value !== 'object') throw new Error('Invalid Shopify deferred response.');
        target = value as Record<string, unknown>;
      }
      Object.assign(target, part.data);
    }
    for (const patch of part.incremental || []) merge(patch);
  };
  for (const section of text.split(`--${boundary[1] || boundary[2]}`)) {
    const separator = /\r?\n\r?\n/.exec(section);
    if (!separator) continue;
    const body = section.slice(separator.index + separator[0].length).trim();
    if (!body) continue;
    const part: GraphqlPart = JSON.parse(body);
    merge(part);
    partCount += 1;
    if (typeof part.hasNext === 'boolean') hasNext = part.hasNext;
  }
  if (!partCount || hasNext) throw new Error('Shopify shipping response did not complete.');
  return result;
}

const CHECKOUT_DOMAIN = 'checkout.lifeibeauty.com';

export interface ProcessShopifyOptions {
  method: string;
  body?: string | Record<string, unknown>;
  clientIp?: string;
}

export async function processShopifyRequest(options: ProcessShopifyOptions): Promise<{
  status: number;
  headers: Record<string, string>;
  body: unknown;
}> {
  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...getSecurityHeaders(),
  };

  const { method, clientIp } = options;
  if (method !== 'POST' && method !== 'GET') {
    return {
      status: 405,
      headers: { ...responseHeaders, Allow: 'GET, POST' },
      body: { error: 'Method not allowed' },
    };
  }

  // Rate Limiting per Client IP
  if (clientIp) {
    const rateCheck = checkRateLimit(`shopify-ip:${clientIp}`, 120, 60000);
    if (!rateCheck.allowed) {
      return {
        status: 429,
        headers: {
          ...responseHeaders,
          'Retry-After': String(rateCheck.retryAfterSec),
        },
        body: { error: 'Too many requests to the store API. Please slow down.' },
      };
    }
  }

  const domain = (process.env.SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com')
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .trim();
  const token = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
  const privateToken = (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || '').trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION || '2026-10').trim();

  if (
    domain !== 'maison-co-store1.myshopify.com' ||
    !/^\d{4}-(01|04|07|10)$/.test(apiVersion) ||
    /^(shpat_|shpca_|shpss_)/.test(token) ||
    /^(shpat_|shpca_)/.test(privateToken) ||
    (token && privateToken)
  ) {
    return {
      status: 503,
      headers: responseHeaders,
      body: {
        error:
          'Invalid Shopify Storefront configuration. Configure the existing store and either a public or private Storefront token, never an Admin API token.',
      },
    };
  }

  if (method === 'GET') {
    return {
      status: 200,
      headers: responseHeaders,
      body: {
        domain,
        apiVersion,
        authentication: privateToken ? 'private' : token ? 'public' : 'tokenless',
      },
    };
  }

  if (typeof options.body === 'string' && options.body.length > 64000) {
    return { status: 413, headers: responseHeaders, body: { error: 'Request body is too large' } };
  }

  let parsedBody: { query?: string; variables?: Record<string, unknown> } = {};
  if (typeof options.body === 'string') {
    try {
      parsedBody = JSON.parse(options.body || '{}');
    } catch {
      return { status: 400, headers: responseHeaders, body: { error: 'Invalid JSON request body' } };
    }
  } else if (options.body && typeof options.body === 'object') {
    parsedBody = options.body;
  }

  const query = parsedBody?.query;
  const variables = parsedBody?.variables || {};

  if (typeof query !== 'string' || !query.trim()) {
    return { status: 400, headers: responseHeaders, body: { error: 'GraphQL query is required' } };
  }

  // Prevent automated cart spam and discount code guessing
  if (clientIp && /\bcartCreate\b/.test(query)) {
    const cartRate = checkRateLimit(`shopify-cart:${clientIp}`, 35, 60000);
    if (!cartRate.allowed) {
      return {
        status: 429,
        headers: { ...responseHeaders, 'Retry-After': String(cartRate.retryAfterSec) },
        body: { error: 'Too many checkout or cart attempts. Please wait a moment.' },
      };
    }

    const input = (variables as any)?.input;
    if (input?.discountCodes?.length) {
      const discountRate = checkRateLimit(`shopify-discount:${clientIp}`, 20, 300000);
      if (!discountRate.allowed) {
        return {
          status: 429,
          headers: { ...responseHeaders, 'Retry-After': String(discountRate.retryAfterSec) },
          body: { error: 'Too many discount code attempts. Please try again later.' },
        };
      }
    }
  }

  const shopifyEndpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const deferred = /\bquery\s+ShippingRates\b/.test(query) && query.includes('@defer');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: deferred ? 'multipart/mixed; deferSpec=20220824, application/json' : 'application/json',
    };
    if (token) headers['X-Shopify-Storefront-Access-Token'] = token;
    if (privateToken) {
      headers['Shopify-Storefront-Private-Token'] = privateToken;
      if (options.clientIp) headers['Shopify-Storefront-Buyer-IP'] = options.clientIp;
    }

    const shopifyRes = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(deferred ? 25000 : 12000),
    });

    if (!shopifyRes.ok) {
      return {
        status: shopifyRes.status,
        headers: responseHeaders,
        body: {
          error:
            'Shopify is unavailable or Storefront access was rejected. Check product publication and server configuration.',
        },
      };
    }

    const data = await readShopifyResponse(shopifyRes);
    const cart = data.data?.cartCreate?.cart;
    if (typeof cart?.checkoutUrl === 'string') {
      const checkout = new URL(cart.checkoutUrl);
      if (
        checkout.protocol !== 'https:' ||
        ![domain, CHECKOUT_DOMAIN, 'lifeibeauty.com', 'www.lifeibeauty.com'].includes(checkout.hostname)
      ) {
        return {
          status: 502,
          headers: responseHeaders,
          body: { error: 'Shopify returned an unexpected checkout destination. Please contact the store owner.' },
        };
      }
      checkout.hostname = CHECKOUT_DOMAIN;
      checkout.searchParams.set('_fd', '0');
      cart.checkoutUrl = checkout.toString();
    }

    return {
      status: shopifyRes.status,
      headers: responseHeaders,
      body: data,
    };
  } catch {
    return {
      status: 502,
      headers: responseHeaders,
      body: { error: 'Failed to connect to Shopify Storefront API' },
    };
  }
}

export async function handleWebRequest(req: Request): Promise<Response> {
  const method = req.method;
  let body: string | undefined;
  if (method === 'POST') {
    try {
      body = await req.text();
    } catch {
      body = '';
    }
  }

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    undefined;

  const result = await processShopifyRequest({ method, body, clientIp });
  return Response.json(result.body, {
    status: result.status,
    headers: result.headers,
  });
}

export async function handleNodeRequest(req: any, res: any): Promise<void> {
  const method = req.method || 'GET';
  let body: any = req.body;
  if (method === 'POST' && typeof body === 'undefined') {
    body = await new Promise<string>((resolve) => {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => resolve(data));
      req.on('error', () => resolve(''));
    });
  }

  const clientIp =
    (typeof req.headers?.['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : req.headers?.['x-real-ip']) || undefined;

  const result = await processShopifyRequest({ method, body, clientIp });

  for (const [key, val] of Object.entries(result.headers)) {
    res.setHeader(key, val);
  }
  res.status(result.status).json(result.body);
}

export async function GET(req: Request): Promise<Response> {
  return handleWebRequest(req);
}

export async function POST(req: Request): Promise<Response> {
  return handleWebRequest(req);
}

export default async function handler(req: any, res?: any): Promise<Response | void> {
  if (res && typeof res.status === 'function') {
    return handleNodeRequest(req, res);
  }
  return handleWebRequest(req);
}
