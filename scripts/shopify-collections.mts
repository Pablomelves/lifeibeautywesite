import { categorizeProduct, collectionFamily, type CategorizationProduct, type CollectionReference } from '../src/services/collectionRules.js';

async function auditStorefront() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com';
  const version = process.env.SHOPIFY_API_VERSION || '2026-10';
  if (domain !== 'maison-co-store1.myshopify.com' || !/^\d{4}-(01|04|07|10)$/.test(version)) throw new Error('Invalid existing-store configuration.');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) headers['X-Shopify-Storefront-Access-Token'] = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) headers['Shopify-Storefront-Private-Token'] = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  async function query<T>(document: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: 'POST', headers, body: JSON.stringify({ query: document, variables }), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Storefront connection failed.');
    const payload = await response.json();
    if (payload.errors?.length || !payload.data) throw new Error('Storefront query failed.');
    return payload.data;
  }
  const collections: CollectionReference[] = [];
  let after: string | null = null;
  do {
    const data: { collections: { nodes: CollectionReference[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await query(`query Collections($after: String) { collections(first: 100, after: $after) { nodes { id title handle } pageInfo { hasNextPage endCursor } } }`, { after });
    collections.push(...data.collections.nodes);
    after = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null;
    if (data.collections.pageInfo.hasNextPage && !after) throw new Error('Invalid collection cursor.');
  } while (after);
  let reviewed = 0;
  let manualReview = 0;
  const productIds = new Set<string>();
  const familyCounts: Record<string, number> = {};
  do {
    const data: { products: { nodes: (CategorizationProduct & { id: string })[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await query(`query Products($after: String) { products(first: 100, after: $after) { nodes { id title description productType tags vendor } pageInfo { hasNextPage endCursor } } }`, { after });
    for (const product of data.products.nodes) {
      reviewed += 1;
      productIds.add(product.id);
      const result = categorizeProduct(product, collections);
      if (result.reviewReasons.length) manualReview += 1;
      for (const family of result.families) familyCounts[family] = (familyCounts[family] || 0) + 1;
    }
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    if (data.products.pageInfo.hasNextPage && !after) throw new Error('Invalid product cursor.');
  } while (after);
  console.log(JSON.stringify({
    mode: 'read_only_storefront_audit', publishedProductsReviewed: reviewed, distinctProductIds: productIds.size,
    visibleCollections: collections.map(collection => collection.title),
    missingVisibleCollectionFamilies: ['serums', 'masks', 'cleansers', 'moisturizers'].filter(family => !collections.some(collection => collectionFamily(collection.title) === family)),
    manualReview, candidateFamilyCounts: familyCounts,
    limitation: 'Storefront cannot enumerate unpublished products or unpublished collections. No memberships were changed or saved by this audit.',
  }, null, 2));
}

async function main() {
  const [action = 'status', productId] = process.argv.slice(2);
  if (action === 'audit') return auditStorefront();
  if (!['status', 'setup', 'scan', 'run', 'product'].includes(action)) throw new Error('Use status, setup, scan, run, product <Shopify GID>, or audit.');
  const secret = process.env.SHOPIFY_SYNC_SECRET;
  if (!secret) throw new Error('Set SHOPIFY_SYNC_SECRET securely in this shell; do not put it in command arguments.');
  const headers = { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
  const endpoint = 'https://lifeibeauty.com/api/shopify/collection-sync';
  if (action === 'run') {
    const status = await fetch(endpoint, { headers, signal: AbortSignal.timeout(20000) });
    if (!status.ok) throw new Error(`Activation/status check failed (HTTP ${status.status}).`);
    const response = await fetch(`${endpoint}-background`, { method: 'POST', headers, signal: AbortSignal.timeout(20000) });
    if (response.status !== 202) throw new Error(`Background request failed (HTTP ${response.status}).`);
    console.log('Background execution requested. This is not completion confirmation; check status for actual results.');
    return;
  }
  const response = await fetch(endpoint, {
    headers, method: action === 'status' ? 'GET' : 'POST',
    ...(action !== 'status' ? { body: JSON.stringify({ action, productId }) } : {}),
    signal: AbortSignal.timeout(45000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Synchronization request failed: ${result.error || `HTTP ${response.status}`}.`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Synchronization request failed.');
  process.exitCode = 1;
});
