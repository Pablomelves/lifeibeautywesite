import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Context } from '@netlify/functions';
import shopify from '../netlify/functions/shopify.mjs';

async function checkoutResponse(data: unknown) {
  const savedFetch = globalThis.fetch;
  const settings = {
    SHOPIFY_STORE_DOMAIN: 'maison-co-store1.myshopify.com',
    SHOPIFY_API_VERSION: '2026-10',
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: '',
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: '',
    SHOPIFY_CHECKOUT_DOMAIN: '',
  };
  const savedSettings = Object.fromEntries(Object.keys(settings).map(name => [name, process.env[name]]));
  Object.assign(process.env, settings);
  globalThis.fetch = async input => {
    assert.equal(input, 'https://maison-co-store1.myshopify.com/api/2026-10/graphql.json');
    return Response.json(data);
  };
  try {
    return await shopify(new Request('https://lifeibeauty.com/api/shopify/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'mutation { cartCreate { cart { checkoutUrl } } }' }),
    }), {} as Context);
  } finally {
    globalThis.fetch = savedFetch;
    for (const [name, value] of Object.entries(savedSettings)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

for (const hostname of ['maison-co-store1.myshopify.com', 'lifeibeauty.com', 'www.lifeibeauty.com', 'checkout.lifeibeauty.com']) {
  test(`checkout from ${hostname} uses the branded domain without an environment opt-in`, async () => {
    const original = new URL(`https://${hostname}/cart/c/example-cart?key=example&locale=en&_fd=1`);
    const response = await checkoutResponse({ data: { cartCreate: { cart: { checkoutUrl: original.toString() }, userErrors: [] } } });
    assert.equal(response.status, 200);
    const body = await response.json();
    const checkout = new URL(body.data.cartCreate.cart.checkoutUrl);
    assert.equal(checkout.hostname, 'checkout.lifeibeauty.com');
    assert.equal(checkout.protocol, 'https:');
    assert.equal(checkout.pathname, original.pathname);
    assert.equal(checkout.searchParams.get('key'), original.searchParams.get('key'));
    assert.equal(checkout.searchParams.get('locale'), 'en');
    assert.equal(checkout.searchParams.get('_fd'), '0');
    assert.deepEqual(body.data.cartCreate.userErrors, []);
  });
}

for (const checkoutUrl of ['https://unexpected.example/cart/c/example-cart', 'http://maison-co-store1.myshopify.com/cart/c/example-cart']) {
  test(`rejects an unsafe checkout destination: ${checkoutUrl}`, async () => {
    const response = await checkoutResponse({ data: { cartCreate: { cart: { checkoutUrl } } } });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'Shopify returned an unexpected checkout destination. Please contact the store owner.' });
  });
}

test('preserves cart creation errors without manufacturing a checkout URL', async () => {
  const data = { data: { cartCreate: { cart: null, userErrors: [{ message: 'Product is unavailable' }] } } };
  const response = await checkoutResponse(data);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), data);
});
