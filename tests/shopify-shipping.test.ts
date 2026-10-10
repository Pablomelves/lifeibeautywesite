import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CartItem, Product } from '../src/types.js';
import { getShopifyCartLines, getShippingCountries, getShippingSummary, getShopifyShippingEstimate, type ShippingAddress, type ShippingGroup } from '../src/services/shopifyShipping.js';
import { readShopifyResponse } from '../netlify/lib/shopify-response.js';

const address: ShippingAddress = { address1: '350 Fifth Avenue', address2: '', city: 'New York', provinceCode: 'NY', zip: '10118', countryCode: 'US' };
const item: CartItem = {
  product: { id: 1, name: 'Serum', selectedVariantId: 'gid://shopify/ProductVariant/123', availableForSale: true } as Product,
  quantity: 2,
};

function group(id: string, amount: string, currencyCode = 'USD'): ShippingGroup {
  return { id, deliveryOptions: [{ handle: `${id}-standard`, title: 'Standard', deliveryMethodType: 'SHIPPING', estimatedCost: { amount, currencyCode } }] };
}

function rates(groups: ShippingGroup[]) {
  return { cart: { deliveryGroups: { pageInfo: { hasNextPage: false }, nodes: groups } } };
}

test('quotes actual Shopify variants and quantities without dropping items', () => {
  assert.deepEqual(getShopifyCartLines([item, { ...item, variantId: 'gid://shopify/ProductVariant/456', quantity: 3 }]), [
    { merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 2 },
    { merchandiseId: 'gid://shopify/ProductVariant/456', quantity: 3 },
  ]);
  assert.throws(() => getShopifyCartLines([]), /empty/);
  assert.throws(() => getShopifyCartLines([{ ...item, quantity: 1.5 }]), /valid quantity/);
  assert.throws(() => getShopifyCartLines([{ ...item, variantId: 'invalid' }]), /available Shopify/);
  assert.throws(() => getShopifyCartLines([{ ...item, product: { ...item.product, availableForSale: false } }]), /unavailable/);
  assert.throws(() => getShopifyCartLines(Array.from({ length: 251 }, () => item)), /250/);
});

test('combines the lowest available shipping rate for every shipment', () => {
  const first = group('first', '8.00');
  first.deliveryOptions.push({ ...first.deliveryOptions[0], handle: 'express', title: 'Express', estimatedCost: { amount: '15.00', currencyCode: 'USD' } });
  const result = getShippingSummary(rates([first, group('second', '3.00')]), 'live');
  assert.deepEqual(result.combined, { amount: 11, currencyCode: 'USD' });
  assert.equal(result.groups[0].deliveryOptions.length, 2);
  assert.equal(result.source, 'live');
});

test('shows free shipping only when Shopify returns a zero-cost rate', () => {
  assert.equal(getShippingSummary(rates([group('free', '0.00')]), 'live').combined?.amount, 0);
});

test('does not present pickup or missing shipment rates as free shipping', () => {
  const pickup = group('pickup', '0.00');
  pickup.deliveryOptions[0].deliveryMethodType = 'PICK_UP';
  assert.throws(() => getShippingSummary(rates([pickup]), 'live'), /no shipping rates/);
  assert.throws(() => getShippingSummary(rates([]), 'live'), /no shipping rates/);
  assert.throws(() => getShippingSummary(rates([group('first', '8'), { id: 'second', deliveryOptions: [] }]), 'live'), /no shipping rates/);
  assert.throws(() => getShippingSummary({ cart: null }, 'live'), /incomplete/);
  assert.throws(() => getShippingSummary({ cart: { deliveryGroups: { pageInfo: { hasNextPage: true }, nodes: [group('first', '8')] } } }, 'live'), /incomplete/);
});

test('rejects invalid prices and does not sum different currencies', () => {
  for (const amount of ['NaN', '', '-1', 'Infinity']) assert.throws(() => getShippingSummary(rates([group('invalid', amount)]), 'live'), /no shipping rates/);
  assert.equal(getShippingSummary(rates([group('first', '8', 'USD'), group('second', '9', 'CAD')]), 'live').combined, null);
});

async function withShopifyFetch(callback: (query: string, variables: Record<string, unknown>, init?: RequestInit) => Response, run: () => Promise<void>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(input, '/api/shopify/graphql');
    assert.equal(init?.cache, 'no-store');
    const body = JSON.parse(String(init?.body));
    return callback(body.query, body.variables, init);
  };
  try { await run(); } finally { globalThis.fetch = originalFetch; }
}

test('loads destinations from Shopify rather than a fabricated country list', async () => {
  await withShopifyFetch(query => {
    assert.match(query, /localization.*availableCountries/);
    return Response.json({ data: { localization: { availableCountries: [{ isoCode: 'US', name: 'United States' }] } } });
  }, async () => {
    assert.deepEqual(await getShippingCountries(new AbortController().signal), [{ isoCode: 'US', name: 'United States' }]);
  });
});

test('creates an addressed Shopify cart and requests deferred carrier rates', async () => {
  let calls = 0;
  await withShopifyFetch((query, variables) => {
    calls += 1;
    if (query.includes('ShippingCartCreate')) {
      assert.deepEqual(variables.input, {
        lines: [{ merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 2 }],
        buyerIdentity: { countryCode: 'US' },
        delivery: { addresses: [{ address: { deliveryAddress: address }, selected: true, oneTimeUse: true }] },
        discountCodes: ['REALCODE'],
      });
      return Response.json({ data: { cartCreate: { cart: { id: 'cart', totalQuantity: 2 }, userErrors: [], warnings: [] } } });
    }
    assert.match(query, /@defer/);
    assert.match(query, /withCarrierRates: true/);
    assert.deepEqual(variables, { id: 'cart' });
    return Response.json({ data: rates([group('shipment', '8.00')]) });
  }, async () => {
    const result = await getShopifyShippingEstimate([item], address, 'REALCODE', new AbortController().signal);
    assert.equal(result.source, 'live');
    assert.equal(result.combined?.amount, 8);
    assert.equal(calls, 2);
  });
});

test('falls back only to configured Shopify rates when live carrier rates fail', async () => {
  await withShopifyFetch(query => {
    if (query.includes('ShippingCartCreate')) return Response.json({ data: { cartCreate: { cart: { id: 'cart', totalQuantity: 2 }, userErrors: [], warnings: [] } } });
    if (query.includes('withCarrierRates: true')) return Response.json({ errors: [{ message: 'Carrier rates unavailable' }] });
    assert.match(query, /ConfiguredShippingRates/);
    assert.doesNotMatch(query, /withCarrierRates/);
    return Response.json({ data: rates([group('configured', '6.25')]) });
  }, async () => {
    const result = await getShopifyShippingEstimate([item], address, undefined, new AbortController().signal);
    assert.equal(result.source, 'configured');
    assert.equal(result.combined?.amount, 6.25);
  });
});

test('explains unavailable shipping when neither live nor configured rates exist', async () => {
  await withShopifyFetch(query => {
    if (query.includes('ShippingCartCreate')) return Response.json({ data: { cartCreate: { cart: { id: 'cart', totalQuantity: 2 }, userErrors: [], warnings: [] } } });
    return Response.json({ data: rates([]) });
  }, async () => {
    await assert.rejects(getShopifyShippingEstimate([item], address, undefined, new AbortController().signal), /no shipping rates/);
  });
});

test('refuses incomplete carts, Shopify warnings, and invalid destinations', async () => {
  for (const result of [
    { cart: { id: 'cart', totalQuantity: 1 }, userErrors: [], warnings: [] },
    { cart: { id: 'cart', totalQuantity: 2 }, userErrors: [], warnings: [{ code: 'MERCHANDISE_NOT_ENOUGH_STOCK' }] },
    { cart: null, userErrors: [{ message: 'Invalid address' }], warnings: [] },
  ]) {
    await withShopifyFetch(() => Response.json({ data: { cartCreate: result } }), async () => {
      await assert.rejects(getShopifyShippingEstimate([item], address, undefined, new AbortController().signal), /could not quote all|Invalid address/);
    });
  }
  await assert.rejects(getShopifyShippingEstimate([item], { ...address, countryCode: '' }, undefined, new AbortController().signal), /country/);
});

test('cancels outdated rate requests without trying fallback rates', async () => {
  const controller = new AbortController();
  let calls = 0;
  await withShopifyFetch(query => {
    calls += 1;
    if (query.includes('ShippingCartCreate')) return Response.json({ data: { cartCreate: { cart: { id: 'cart', totalQuantity: 2 }, userErrors: [], warnings: [] } } });
    controller.abort();
    throw new DOMException('Aborted', 'AbortError');
  }, async () => {
    await assert.rejects(getShopifyShippingEstimate([item], address, undefined, controller.signal), /Aborted/);
    assert.equal(calls, 2);
  });
});

function multipart(parts: unknown[], boundary = 'graphql') {
  return new Response(parts.map(part => `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(part)}\r\n`).join('') + `--${boundary}--\r\n`, { headers: { 'Content-Type': `multipart/mixed; boundary="${boundary}"` } });
}

test('merges Shopify deferred carrier results into one JSON response', async () => {
  const deferred = rates([group('shipment', '8.00')]).cart;
  const result = await readShopifyResponse(multipart([
    { data: { cart: { id: 'cart' } }, hasNext: true },
    { path: ['cart'], data: deferred, hasNext: false },
  ]));
  assert.deepEqual(result.data.cart, { id: 'cart', ...deferred });
});

test('handles incremental patches and rejects truncated or unsafe deferred responses', async () => {
  const deferred = rates([group('shipment', '8.00')]).cart;
  const result = await readShopifyResponse(multipart([
    { data: { cart: { id: 'cart' } }, hasNext: true },
    { incremental: [{ path: ['cart'], data: deferred }], hasNext: false },
  ]));
  assert.deepEqual(result.data.cart, { id: 'cart', ...deferred });
  await assert.rejects(readShopifyResponse(multipart([{ data: { cart: { id: 'cart' } }, hasNext: true }])), /did not complete/);
  await assert.rejects(readShopifyResponse(multipart([{ path: ['__proto__'], data: { injected: true }, hasNext: false }])), /Invalid.*path/);
  await assert.rejects(readShopifyResponse(new Response('', { headers: { 'Content-Type': 'multipart/mixed' } })), /boundary/);
});

test('preserves deferred GraphQL errors so failed rates trigger fallback', async () => {
  const result = await readShopifyResponse(multipart([
    { data: { cart: { id: 'cart' } }, hasNext: true },
    { errors: [{ message: 'Shipping provider unavailable' }], hasNext: false },
  ]));
  assert.deepEqual(result.errors, [{ message: 'Shipping provider unavailable' }]);
});
