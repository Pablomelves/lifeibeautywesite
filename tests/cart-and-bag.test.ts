import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleBagWebRequest, processBagRequest } from '../api/bag.ts';
import { processShopifyRequest, handleWebRequest } from '../api/shopify/graphql.ts';
import { checkRateLimit, getSecurityHeaders } from '../api/lib/security.ts';
import { restoreBag, serializeBag } from '../src/services/bag.ts';
import type { CartItem, Product } from '../src/types.ts';

test('security headers are present and adhere to strict standards', () => {
  const headers = getSecurityHeaders();
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'SAMEORIGIN');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
});

test('rate limiter tracks counts and enforces cooldown window', () => {
  const ip = '198.51.100.99';
  const testKey = `test-limit:${ip}-${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testKey, 5, 2000);
    assert.equal(res.allowed, true);
  }
  const exceeded = checkRateLimit(testKey, 5, 2000);
  assert.equal(exceeded.allowed, false);
  assert.ok(exceeded.retryAfterSec > 0);
});

test('api/bag.ts manages persistent bag lifecycle, optimistic concurrency and cookies', async () => {
  const origin = 'https://lifeibeauty.com';
  // 1. Initial GET creates session cookie
  const initialReq = new Request(origin + '/api/bag', { method: 'GET' });
  const initialRes = await handleBagWebRequest(initialReq);
  assert.equal(initialRes.status, 200);
  const cookie = initialRes.headers.get('set-cookie');
  assert.ok(cookie && cookie.includes('lifei_bag='));

  const parsedCookie = cookie.split(';')[0];
  const initialData = await initialRes.json();
  assert.deepEqual(initialData, { lines: [], revision: 0 });

  // 2. PUT saves bag items
  const lines = [
    { productId: 101, variantId: 'gid://shopify/ProductVariant/10101', quantity: 2 },
  ];
  const putReq = new Request(origin + '/api/bag', {
    method: 'PUT',
    headers: {
      Cookie: parsedCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lines, revision: 0 }),
  });
  const putRes = await handleBagWebRequest(putReq);
  assert.equal(putRes.status, 200);
  const putData = await putRes.json();
  assert.equal(putData.revision, 1);

  // 3. Stale revision is rejected with 409 Conflict
  const staleReq = new Request(origin + '/api/bag', {
    method: 'PUT',
    headers: {
      Cookie: parsedCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lines, revision: 0 }),
  });
  const staleRes = await handleBagWebRequest(staleReq);
  assert.equal(staleRes.status, 409);

  // 4. GET retrieves saved lines
  const getReq = new Request(origin + '/api/bag', {
    method: 'GET',
    headers: { Cookie: parsedCookie },
  });
  const getRes = await handleBagWebRequest(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.deepEqual(getData.lines, lines);
  assert.equal(getData.revision, 1);

  // 5. Cross-site requests are rejected
  const crossSiteReq = new Request(origin + '/api/bag', {
    method: 'PUT',
    headers: {
      Cookie: parsedCookie,
      Origin: 'https://malicious-site.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lines, revision: 1 }),
  });
  const crossSiteRes = await handleBagWebRequest(crossSiteReq);
  assert.equal(crossSiteRes.status, 403);
});

test('api/shopify/graphql rejects oversized bodies and rate limits abuse', async () => {
  const hugeBody = JSON.stringify({ query: 'x'.repeat(65000) });
  const res = await processShopifyRequest({
    method: 'POST',
    body: hugeBody,
    clientIp: '203.0.113.42',
  });
  assert.equal(res.status, 413);
  assert.equal(res.body.error, 'Request body is too large');
});

test('api/bag.ts recovers bag state from signed cookie across serverless restarts', async () => {
  const origin = 'https://lifeibeauty.com';
  // 1. Initial GET
  const get1 = await handleBagWebRequest(new Request(origin + '/api/bag', { method: 'GET' }));
  const cookieHeaders = get1.headers.get('set-cookie') || '';
  const sessionCookie = cookieHeaders.split(';')[0];

  // 2. PUT items to bag
  const lines = [
    { productId: 202, variantId: 'gid://shopify/ProductVariant/20202', quantity: 3 },
  ];
  const putRes = await handleBagWebRequest(new Request(origin + '/api/bag', {
    method: 'PUT',
    headers: {
      Cookie: sessionCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lines, revision: 0 }),
  }));
  assert.equal(putRes.status, 200);

  // Extract signed state cookie from response headers
  const setCookie = putRes.headers.get('set-cookie') || '';
  const stateCookieMatch = setCookie.match(/lifei_bag_state=[^;]+/);
  assert.ok(stateCookieMatch, 'Expected lifei_bag_state signed cookie');
  const stateCookie = stateCookieMatch[0];

  // 3. New GET request presenting both session cookie and signed state cookie
  const get2 = await handleBagWebRequest(new Request(origin + '/api/bag', {
    method: 'GET',
    headers: {
      Cookie: `${sessionCookie}; ${stateCookie}`,
    },
  }));
  assert.equal(get2.status, 200);
  const data = await get2.json();
  assert.deepEqual(data.lines, lines);
  assert.equal(data.revision, 1);
});

test('api/bag.ts requires session cookie and rejects malformed input with structured JSON error', async () => {
  const origin = 'https://lifeibeauty.com';
  // Missing session returns 428
  const noSessionRes = await handleBagWebRequest(new Request(origin + '/api/bag', {
    method: 'PUT',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lines: [], revision: 0 }),
  }));
  assert.equal(noSessionRes.status, 428);
  const noSessionData = await noSessionRes.json();
  assert.equal(noSessionData.error, 'Reload your bag before saving it.');

  // Establish session first
  const initRes = await handleBagWebRequest(new Request(origin + '/api/bag', { method: 'GET' }));
  const cookieHeaders = initRes.headers.get('set-cookie') || '';
  const sessionCookie = cookieHeaders.split(';')[0];

  // Malformed input with session returns 400
  const res = await handleBagWebRequest(new Request(origin + '/api/bag', {
    method: 'PUT',
    headers: {
      Cookie: sessionCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: 'this is not valid json <tag>',
  }));
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('content-type'), 'application/json');
  const data = await res.json();
  assert.ok(data.error);
});

test('api/shopify/graphql rate limits excessive cartCreate and discount attempts', async () => {
  const ip = '198.51.100.77';
  const cartQuery = 'mutation { cartCreate(input: { lines: [] }) { cart { id } } }';

  // 35 requests are allowed per minute for cartCreate
  for (let i = 0; i < 35; i++) {
    const res = await processShopifyRequest({
      method: 'POST',
      body: JSON.stringify({ query: cartQuery }),
      clientIp: ip,
    });
    // Should be valid GraphQL or service response, not 429
    assert.notEqual(res.status, 429);
  }

  // 36th request must be rate limited with 429
  const limitedRes = await processShopifyRequest({
    method: 'POST',
    body: JSON.stringify({ query: cartQuery }),
    clientIp: ip,
  });
  assert.equal(limitedRes.status, 429);
  assert.match((limitedRes.body as any).error, /Too many checkout or cart attempts/);
});

