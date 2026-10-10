import { createHmac, timingSafeEqual } from 'node:crypto';
import type { CategorizationProduct, CollectionReference } from '../../src/services/collectionRules.js';

export interface AdminCollection extends CollectionReference {
  ruleSet: { appliedDisjunctively: boolean; rules: unknown[] } | null;
}

export interface AdminProduct extends CategorizationProduct {
  id: string;
  status: string;
  updatedAt: string;
  collections: { nodes: CollectionReference[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
}

export class SyncError extends Error {
  constructor(public code: string, public retryable = true) {
    super(code);
  }
}

export function syncConfiguration() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com';
  const version = process.env.SHOPIFY_API_VERSION || '2026-10';
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (domain !== 'maison-co-store1.myshopify.com' || !/^\d{4}-(01|04|07|10)$/.test(version)) throw new SyncError('INVALID_STORE_CONFIGURATION', false);
  if (process.env.SHOPIFY_SYNC_ENABLED !== 'true') throw new SyncError('AUTOMATION_DISABLED', false);
  if (!token) throw new SyncError('MISSING_ADMIN_ACCESS_TOKEN', false);
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) throw new SyncError('MISSING_WEBHOOK_SECRET', false);
  if (!process.env.SHOPIFY_SYNC_SECRET) throw new SyncError('MISSING_OPERATOR_SECRET', false);
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production') throw new SyncError('PRODUCTION_ONLY', false);
  return { domain, version, token };
}

export function authorizeOperator(request: Request): boolean {
  const secret = process.env.SHOPIFY_SYNC_SECRET;
  const header = request.headers.get('authorization') || '';
  if (!secret || !header.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function verifyWebhook(body: string, signature: string | null, secret: string): boolean {
  if (!signature || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(body, 'utf8').digest();
  const supplied = Buffer.from(signature, 'base64');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function safeError(error: unknown): string {
  return error instanceof SyncError ? error.code : 'TEMPORARY_SYNC_FAILURE';
}

export async function adminQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { domain, version, token } = syncConfiguration();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new SyncError('SHOPIFY_CONNECTION_FAILURE');
    }
    if (response.status === 401 || response.status === 403) throw new SyncError('ADMIN_ACCESS_REJECTED', false);
    if (response.status === 429 || response.status >= 500) {
      if (attempt === 2) throw new SyncError('SHOPIFY_RATE_LIMIT_OR_OUTAGE');
      const retryAfter = Number(response.headers.get('Retry-After'));
      await new Promise(resolve => setTimeout(resolve, Math.min(3000, Math.max(500, retryAfter * 1000 || 500 * 2 ** attempt))));
      continue;
    }
    if (!response.ok) throw new SyncError('SHOPIFY_REQUEST_REJECTED', false);
    const servedVersion = response.headers.get('x-shopify-api-version');
    if (servedVersion && servedVersion !== version) throw new SyncError('UNSUPPORTED_ADMIN_API_VERSION', false);
    const payload = await response.json();
    if (payload.errors?.length) {
      if (payload.errors.every((error: { extensions?: { code?: string } }) => error.extensions?.code === 'THROTTLED') && attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      if (payload.errors.some((error: { extensions?: { code?: string } }) => error.extensions?.code === 'ACCESS_DENIED')) throw new SyncError('INSUFFICIENT_ADMIN_SCOPES', false);
      throw new SyncError('SHOPIFY_GRAPHQL_ERROR');
    }
    if (!payload.data) throw new SyncError('INVALID_SHOPIFY_RESPONSE');
    const budget = payload.extensions?.cost?.throttleStatus;
    if (budget && budget.currentlyAvailable < 100 && budget.restoreRate > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(2000, ((100 - budget.currentlyAvailable) / budget.restoreRate) * 1000)));
    }
    return payload.data as T;
  }
  throw new SyncError('SHOPIFY_RETRY_EXHAUSTED');
}

export async function loadAdminCollections(): Promise<AdminCollection[]> {
  const collections: AdminCollection[] = [];
  let after: string | null = null;
  do {
    const data: { collections: { nodes: AdminCollection[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await adminQuery(`
      query Collections($after: String) {
        collections(first: 100, after: $after) {
          nodes { id title handle ruleSet { appliedDisjunctively rules { column relation condition } } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `, { after });
    collections.push(...data.collections.nodes);
    after = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null;
    if (data.collections.pageInfo.hasNextPage && !after) throw new SyncError('INVALID_COLLECTION_CURSOR');
  } while (after);
  return collections;
}

export async function loadAdminProduct(id: string): Promise<AdminProduct | null> {
  const data = await adminQuery<{ product: AdminProduct | null }>(`
    query Product($id: ID!) {
      product(id: $id) {
        id title productType tags description vendor status updatedAt category { fullName }
        collections(first: 100) { nodes { id title handle } pageInfo { hasNextPage endCursor } }
      }
    }
  `, { id });
  const product = data.product;
  if (!product) return null;
  while (product.collections.pageInfo.hasNextPage) {
    const after = product.collections.pageInfo.endCursor;
    if (!after) throw new SyncError('INVALID_MEMBERSHIP_CURSOR');
    const page = await adminQuery<{ product: { collections: AdminProduct['collections'] } | null }>(`
      query Memberships($id: ID!, $after: String!) {
        product(id: $id) { collections(first: 100, after: $after) { nodes { id title handle } pageInfo { hasNextPage endCursor } } }
      }
    `, { id, after });
    if (!page.product) throw new SyncError('PRODUCT_CHANGED_DURING_READ');
    product.collections.nodes.push(...page.product.collections.nodes);
    product.collections.pageInfo = page.product.collections.pageInfo;
  }
  return product;
}

export async function addProductToCollection(productId: string, collectionId: string): Promise<void> {
  const data = await adminQuery<{ collectionAddProducts: { userErrors: { message: string }[] } }>(`
    mutation AddProduct($id: ID!, $products: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $products) { userErrors { field message } }
    }
  `, { id: collectionId, products: [productId] });
  if (data.collectionAddProducts.userErrors.length) {
    const current = await loadAdminProduct(productId);
    if (current?.collections.nodes.some(collection => collection.id === collectionId)) return;
    throw new SyncError('COLLECTION_ASSIGNMENT_REJECTED');
  }
}

export async function storefrontMemberships(productId: string): Promise<{ visible: boolean; collectionIds: string[] }> {
  const { domain, version } = syncConfiguration();
  const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (publicToken) headers['X-Shopify-Storefront-Access-Token'] = publicToken;
  if (privateToken) headers['Shopify-Storefront-Private-Token'] = privateToken;
  const collectionIds: string[] = [];
  let after: string | null = null;
  do {
    const response: Response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: 'POST', headers,
      body: JSON.stringify({ query: `query VisibleProduct($id: ID!, $after: String) { product(id: $id) { collections(first: 100, after: $after) { nodes { id } pageInfo { hasNextPage endCursor } } } }`, variables: { id: productId, after } }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new SyncError('STOREFRONT_VERIFICATION_UNAVAILABLE');
    const payload: { errors?: unknown[]; data?: { product: { collections: { nodes: { id: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } | null } } = await response.json();
    if (payload.errors?.length || !payload.data) throw new SyncError('STOREFRONT_VERIFICATION_UNAVAILABLE');
    if (!payload.data.product) return { visible: false, collectionIds: [] };
    const connection: { nodes: { id: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } = payload.data.product.collections;
    collectionIds.push(...connection.nodes.map((collection: { id: string }) => collection.id));
    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    if (connection.pageInfo.hasNextPage && !after) throw new SyncError('INVALID_STOREFRONT_CURSOR');
  } while (after);
  return { visible: true, collectionIds };
}

export async function installWebhooks(): Promise<string[]> {
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) throw new SyncError('MISSING_WEBHOOK_SECRET', false);
  const callback = 'https://lifeibeauty.com/api/shopify/collection-webhook';
  const installed: string[] = [];
  let after: string | null = null;
  do {
    const data: { webhookSubscriptions: { nodes: { topic: string; uri: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await adminQuery(`
      query Webhooks($after: String) {
        webhookSubscriptions(first: 100, after: $after) { nodes { topic uri } pageInfo { hasNextPage endCursor } }
      }
    `, { after });
    installed.push(...data.webhookSubscriptions.nodes.filter(subscription => subscription.uri === callback).map(subscription => subscription.topic));
    after = data.webhookSubscriptions.pageInfo.hasNextPage ? data.webhookSubscriptions.pageInfo.endCursor : null;
    if (data.webhookSubscriptions.pageInfo.hasNextPage && !after) throw new SyncError('INVALID_WEBHOOK_CURSOR');
  } while (after);
  const required = ['PRODUCTS_CREATE', 'PRODUCTS_UPDATE', 'PRODUCTS_DELETE', 'COLLECTIONS_CREATE', 'COLLECTIONS_UPDATE', 'COLLECTIONS_DELETE'];
  for (const topic of required) {
    if (installed.includes(topic)) continue;
    const data = await adminQuery<{ webhookSubscriptionCreate: { userErrors: unknown[] } }>(`
      mutation Subscribe($topic: WebhookSubscriptionTopic!, $input: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $input) { userErrors { field message } }
      }
    `, { topic, input: { uri: callback, format: 'JSON' } });
    if (data.webhookSubscriptionCreate.userErrors.length) throw new SyncError('WEBHOOK_REGISTRATION_REJECTED', false);
  }
  return required;
}
