import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { META_PIXEL_ID, hasAnalyticsConsent, trackPageView, trackShoppingEvent } from '../src/services/analytics.js';
import type { CartItem, Product } from '../src/types.js';

function createMockProduct(id = 'prod_1', price = 48, currency = 'USD'): Product {
  return {
    id,
    shopifyId: `gid://shopify/Product/${id}`,
    selectedVariantId: `gid://shopify/ProductVariant/${id}_var`,
    title: 'Medicube EGF NAD Firming Serum',
    handle: 'age-defying-firming-serum',
    brand: 'medicube',
    price: `$${price}`,
    numericPrice: price,
    currencyCode: currency,
    availableForSale: true,
    description: 'Firming serum',
    image: '/test.webp',
    images: ['/test.webp'],
    category: 'serums',
    rating: 4.9,
    reviewsCount: 120,
    tags: [],
    variants: [],
  };
}

test('Meta Pixel configuration matches exact supplied Pixel ID and is present in index.html base code', () => {
  assert.equal(META_PIXEL_ID, '2122402601696752', 'Pixel ID must match supplied 2122402601696752');

  const indexHtmlPath = resolve(process.cwd(), 'index.html');
  const indexHtml = readFileSync(indexHtmlPath, 'utf-8');

  // Must include official Meta Pixel base script
  assert.ok(indexHtml.includes('https://connect.facebook.net/en_US/fbevents.js'), 'Must load fbevents.js');
  assert.ok(indexHtml.includes(`fbq('init', '2122402601696752')`), 'Must initialize supplied pixel ID');
  assert.ok(indexHtml.includes(`fbq('track', 'PageView')`), 'Must track PageView');

  // Must include noscript fallback img tag with supplied pixel ID
  assert.ok(
    indexHtml.includes('https://www.facebook.com/tr?id=2122402601696752&ev=PageView&noscript=1'),
    'Must include official noscript tracking pixel image tag'
  );

  // Must check privacy signals and consent before firing or revoking
  assert.ok(
    indexHtml.includes("fbq('consent', 'revoke')"),
    'Must support revoking consent if privacy signals or denial are present'
  );
});

test('hasAnalyticsConsent respects site consent settings, Do Not Track, and Global Privacy Control', () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  try {
    // 1. Without consent flag
    globalThis.window = { lifeiAnalyticsConsent: false } as unknown as Window & typeof globalThis;
    Object.defineProperty(globalThis, 'navigator', {
      value: { doNotTrack: '0', globalPrivacyControl: false },
      configurable: true,
    });
    assert.equal(hasAnalyticsConsent(), false, 'Should be false when lifeiAnalyticsConsent is false');

    // 2. With consent granted
    globalThis.window.lifeiAnalyticsConsent = true;
    assert.equal(hasAnalyticsConsent(), true, 'Should be true when consented and no privacy signals');

    // 3. User has Do Not Track enabled
    Object.defineProperty(globalThis, 'navigator', {
      value: { doNotTrack: '1', globalPrivacyControl: false },
      configurable: true,
    });
    assert.equal(hasAnalyticsConsent(), false, 'Should be false when DNT is 1');

    // 4. User has Global Privacy Control enabled
    Object.defineProperty(globalThis, 'navigator', {
      value: { doNotTrack: '0', globalPrivacyControl: true },
      configurable: true,
    });
    assert.equal(hasAnalyticsConsent(), false, 'Should be false when GPC is active');
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

test('trackPageView tracks page load and client navigation without duplicate events', () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const fbqCalls: unknown[][] = [];

  globalThis.window = {
    fbq: (...args: unknown[]) => fbqCalls.push(args),
    lifeiAnalyticsConsent: true,
    location: { pathname: '/' },
  } as unknown as Window & typeof globalThis;

  Object.defineProperty(globalThis, 'navigator', {
    value: { doNotTrack: '0', globalPrivacyControl: false },
    configurable: true,
  });

  try {
    // 1. Initial PageView tracking on homepage
    const firstCall = trackPageView('/');
    assert.equal(firstCall, true, 'First PageView should succeed');
    assert.equal(fbqCalls.length, 1);
    assert.deepEqual(fbqCalls[0], ['track', 'PageView']);

    // 2. Immediate re-render / duplicate call for same path should be suppressed
    const duplicateCall = trackPageView('/');
    assert.equal(duplicateCall, false, 'Duplicate call on same path should be suppressed');
    assert.equal(fbqCalls.length, 1, 'fbq should not have been called a second time');

    // 3. Client navigation to product PDP
    const navCall = trackPageView('/products/age-defying-firming-serum');
    assert.equal(navCall, true, 'Client-side navigation to new route should succeed');
    assert.equal(fbqCalls.length, 2, 'fbq should be called for new route');
    assert.deepEqual(fbqCalls[1], ['track', 'PageView']);

    // 4. Client navigation back to brand page
    const brandNavCall = trackPageView('/brands/medicube');
    assert.equal(brandNavCall, true, 'Client navigation to brand should succeed');
    assert.equal(fbqCalls.length, 3);

    // 5. Duplicate call on current brand path should be ignored
    const brandDupe = trackPageView('/brands/medicube');
    assert.equal(brandDupe, false);
    assert.equal(fbqCalls.length, 3);
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

test('trackPageView rejects tracking when privacy signals or consent denial are active', () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const fbqCalls: unknown[][] = [];

  globalThis.window = {
    fbq: (...args: unknown[]) => fbqCalls.push(args),
    lifeiAnalyticsConsent: false,
    location: { pathname: '/' },
  } as unknown as Window & typeof globalThis;

  Object.defineProperty(globalThis, 'navigator', {
    value: { doNotTrack: '0', globalPrivacyControl: false },
    configurable: true,
  });

  try {
    assert.equal(trackPageView('/'), false, 'Must not track without consent');
    assert.equal(fbqCalls.length, 0);

    // Turn consent on, but set DNT
    globalThis.window.lifeiAnalyticsConsent = true;
    Object.defineProperty(globalThis, 'navigator', {
      value: { doNotTrack: '1', globalPrivacyControl: false },
      configurable: true,
    });
    assert.equal(trackPageView('/'), false, 'Must not track with DNT active');
    assert.equal(fbqCalls.length, 0);

    // Set GPC
    Object.defineProperty(globalThis, 'navigator', {
      value: { doNotTrack: '0', globalPrivacyControl: true },
      configurable: true,
    });
    assert.equal(trackPageView('/'), false, 'Must not track with GPC active');
    assert.equal(fbqCalls.length, 0);
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

test('trackShoppingEvent maps AddToCart and InitiateCheckout to Meta standard events with correct payload', () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const fbqCalls: unknown[][] = [];

  globalThis.window = {
    fbq: (...args: unknown[]) => fbqCalls.push(args),
    lifeiAnalyticsConsent: true,
  } as unknown as Window & typeof globalThis;

  Object.defineProperty(globalThis, 'navigator', {
    value: { doNotTrack: '0', globalPrivacyControl: false },
    configurable: true,
  });

  const mockProduct = createMockProduct('prod_100', 52, 'USD');
  const cartItem: CartItem = {
    product: mockProduct,
    quantity: 2,
    variantId: 'gid://shopify/ProductVariant/100_var',
  };

  try {
    // 1. AddToCart
    const addSuccess = trackShoppingEvent('add_to_cart', [cartItem]);
    assert.equal(addSuccess, true, 'AddToCart should succeed');
    assert.equal(fbqCalls.length, 1);
    assert.equal(fbqCalls[0][0], 'track');
    assert.equal(fbqCalls[0][1], 'AddToCart');
    const addPayload = fbqCalls[0][2] as Record<string, unknown>;
    assert.deepEqual(addPayload.content_ids, ['gid://shopify/ProductVariant/100_var']);
    assert.equal(addPayload.content_type, 'product');
    assert.equal(addPayload.value, 104);
    assert.equal(addPayload.currency, 'USD');

    // 2. InitiateCheckout
    const checkoutSuccess = trackShoppingEvent('begin_checkout', [cartItem]);
    assert.equal(checkoutSuccess, true, 'InitiateCheckout should succeed');
    assert.equal(fbqCalls.length, 2);
    assert.equal(fbqCalls[1][0], 'track');
    assert.equal(fbqCalls[1][1], 'InitiateCheckout');
    const checkoutPayload = fbqCalls[1][2] as Record<string, unknown>;
    assert.deepEqual(checkoutPayload.content_ids, ['gid://shopify/ProductVariant/100_var']);
    assert.equal(checkoutPayload.content_type, 'product');
    assert.equal(checkoutPayload.value, 104);
    assert.equal(checkoutPayload.num_items, 2);

    // 3. ViewContent
    const viewSuccess = trackShoppingEvent('view_item', [cartItem]);
    assert.equal(viewSuccess, true);
    assert.equal(fbqCalls.length, 3);
    assert.equal(fbqCalls[2][1], 'ViewContent');

    // Verify no customer PII leaked
    const jsonCalls = JSON.stringify(fbqCalls);
    assert.doesNotMatch(jsonCalls, /email|phone|address|firstName|lastName|password/i);
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
    else globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});
