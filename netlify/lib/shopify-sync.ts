import { randomUUID } from 'node:crypto';
import { and, eq, isNull, lte, or, sql } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { shopifyProductJobs, shopifyProductReviews, shopifySyncState, shopifyWebhookEvents } from '../../db/schema.js';
import { categorizeProduct } from '../../src/services/collectionRules.js';
import { addProductToCollection, adminQuery, loadAdminCollections, loadAdminProduct, safeError, storefrontMemberships, syncConfiguration, SyncError, type AdminCollection } from './shopify-admin.js';

export async function enqueueProduct(productId: string): Promise<void> {
  const database = getDatabase();
  await database.insert(shopifyProductJobs).values({ productId }).onConflictDoUpdate({
    target: shopifyProductJobs.productId,
    set: {
      revision: sql`${shopifyProductJobs.revision} + 1`,
      status: 'pending',
      attempts: 0,
      nextAttemptAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function requestFullScan(): Promise<void> {
  await getDatabase().insert(shopifySyncState).values({ id: 'catalog' }).onConflictDoUpdate({
    target: shopifySyncState.id,
    set: { scanRequested: true },
  });
}

async function drainEvents(): Promise<void> {
  const database = getDatabase();
  const events = await database.select().from(shopifyWebhookEvents).where(isNull(shopifyWebhookEvents.processedAt)).limit(50);
  for (const event of events) {
    if (event.productId) await enqueueProduct(event.productId);
    else await requestFullScan();
    await database.update(shopifyWebhookEvents).set({ processedAt: new Date() }).where(eq(shopifyWebhookEvents.id, event.id));
  }
  await database.delete(shopifyWebhookEvents).where(and(
    lte(shopifyWebhookEvents.receivedAt, new Date(Date.now() - 14 * 86400000)),
    sql`${shopifyWebhookEvents.processedAt} IS NOT NULL`,
  ));
}

async function scanPage(lockToken: string): Promise<void> {
  const database = getDatabase();
  const [state] = await database.select().from(shopifySyncState).where(eq(shopifySyncState.id, 'catalog'));
  if (!state.scanActive && (state.scanRequested || state.nextScanAt <= new Date())) {
    await database.update(shopifySyncState).set({
      scanActive: true, scanRequested: false, cursor: null, scanCount: 0, scanStartedAt: new Date(), scanCompletedAt: null,
    }).where(eq(shopifySyncState.lockToken, lockToken));
    state.cursor = null;
    state.scanActive = true;
  }
  if (!state.scanActive) return;
  const data = await adminQuery<{ products: { nodes: { id: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }>(`
    query AllProducts($after: String) {
      products(first: 25, after: $after, sortKey: ID) {
        nodes { id }
        pageInfo { hasNextPage endCursor }
      }
    }
  `, { after: state.cursor });
  for (const product of data.products.nodes) await enqueueProduct(product.id);
  const page = data.products.pageInfo;
  if (page.hasNextPage && !page.endCursor) throw new SyncError('INVALID_PRODUCT_CURSOR');
  await database.update(shopifySyncState).set({
    cursor: page.hasNextPage ? page.endCursor : null,
    scanCount: sql`${shopifySyncState.scanCount} + ${data.products.nodes.length}`,
    scanActive: page.hasNextPage,
    ...(!page.hasNextPage ? { scanCompletedAt: new Date(), nextScanAt: new Date(Date.now() + 86400000) } : {}),
  }).where(eq(shopifySyncState.lockToken, lockToken));
}

export async function reviewProduct(productId: string, collections: AdminCollection[]) {
  const product = await loadAdminProduct(productId);
  if (!product) return null;
  const decision = categorizeProduct(product, collections);
  const reviewReasons = [...decision.reviewReasons];
  const existing = new Set(product.collections.nodes.map(collection => collection.id));
  for (const collection of decision.collections) {
    if (existing.has(collection.id)) continue;
    if (collection.ruleSet) {
      reviewReasons.push(`Collection “${collection.title}” uses Shopify automated rules; manual assignment is unsupported and its rules were preserved.`);
      continue;
    }
    await addProductToCollection(product.id, collection.id);
  }
  const confirmed = await loadAdminProduct(product.id);
  if (!confirmed) throw new SyncError('PRODUCT_CHANGED_DURING_ASSIGNMENT');
  if (confirmed.updatedAt !== product.updatedAt && (
    confirmed.title !== product.title || confirmed.productType !== product.productType ||
    confirmed.description !== product.description || confirmed.vendor !== product.vendor ||
    confirmed.category?.fullName !== product.category?.fullName || JSON.stringify(confirmed.tags) !== JSON.stringify(product.tags)
  )) throw new SyncError('PRODUCT_CHANGED_DURING_ASSIGNMENT');
  const confirmedIds = confirmed.collections.nodes.map(collection => collection.id);
  const expected = decision.collections.filter(collection => !collection.ruleSet || existing.has(collection.id));
  if (expected.some(collection => !confirmedIds.includes(collection.id))) throw new SyncError('ASSIGNMENT_NOT_YET_CONFIRMED');
  const storefront = await storefrontMemberships(product.id);
  const storefrontVerified = storefront.visible && decision.collections.length > 0 && decision.collections.every(collection => storefront.collectionIds.includes(collection.id));
  const publicationPending = product.status === 'ACTIVE' && expected.length > 0 && (!storefront.visible || expected.some(collection => !storefront.collectionIds.includes(collection.id)));
  const reasons = [...reviewReasons];
  if (publicationPending) reasons.push('Awaiting product/collection publication or Storefront propagation. Verify availability on this Storefront sales channel.');
  const values = {
    productId: product.id,
    title: product.title,
    productStatus: product.status,
    status: reviewReasons.length ? 'manual_review' : publicationPending ? 'publication_pending' : product.status !== 'ACTIVE' ? 'categorized_unpublished' : 'verified',
    reasons,
    matchedCollections: decision.collections.map(collection => collection.id),
    verifiedCollections: confirmedIds,
    storefrontVerified,
    reviewedAt: new Date(),
  };
  return { values, complete: !publicationPending };
}

async function processProduct(productId: string, collections: AdminCollection[]): Promise<boolean> {
  const database = getDatabase();
  const review = await reviewProduct(productId, collections);
  if (!review) {
    await database.delete(shopifyProductReviews).where(eq(shopifyProductReviews.productId, productId));
    return true;
  }
  await database.insert(shopifyProductReviews).values(review.values).onConflictDoUpdate({ target: shopifyProductReviews.productId, set: review.values });
  return review.complete;
}

export async function runSync(durationMs = 12000) {
  syncConfiguration();
  const database = getDatabase();
  const deadline = Date.now() + durationMs;
  const lockToken = randomUUID();
  await database.insert(shopifySyncState).values({ id: 'catalog' }).onConflictDoNothing();
  const lock = await database.update(shopifySyncState).set({
    lockToken, lockedUntil: new Date(deadline + 120000),
  }).where(and(eq(shopifySyncState.id, 'catalog'), or(isNull(shopifySyncState.lockedUntil), lte(shopifySyncState.lockedUntil, new Date())))).returning();
  if (!lock.length) return { status: 'already_running', processed: 0 };
  let processed = 0;
  try {
    await drainEvents();
    const collections = await loadAdminCollections();
    if (!collections.length) throw new SyncError('NO_EXISTING_COLLECTIONS', false);
    while (Date.now() < deadline) {
      await scanPage(lockToken);
      const jobs = await database.select().from(shopifyProductJobs).where(and(
        or(eq(shopifyProductJobs.status, 'pending'), eq(shopifyProductJobs.status, 'retry')),
        lte(shopifyProductJobs.nextAttemptAt, new Date()),
      )).orderBy(shopifyProductJobs.nextAttemptAt).limit(10);
      for (const job of jobs) {
        if (Date.now() >= deadline) break;
        try {
          const complete = await processProduct(job.productId, collections);
          await database.update(shopifyProductJobs).set({
            status: complete ? 'complete' : 'retry',
            attempts: complete ? 0 : job.attempts + 1,
            nextAttemptAt: new Date(Date.now() + Math.min(21600000, 300000 * 2 ** Math.min(job.attempts, 7))),
            updatedAt: new Date(),
          }).where(and(eq(shopifyProductJobs.productId, job.productId), eq(shopifyProductJobs.revision, job.revision)));
          processed += 1;
        } catch (error) {
          await database.update(shopifyProductJobs).set({
            status: 'retry', attempts: job.attempts + 1,
            nextAttemptAt: new Date(Date.now() + Math.min(21600000, 300000 * 2 ** Math.min(job.attempts, 7))), updatedAt: new Date(),
          }).where(and(eq(shopifyProductJobs.productId, job.productId), eq(shopifyProductJobs.revision, job.revision)));
          await database.update(shopifySyncState).set({ lastError: safeError(error) }).where(eq(shopifySyncState.lockToken, lockToken));
          if (error instanceof SyncError && !error.retryable) throw error;
        }
      }
      const [state] = await database.select().from(shopifySyncState).where(eq(shopifySyncState.lockToken, lockToken));
      if (!state.scanActive && jobs.length === 0) break;
    }
    const outstanding = await database.select({ count: sql<number>`count(*)::int` }).from(shopifyProductJobs).where(sql`${shopifyProductJobs.status} <> 'complete'`);
    if (outstanding[0].count === 0) await database.update(shopifySyncState).set({ lastError: null }).where(eq(shopifySyncState.lockToken, lockToken));
    return { status: 'processed', processed };
  } catch (error) {
    await database.update(shopifySyncState).set({ lastError: safeError(error) }).where(eq(shopifySyncState.lockToken, lockToken));
    throw error;
  } finally {
    await database.update(shopifySyncState).set({ lockToken: null, lockedUntil: null }).where(eq(shopifySyncState.lockToken, lockToken));
  }
}

export async function syncStatus(reviewAfter = '') {
  const database = getDatabase();
  const [state] = await database.select().from(shopifySyncState).where(eq(shopifySyncState.id, 'catalog'));
  const jobs = await database.select({ status: shopifyProductJobs.status, count: sql<number>`count(*)::int` }).from(shopifyProductJobs).groupBy(shopifyProductJobs.status);
  const reviewCounts = await database.select({ status: shopifyProductReviews.status, count: sql<number>`count(*)::int` }).from(shopifyProductReviews).groupBy(shopifyProductReviews.status);
  const pendingJobs = await database.select().from(shopifyProductJobs).where(sql`${shopifyProductJobs.status} <> 'complete'`).orderBy(shopifyProductJobs.nextAttemptAt).limit(100);
  const reviews = await database.select().from(shopifyProductReviews).where(sql`${shopifyProductReviews.productId} > ${reviewAfter}`).orderBy(shopifyProductReviews.productId).limit(100);
  const pendingEvents = await database.select({ count: sql<number>`count(*)::int` }).from(shopifyWebhookEvents).where(isNull(shopifyWebhookEvents.processedAt));
  const outstanding = jobs.filter(job => job.status !== 'complete').reduce((total, job) => total + job.count, 0);
  return {
    activation: 'enabled',
    scan: state ? { active: state.scanActive, scanned: state.scanCount, startedAt: state.scanStartedAt, enumerationCompletedAt: state.scanCompletedAt, lastError: state.lastError } : null,
    allEnumeratedProductsProcessed: !!state?.scanCompletedAt && !state.scanActive && outstanding === 0 && pendingEvents[0].count === 0,
    jobs, pendingJobs, reviewCounts, pendingEvents: pendingEvents[0].count, reviews,
    nextReviewCursor: reviews.length === 100 ? reviews.at(-1)?.productId : null,
  };
}
