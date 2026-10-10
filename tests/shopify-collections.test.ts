import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import { belongsToCollection, categorizeProduct, type CategorizationProduct } from '../src/services/collectionRules.js';
import { adminQuery, authorizeOperator, installWebhooks, loadAdminCollections, loadAdminProduct, verifyWebhook, type AdminCollection } from '../netlify/lib/shopify-admin.js';
import { reviewProduct } from '../netlify/lib/shopify-sync.js';
import webhook from '../netlify/functions/shopify-collection-webhook.mjs';
import operator from '../netlify/functions/shopify-collection-sync.mjs';

function collections(): AdminCollection[] {
  return ['Targeted Serum', 'Bio Collagen Masks', 'Pore Cleanser', 'Barrier Cushion Creams', 'Eye Care', 'Sets & Bundles'].map((title, index) => ({
    id: `gid://shopify/Collection/${index + 1}`, title, handle: title.toLowerCase().replaceAll(' ', '-'), ruleSet: null,
  }));
}

function product(title: string, overrides: Partial<CategorizationProduct> = {}): CategorizationProduct {
  return { title, description: '', productType: '', tags: [], ...overrides };
}

function matches(input: CategorizationProduct) {
  return categorizeProduct(input, collections()).collections.map(collection => collection.title);
}

test('matches confirmed collection names for targeted facial serums', () => {
  for (const title of ['PDRN Pink Peptide Serum', 'EGF Firming Serum', 'Kojic Acid Capsule Serum', 'Vitamin C Treatment Serum']) {
    assert.deepEqual(matches(product(title)), ['Targeted Serum']);
  }
});

test('matches masks, cleansers, toners, exfoliants, and moisturizing creams', () => {
  assert.deepEqual(matches(product('Bio-Collagen Hydrogel Face Mask')), ['Bio Collagen Masks']);
  assert.deepEqual(matches(product('Hydrating Sheet Masks')), ['Bio Collagen Masks']);
  assert.deepEqual(matches(product('AHA BHA Facial Cleanser')), ['Pore Cleanser']);
  assert.deepEqual(matches(product('Green Tea Toner')), ['Pore Cleanser']);
  assert.deepEqual(matches(product('Gentle Facial Exfoliant')), ['Pore Cleanser']);
  assert.deepEqual(matches(product('Ceramide Barrier Cream')), ['Barrier Cushion Creams']);
});

test('does not assign unrelated products based on routine keywords, ingredients, or loose tags', () => {
  assert.deepEqual(matches(product('Revitalize Eye Therapy Patches', { description: 'Use after your cleanser and before peptide serum and barrier cream.' })), ['Eye Care']);
  assert.deepEqual(matches(product('Collagen Dietary Capsules', { tags: ['serum', 'mask'], description: 'Take this supplement after your serum routine.' })), []);
  assert.deepEqual(matches(product('Hair Serum', { productType: 'Serum', tags: ['PDRN'] })), []);
  assert.deepEqual(matches(product('Mask Brush')), []);
  assert.deepEqual(matches(product('Empty Serum Bottle')), []);
  assert.deepEqual(matches(product('Mystery Beauty Product', { tags: ['serum'], description: 'A relaxing bath product.' })), []);
  assert.deepEqual(matches(product('Mystery Beauty Product', { tags: ['serum'], description: 'Use this product after your cleanser and before your serum.' })), []);
});

test('uses taxonomy and corroborated metadata while rejecting conflicting identities', () => {
  assert.deepEqual(matches(product('Radiance Treatment', { category: { fullName: 'Health & Beauty > Skin Care > Facial Serums' } })), ['Targeted Serum']);
  assert.deepEqual(matches(product('Radiance & Pore Refinement Pads', { description: 'These exfoliating toner pads cleanse facial pores.' })), ['Pore Cleanser']);
  assert.deepEqual(matches(product('Radiance Treatment', { tags: ['Serum'], description: 'A facial serum with peptides.' })), ['Targeted Serum']);
  const conflict = categorizeProduct(product('Hydrogel Face Mask', { productType: 'Facial Serum' }), collections());
  assert.equal(conflict.collections.length, 0);
  assert.ok(conflict.reviewReasons.length > 0);
});

test('supports multiple applicable memberships and does not guess seasonal collections', () => {
  assert.deepEqual(matches(product('Serum & Cream Set')), ['Targeted Serum', 'Barrier Cushion Creams', 'Sets & Bundles']);
  const other = { id: 'gid://shopify/Collection/99', title: 'Winter Essentials', handle: 'winter-essentials', ruleSet: null };
  const input = product('Peptide Serum', { description: 'A moisturizing facial serum.' });
  assert.equal(categorizeProduct(input, [...collections(), other]).collections.some(collection => collection.id === other.id), false);
  assert.equal(categorizeProduct({ ...input, tags: ['Winter Essentials'] }, [...collections(), other]).collections.some(collection => collection.id === other.id), true);
});

test('flags missing collections and restricts specialized existing collections', () => {
  const input = product('Peptide Serum');
  const missing = categorizeProduct(input, []);
  assert.equal(missing.collections.length, 0);
  assert.ok(missing.reviewReasons[0].includes('No existing Shopify collection'));
  const extra = ['Toners', 'Ceramide Creams', 'Hydrogel Masks'].map((title, index) => ({ id: `extra-${index}`, title, handle: title, ruleSet: null }));
  assert.deepEqual(categorizeProduct(product('Foaming Facial Cleanser'), extra).collections, []);
  assert.deepEqual(categorizeProduct(product('Collagen Moisturizing Cream'), extra).collections, []);
  assert.deepEqual(categorizeProduct(product('Clay Face Mask'), extra).collections, []);
});

test('storefront filtering trusts all saved memberships, never a guessed product category', () => {
  const assigned = { collections: [collections()[0], collections()[3]] };
  assert.equal(belongsToCollection(assigned, 'serums'), true);
  assert.equal(belongsToCollection(assigned, 'moisturizers'), true);
  assert.equal(belongsToCollection(assigned, 'masks'), false);
  assert.equal(belongsToCollection({}, 'serums'), false);
  assert.equal(belongsToCollection({}, 'all'), true);
});

test('verifies raw-body webhook HMAC and operator authentication in constant-time comparisons', () => {
  const body = '{"id":42}';
  const secret = 'unit-test-placeholder';
  const signature = createHmac('sha256', secret).update(body).digest('base64');
  assert.equal(verifyWebhook(body, signature, secret), true);
  assert.equal(verifyWebhook(`${body} `, signature, secret), false);
  assert.equal(verifyWebhook(body, 'bad-signature', secret), false);
  assert.equal(verifyWebhook(body, null, secret), false);
  const previous = process.env.SHOPIFY_SYNC_SECRET;
  process.env.SHOPIFY_SYNC_SECRET = secret;
  try {
    assert.equal(authorizeOperator(new Request('https://example.invalid', { headers: { authorization: `Bearer ${secret}` } })), true);
    assert.equal(authorizeOperator(new Request('https://example.invalid')), false);
  } finally {
    if (previous === undefined) delete process.env.SHOPIFY_SYNC_SECRET;
    else process.env.SHOPIFY_SYNC_SECRET = previous;
  }
});

async function withShopifyFixture(action: (requests: string[], existing: Set<string>) => Promise<void>, options: { unpublished?: boolean; storefrontDelayed?: boolean; assignmentRejected?: boolean; smart?: boolean; title?: string } = {}) {
  const savedFetch = globalThis.fetch;
  const savedEnvironment = { ...process.env };
  process.env.SHOPIFY_SYNC_ENABLED = 'true';
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'unit-test-placeholder';
  process.env.SHOPIFY_WEBHOOK_SECRET = 'unit-test-placeholder';
  process.env.SHOPIFY_SYNC_SECRET = 'unit-test-placeholder';
  process.env.SHOPIFY_STORE_DOMAIN = 'maison-co-store1.myshopify.com';
  process.env.SHOPIFY_API_VERSION = '2026-10';
  process.env.CONTEXT = 'production';
  const requests: string[] = [];
  const existing = new Set(['gid://shopify/Collection/999']);
  globalThis.fetch = async (input, init) => {
    const { query, variables } = JSON.parse(String(init?.body));
    requests.push(query);
    if (String(input).includes('/admin/')) {
      if (query.includes('mutation AddProduct')) {
        assert.deepEqual(variables.products, ['gid://shopify/Product/42']);
        if (!options.assignmentRejected) existing.add(variables.id);
        return Response.json({ data: { collectionAddProducts: { userErrors: options.assignmentRejected ? [{ message: 'fixture rejection' }] : [] } } });
      }
      return Response.json({ data: { product: {
        ...product(options.title || 'PDRN Peptide Serum'), id: 'gid://shopify/Product/42', status: options.unpublished ? 'DRAFT' : 'ACTIVE', updatedAt: '2026-10-10T00:00:00Z',
        collections: { nodes: [...existing].map(id => ({ id, title: 'Saved manual collection', handle: 'manual' })), pageInfo: { hasNextPage: false, endCursor: null } },
      } } });
    }
    return Response.json({ data: { product: options.unpublished ? null : { collections: {
      nodes: [...existing].filter(id => !options.storefrontDelayed || id !== collections()[0].id).map(id => ({ id })), pageInfo: { hasNextPage: false, endCursor: null },
    } } } });
  };
  try {
    await action(requests, existing);
  } finally {
    globalThis.fetch = savedFetch;
    for (const key of Object.keys(process.env)) if (!(key in savedEnvironment)) delete process.env[key];
    Object.assign(process.env, savedEnvironment);
  }
}

test('product processing verifies assignments and repeats without duplicate additions', async () => {
  await withShopifyFixture(async (requests, existing) => {
    const first = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(first?.values.status, 'verified');
    assert.equal(first?.values.storefrontVerified, true);
    assert.ok(existing.has('gid://shopify/Collection/999'));
    const second = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(second?.complete, true);
    assert.equal(requests.filter(query => query.includes('mutation AddProduct')).length, 1);
    assert.equal(requests.some(query => /productCreate|collectionCreate|collectionRemoveProducts|productUpdate/.test(query)), false);
  });
});

test('metadata updates add the new appropriate collection without removing earlier assignments', async () => {
  const options = { title: 'Peptide Serum' };
  await withShopifyFixture(async (requests, existing) => {
    await reviewProduct('gid://shopify/Product/42', collections());
    options.title = 'Bio Collagen Hydrogel Face Mask';
    const updated = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(updated?.values.status, 'verified');
    assert.ok(existing.has(collections()[0].id));
    assert.ok(existing.has(collections()[1].id));
    assert.ok(existing.has('gid://shopify/Collection/999'));
    assert.equal(requests.filter(query => query.includes('mutation AddProduct')).length, 2);
  }, options);
});

test('future publication verifies an already categorized draft without re-adding its membership', async () => {
  const options = { unpublished: true };
  await withShopifyFixture(async requests => {
    const draft = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(draft?.values.status, 'categorized_unpublished');
    options.unpublished = false;
    const published = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(published?.values.status, 'verified');
    assert.equal(published?.values.storefrontVerified, true);
    assert.equal(requests.filter(query => query.includes('mutation AddProduct')).length, 1);
  }, options);
});

test('unpublished products are categorized without claiming website visibility', async () => {
  await withShopifyFixture(async () => {
    const result = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(result?.values.status, 'categorized_unpublished');
    assert.equal(result?.values.storefrontVerified, false);
    assert.equal(result?.complete, true);
  }, { unpublished: true });
});

test('delayed Storefront propagation remains pending and eligible for retry', async () => {
  await withShopifyFixture(async () => {
    const result = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(result?.values.status, 'publication_pending');
    assert.equal(result?.values.storefrontVerified, false);
    assert.equal(result?.complete, false);
  }, { storefrontDelayed: true });
});

test('unclear products preserve manual assignments and are flagged instead of mutated', async () => {
  await withShopifyFixture(async (requests, existing) => {
    const result = await reviewProduct('gid://shopify/Product/42', collections());
    assert.equal(result?.values.status, 'manual_review');
    assert.ok(result?.values.reasons.length);
    assert.equal(existing.size, 1);
    assert.equal(requests.some(query => query.includes('mutation')), false);
  }, { title: 'Radiance Boost Capsules' });
});

test('automated collection rules remain unchanged and missing smart memberships need review', async () => {
  await withShopifyFixture(async requests => {
    const targets = collections();
    targets[0].ruleSet = { appliedDisjunctively: true, rules: [] };
    const result = await reviewProduct('gid://shopify/Product/42', targets);
    assert.equal(result?.values.status, 'manual_review');
    assert.equal(result?.values.storefrontVerified, false);
    assert.equal(requests.some(query => query.includes('mutation')), false);
  });
});

test('rejected assignments are never reported as confirmed', async () => {
  await withShopifyFixture(async () => {
    await assert.rejects(reviewProduct('gid://shopify/Product/42', collections()), /COLLECTION_ASSIGNMENT_REJECTED/);
  }, { assignmentRejected: true });
});

test('Admin reads paginate collections and product memberships', async () => {
  await withShopifyFixture(async () => {
    let pages = 0;
    globalThis.fetch = async (_input, init) => {
      const { query, variables } = JSON.parse(String(init?.body));
      pages += 1;
      if (query.includes('query Collections')) {
        return Response.json({ data: { collections: { nodes: [collections()[variables.after ? 1 : 0]], pageInfo: { hasNextPage: !variables.after, endCursor: variables.after ? null : 'cursor-1' } } } });
      }
      const connection = { nodes: [collections()[variables.after ? 1 : 0]], pageInfo: { hasNextPage: !variables.after, endCursor: variables.after ? null : 'cursor-1' } };
      return Response.json({ data: { product: { ...product('Serum'), collections: connection } } });
    };
    assert.equal((await loadAdminCollections()).length, 2);
    assert.equal((await loadAdminProduct('gid://shopify/Product/42'))?.collections.nodes.length, 2);
    assert.equal(pages, 4);
  });
});

test('temporary Admin failures retry; rejected permissions fail safely without leaking provider text', async () => {
  await withShopifyFixture(async () => {
    let requests = 0;
    globalThis.fetch = async () => {
      requests += 1;
      return requests === 1 ? new Response(null, { status: 429 }) : Response.json({ data: { value: true } });
    };
    assert.deepEqual(await adminQuery('query { value }'), { value: true });
    assert.equal(requests, 2);
    globalThis.fetch = async () => new Response('provider response must not escape', { status: 403 });
    await assert.rejects(adminQuery('query { value }'), /ADMIN_ACCESS_REJECTED/);
  });
});

test('webhook setup adds only missing app-owned subscriptions and is idempotent', async () => {
  await withShopifyFixture(async () => {
    const installed = ['PRODUCTS_CREATE', 'PRODUCTS_UPDATE', 'PRODUCTS_DELETE', 'COLLECTIONS_CREATE', 'COLLECTIONS_UPDATE'];
    let additions = 0;
    globalThis.fetch = async (_input, init) => {
      const { query, variables } = JSON.parse(String(init?.body));
      if (query.includes('mutation Subscribe')) {
        additions += 1;
        installed.push(variables.topic);
        assert.equal(variables.input.uri, 'https://lifeibeauty.com/api/shopify/collection-webhook');
        return Response.json({ data: { webhookSubscriptionCreate: { userErrors: [] } } });
      }
      return Response.json({ data: { webhookSubscriptions: {
        nodes: installed.map(topic => ({ topic, uri: 'https://lifeibeauty.com/api/shopify/collection-webhook' })),
        pageInfo: { hasNextPage: false, endCursor: null },
      } } });
    };
    assert.equal((await installWebhooks()).length, 6);
    assert.equal((await installWebhooks()).length, 6);
    assert.equal(additions, 1);
  });
});

test('disabled or unsigned endpoints reject work before touching persistence', async () => {
  const previousEnabled = process.env.SHOPIFY_SYNC_ENABLED;
  const previousSecret = process.env.SHOPIFY_SYNC_SECRET;
  delete process.env.SHOPIFY_SYNC_ENABLED;
  delete process.env.SHOPIFY_SYNC_SECRET;
  try {
    assert.equal((await webhook(new Request('https://example.invalid', { method: 'POST', body: '{}' }))).status, 503);
    assert.equal((await operator(new Request('https://example.invalid'))).status, 401);
  } finally {
    if (previousEnabled !== undefined) process.env.SHOPIFY_SYNC_ENABLED = previousEnabled;
    if (previousSecret !== undefined) process.env.SHOPIFY_SYNC_SECRET = previousSecret;
  }
});
