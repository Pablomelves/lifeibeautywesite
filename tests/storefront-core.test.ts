import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBagHandler, validateBagLines, type BagLine } from '../netlify/lib/storefront-bag.js';
import { restoreBag, serializeBag } from '../src/services/bag.js';
import { transformShopifyProduct, createShopifyCheckout, validateShopifyDiscount, type ShopifyProductNode } from '../src/services/shopify.js';
import { getStorefrontContent } from '../src/services/storefrontContent.js';
import { submitStoreForm } from '../src/services/forms.js';
import { trackShoppingEvent } from '../src/services/analytics.js';

function productNode(): ShopifyProductNode {
  return {
    id: 'gid://shopify/Product/123', title: 'Published product', handle: 'published-product', description: 'Manufacturer directions in the catalog.', descriptionHtml: '<p>Manufacturer directions in the catalog.</p>', productType: 'Skincare', tags: [], availableForSale: true,
    priceRange: { minVariantPrice: { amount: '5.00', currencyCode: 'USD' } },
    images: { edges: [{ node: { url: 'https://cdn.shopify.com/product.jpg', altText: 'Product' } }] },
    variants: { edges: [
      { node: { id: 'gid://shopify/ProductVariant/1', title: 'Small', availableForSale: false, price: { amount: '5.00', currencyCode: 'USD' } } },
      { node: { id: 'gid://shopify/ProductVariant/2', title: 'Large', availableForSale: true, price: { amount: '10.00', currencyCode: 'USD' } } },
    ] },
  };
}

test('catalog prices correspond to the available selected variant, without invented ratings', () => {
  const product = transformShopifyProduct(productNode(), 0);
  assert.equal(product.selectedVariantId, 'gid://shopify/ProductVariant/2');
  assert.equal(product.price, '$10.00');
  assert.equal(product.numericPrice, 10);
  assert.equal(product.reviewsCount, 0);
  assert.equal(product.rating, 0);
  assert.equal(product.descriptionHtml, '<p>Manufacturer directions in the catalog.</p>');
});

test('zero-priced variants do not inherit another variant price', () => {
  const node = productNode();
  node.variants!.edges![1].node.price.amount = '0.00';
  assert.equal(transformShopifyProduct(node, 0).numericPrice, 0);
});

test('restored bags use current Shopify prices and selected variant stock', () => {
  const product = transformShopifyProduct(productNode(), 0);
  const lines = [{ productId: 123, variantId: 'gid://shopify/ProductVariant/2', quantity: 2 }];
  const restored = restoreBag(lines, [product]);
  assert.deepEqual(serializeBag(restored), lines);
  assert.equal(restored[0].product.numericPrice * restored[0].quantity, 20);
  const soldOut = restoreBag([{ ...lines[0], variantId: 'gid://shopify/ProductVariant/1' }], [product]);
  assert.equal(soldOut[0].product.availableForSale, false);
  assert.deepEqual(restoreBag(lines, []), []);
});

test('bag validation rejects invalid IDs, duplicate variants, fractional and excessive quantities', () => {
  const line = { productId: 123, variantId: 'gid://shopify/ProductVariant/2', quantity: 1 };
  assert.deepEqual(validateBagLines([line]), [line]);
  for (const value of [[line, line], [{ ...line, quantity: 0 }], [{ ...line, quantity: 1.1 }], [{ ...line, quantity: 1000 }], [{ ...line, variantId: 'invalid' }], [{ ...line, productId: -1 }]]) assert.throws(() => validateBagLines(value));
});

test('bag API isolates sessions, persists revisions, and rejects stale writes and cross-site requests', async () => {
  const rows = new Map<string, { lines: BagLine[]; revision: number }>();
  const handler = createBagHandler({
    read: async id => rows.get(id) || null,
    save: async (id, lines, revision) => {
      if ((rows.get(id)?.revision || 0) !== revision) return null;
      rows.set(id, { lines, revision: revision + 1 });
      return revision + 1;
    },
  });
  const origin = 'https://lifeibeauty.com';
  const initial = await handler(new Request(origin + '/api/bag'));
  assert.match(initial.headers.get('Set-Cookie')!, /HttpOnly; SameSite=Lax; Max-Age=2592000; Secure/);
  assert.match(initial.headers.get('Cache-Control')!, /no-store/);
  const cookie = initial.headers.get('Set-Cookie')!.split(';')[0];
  const lines = [{ productId: 123, variantId: 'gid://shopify/ProductVariant/2', quantity: 2 }];
  const save = (revision: number, requestOrigin = origin) => handler(new Request(origin + '/api/bag', { method: 'PUT', headers: { Cookie: cookie, Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ lines, revision }) }));
  assert.equal((await save(0)).status, 200);
  assert.equal((await save(0)).status, 409);
  assert.equal((await save(1, 'https://other.example')).status, 403);
  assert.deepEqual(await (await handler(new Request(origin + '/api/bag', { headers: { Cookie: cookie } }))).json(), { lines, revision: 1 });
  assert.deepEqual(await (await handler(new Request(origin + '/api/bag'))).json(), { lines: [], revision: 0 });
});

test('bag API errors do not disclose database internals and writes require a valid session', async () => {
  const handler = createBagHandler({ read: async () => { throw new Error('internal-database-details'); }, save: async () => null });
  const error = await handler(new Request('https://lifeibeauty.com/api/bag'));
  assert.equal(error.status, 503);
  assert.doesNotMatch(JSON.stringify(await error.json()), /internal-database-details/);
  assert.equal((await handler(new Request('https://lifeibeauty.com/api/bag', { method: 'PUT' }))).status, 428);
});

async function mockFetch(response: unknown, run: (requests: { query?: string; variables?: Record<string, unknown>; body?: string }[]) => Promise<void>) {
  const original = globalThis.fetch;
  const requests: { query?: string; variables?: Record<string, unknown>; body?: string }[] = [];
  globalThis.fetch = async (_input, init) => {
    const body = String(init?.body);
    try { requests.push(JSON.parse(body)); } catch { requests.push({ body }); }
    return Response.json(response);
  };
  try { await run(requests); } finally { globalThis.fetch = original; }
}

test('checkout includes exact variants and quantities and verifies discount applicability with Shopify', async () => {
  const product = transformShopifyProduct(productNode(), 0);
  await mockFetch({ data: { cartCreate: { cart: { id: 'cart', checkoutUrl: 'https://checkout.lifeibeauty.com/cart/c/test', totalQuantity: 2, discountCodes: [{ code: 'MERCHANTCODE', applicable: true }] }, userErrors: [], warnings: [] } } }, async requests => {
    const url = await createShopifyCheckout([{ product, quantity: 2 }], 'MERCHANTCODE');
    assert.match(url, /^https:\/\/checkout\.lifeibeauty\.com\//);
    assert.deepEqual(requests[0].variables?.input, { lines: [{ merchandiseId: 'gid://shopify/ProductVariant/2', quantity: 2 }], discountCodes: ['MERCHANTCODE'] });
    await validateShopifyDiscount([{ product, quantity: 2 }], 'MERCHANTCODE');
  });
});

test('checkout rejects partial quantities, inventory warnings, invalid codes, and sold-out variants', async () => {
  const product = transformShopifyProduct(productNode(), 0);
  for (const extra of [{ totalQuantity: 1 }, { warnings: [{ code: 'MERCHANDISE_NOT_ENOUGH_STOCK' }] }, { discountCodes: [{ code: 'CODE', applicable: false }] }]) {
    const cart = { id: 'cart', checkoutUrl: 'https://checkout.lifeibeauty.com/cart/c/test', totalQuantity: 2, discountCodes: [{ code: 'CODE', applicable: true }], ...extra };
    await mockFetch({ data: { cartCreate: { cart, userErrors: [], warnings: 'warnings' in extra ? extra.warnings : [] } } }, async () => {
      await assert.rejects(createShopifyCheckout([{ product, quantity: 2 }], 'CODE'), /quantities|not applicable/);
    });
  }
  await assert.rejects(createShopifyCheckout([{ product, quantity: 1, variantId: 'gid://shopify/ProductVariant/1' }]), /unavailable/);
});

test('policies use published Shopify content, with no invented text or placeholders', async () => {
  await mockFetch({ data: { shop: { name: 'Li Fei Beauty', shippingPolicy: null, refundPolicy: null, privacyPolicy: { title: 'Privacy', body: '<p>Actual policy.</p>' }, termsOfService: null }, pages: { nodes: [{ handle: 'shipping-policy', title: 'Shipping', body: '' }, { handle: 'return-policy', title: 'Returns', body: '[INSERT POLICY]' }] } } }, async () => {
    const info = await getStorefrontContent(new AbortController().signal);
    assert.equal(info.policies.shipping, null);
    assert.equal(info.policies.returns, null);
    assert.equal(info.policies.privacy?.body, '<p>Actual policy.</p>');
    assert.equal(info.about, null);
  });
});

test('form submissions include Netlify form identification and only succeed after the server accepts them', async () => {
  await mockFetch({}, async requests => {
    await submitStoreForm('lifei-contact', { message: 'Test request', 'bot-field': '' });
    assert.equal(new URLSearchParams(requests[0].body).get('form-name'), 'lifei-contact');
  });
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('', { status: 500 });
  try { await assert.rejects(submitStoreForm('lifei-newsletter', { email: 'fixture@example.invalid' }), /could not be submitted/); } finally { globalThis.fetch = original; }
});

test('analytics require consent and an existing provider, exclude customer data, and respect privacy signals', () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const calls: unknown[][] = [];
  globalThis.window = { gtag: (...args: unknown[]) => calls.push(args), lifeiAnalyticsConsent: false } as unknown as Window & typeof globalThis;
  Object.defineProperty(globalThis, 'navigator', { value: { doNotTrack: '0', globalPrivacyControl: false }, configurable: true });
  try {
    assert.equal(trackShoppingEvent('add_to_cart'), false);
    window.lifeiAnalyticsConsent = true;
    assert.equal(trackShoppingEvent('add_to_cart', [{ product: transformShopifyProduct(productNode(), 0), quantity: 1 }]), true);
    assert.equal(calls.length, 1);
    assert.doesNotMatch(JSON.stringify(calls), /email|address|phone|profile|search_term/);
    Object.defineProperty(globalThis, 'navigator', { value: { globalPrivacyControl: true }, configurable: true });
    assert.equal(trackShoppingEvent('view_item'), false);
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window'); else globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator); else Reflect.deleteProperty(globalThis, 'navigator');
  }
});
