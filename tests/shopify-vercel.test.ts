import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleWebRequest, handleNodeRequest, processShopifyRequest } from '../api/shopify/graphql.ts';

test('Vercel API route: GET returns store domain and apiVersion without exposing tokens', async () => {
  const req = new Request('https://www.lifeibeauty.com/api/shopify/graphql', { method: 'GET' });
  const res = await handleWebRequest(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.domain, 'maison-co-store1.myshopify.com');
  assert.equal(data.apiVersion, '2026-10');
  assert.ok(['public', 'private', 'tokenless'].includes(data.authentication));
  assert.equal(data.token, undefined);
  assert.equal(data.privateToken, undefined);
});

test('Vercel API route: Rejects invalid HTTP methods with 405', async () => {
  const req = new Request('https://www.lifeibeauty.com/api/shopify/graphql', { method: 'DELETE' });
  const res = await handleWebRequest(req);
  assert.equal(res.status, 405);
  const data = await res.json();
  assert.equal(data.error, 'Method not allowed');
  assert.equal(res.headers.get('Allow'), 'GET, POST');
});

test('Vercel API route: Rejects empty or missing GraphQL query with 400', async () => {
  const req = new Request('https://www.lifeibeauty.com/api/shopify/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const res = await handleWebRequest(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'GraphQL query is required');
});

test('Vercel API route: Rejects Admin API tokens with 503 error', async () => {
  const prevToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const prevViteToken = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  try {
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'shpat_admin_secret_invalid';
    delete process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    const res = await processShopifyRequest({
      method: 'POST',
      body: JSON.stringify({ query: '{ shop { name } }' }),
    });
    assert.equal(res.status, 503);
    assert.match((res.body as any).error, /never an Admin API token/);
  } finally {
    if (prevToken !== undefined) process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = prevToken;
    else delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    if (prevViteToken !== undefined) process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN = prevViteToken;
    else delete process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  }
});

test('Vercel API route: Rejects simultaneous public and private tokens with 503', async () => {
  const prevPublic = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const prevPrivate = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  try {
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'validpublictoken12345678901234';
    process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = 'validprivatetoken1234567890123';

    const res = await processShopifyRequest({
      method: 'POST',
      body: JSON.stringify({ query: '{ shop { name } }' }),
    });
    assert.equal(res.status, 503);
  } finally {
    if (prevPublic !== undefined) process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = prevPublic;
    else delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    if (prevPrivate !== undefined) process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = prevPrivate;
    else delete process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  }
});

test('Vercel API route: Rewrites checkout URL to branded checkout.lifeibeauty.com', async () => {
  const savedFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      return Response.json({
        data: {
          cartCreate: {
            cart: {
              id: 'gid://shopify/Cart/test123',
              checkoutUrl: 'https://maison-co-store1.myshopify.com/cart/c/sample-123?key=abc&_fd=1',
            },
            userErrors: [],
          },
        },
      });
    };

    const res = await processShopifyRequest({
      method: 'POST',
      body: JSON.stringify({
        query: 'mutation { cartCreate { cart { checkoutUrl } } }',
      }),
    });

    assert.equal(res.status, 200);
    const cart = (res.body as any).data.cartCreate.cart;
    const checkout = new URL(cart.checkoutUrl);
    assert.equal(checkout.hostname, 'checkout.lifeibeauty.com');
    assert.equal(checkout.searchParams.get('_fd'), '0');
  } finally {
    globalThis.fetch = savedFetch;
  }
});

test('Vercel API route: Rejects unsafe checkout redirect destinations', async () => {
  const savedFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      return Response.json({
        data: {
          cartCreate: {
            cart: {
              id: 'gid://shopify/Cart/test123',
              checkoutUrl: 'https://phishing-site.example.com/checkout',
            },
            userErrors: [],
          },
        },
      });
    };

    const res = await processShopifyRequest({
      method: 'POST',
      body: JSON.stringify({
        query: 'mutation { cartCreate { cart { checkoutUrl } } }',
      }),
    });

    assert.equal(res.status, 502);
    assert.match((res.body as any).error, /unexpected checkout destination/);
  } finally {
    globalThis.fetch = savedFetch;
  }
});

test('Vercel API route: Node.js request handler handles Express/Node streams and response', async () => {
  let statusCode = 200;
  let responseData: any = null;
  const headersSet: Record<string, string> = {};

  const mockReq: any = {
    method: 'POST',
    body: { query: 'query { shop { name } }' },
    headers: { 'x-forwarded-for': '127.0.0.1' },
  };

  const mockRes: any = {
    setHeader(name: string, value: string) {
      headersSet[name] = value;
    },
    status(code: number) {
      statusCode = code;
      return mockRes;
    },
    json(data: any) {
      responseData = data;
    },
  };

  const savedFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      return Response.json({ data: { shop: { name: 'Li Fei Beauty' } } });
    };

    await handleNodeRequest(mockReq, mockRes);
    assert.equal(statusCode, 200);
    assert.equal(responseData.data.shop.name, 'Li Fei Beauty');
    assert.equal(headersSet['Cache-Control'], 'no-store');
  } finally {
    globalThis.fetch = savedFetch;
  }
});
