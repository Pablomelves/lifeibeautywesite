import { randomUUID } from 'node:crypto';
import { and, asc, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { productAnalysisScan, productImageAnalysis } from '../../db/schema.js';
import type { ProductAnalysisRecord, ProductAnalysisSource, ProductAnalysisWork, ProductInformation } from '../../src/types/productInformation.js';
import { productFingerprint } from './product-analysis-source.js';

export const scanId = 'storefront-product-images';

export function initialAnalysisWork(source: ProductAnalysisSource, previous?: ProductAnalysisRecord): ProductAnalysisWork {
  const sameDescription = previous?.source.description === source.description && JSON.stringify(previous.source.metadata) === JSON.stringify(source.metadata);
  return {
    description: sameDescription ? previous.work.description : null,
    descriptionAttempts: 0,
    images: source.images.map(image => {
      const cached = previous?.work.images.find(inspection => inspection.image.url === image.url && inspection.image.width === image.width && inspection.image.height === image.height);
      return { image, extraction: cached?.extraction || null, verification: cached?.verification || null, attempts: 0, verificationAttempts: 0, error: null, nextAttemptAt: new Date().toISOString() };
    }),
  };
}

export function equivalentAnalysisSource(first: ProductAnalysisSource, second: ProductAnalysisSource) {
  return productFingerprint({ ...first, updatedAt: '' }) === productFingerprint({ ...second, updatedAt: '' });
}

export interface AnalysisStore {
  acquireLease: () => Promise<string | null>;
  renewLease: (token: string) => Promise<boolean>;
  releaseLease: (token: string) => Promise<void>;
  scanState: () => Promise<{ cursor: string | null; scanActive: boolean; scanRequested: boolean; nextScanAt: Date }>;
  saveCatalogPage: (sources: ProductAnalysisSource[], cursor: string | null, hasNextPage: boolean, token: string) => Promise<void>;
  nextProduct: () => Promise<ProductAnalysisRecord | null>;
  saveProgress: (record: ProductAnalysisRecord, token: string, delay?: number) => Promise<boolean>;
  find: (productId: string) => Promise<ProductAnalysisRecord | null>;
  list: (after?: string | null) => Promise<{ records: ProductAnalysisRecord[]; nextCursor: string | null }>;
  requestScan: () => Promise<void>;
  saveReview: (record: ProductAnalysisRecord) => Promise<boolean>;
  scanError: (code: string, token: string) => Promise<void>;
}

export function getAnalysisStore(): AnalysisStore {
  const database = getDatabase();
  const table = productImageAnalysis;
  const state = productAnalysisScan;
  const record = (row: typeof table.$inferSelect): ProductAnalysisRecord => ({ source: row.source, fingerprint: row.fingerprint, status: row.status, work: row.work, information: row.information, published: row.published, updatedAt: row.updatedAt.toISOString() });
  const initialize = () => database.insert(state).values({ id: scanId }).onConflictDoNothing({ target: state.id });
  const fence = (token: string) => sql`EXISTS (SELECT 1 FROM ${state} WHERE ${state.id} = ${scanId} AND ${state.lockToken} = ${token} AND ${state.lockedUntil} > now())`;
  const store: AnalysisStore = {
    acquireLease: async () => {
      await initialize();
      const token = randomUUID();
      const rows = await database.update(state).set({ lockToken: token, lockedUntil: new Date(Date.now() + 90000) }).where(and(eq(state.id, scanId), or(isNull(state.lockedUntil), lte(state.lockedUntil, new Date())))).returning({ id: state.id });
      return rows.length ? token : null;
    },
    renewLease: async token => {
      const rows = await database.update(state).set({ lockedUntil: new Date(Date.now() + 90000) }).where(and(eq(state.id, scanId), eq(state.lockToken, token), sql`${state.lockedUntil} > now()`)).returning({ id: state.id });
      return rows.length > 0;
    },
    releaseLease: async token => { await database.update(state).set({ lockToken: null, lockedUntil: null }).where(and(eq(state.id, scanId), eq(state.lockToken, token))); },
    scanState: async () => {
      await initialize();
      const [row] = await database.select().from(state).where(eq(state.id, scanId));
      return { cursor: row.cursor, scanActive: row.scanActive, scanRequested: row.scanRequested, nextScanAt: row.nextScanAt };
    },
    saveCatalogPage: async (sources, cursor, hasNextPage, token) => {
      if (!await store.renewLease(token)) return;
      const scan = await store.scanState();
      const starting = !scan.scanActive;
      for (const source of sources) {
        if (!await store.renewLease(token)) return;
        const previous = await store.find(source.productId);
        const fingerprint = productFingerprint(source);
        const incomplete = previous && (!previous.work.description || previous.work.images.some(image => !image.extraction || (image.extraction.facts.length > 0 || image.extraction.comparison.kind !== 'none') && !image.verification));
        if (previous?.fingerprint === fingerprint && !incomplete) continue;
        const unchangedEvidence = previous && equivalentAnalysisSource(previous.source, source);
        const information = unchangedEvidence && previous.information ? { ...previous.information, fingerprint } : null;
        const published = unchangedEvidence && previous.published ? { ...previous.published, fingerprint } : null;
        const values = { productId: source.productId, source, fingerprint, work: initialAnalysisWork(source, previous || undefined), information, published, status: unchangedEvidence && !incomplete ? previous.status : 'pending' as const, nextAttemptAt: new Date(), updatedAt: new Date() };
        await database.execute(sql`INSERT INTO ${table} (product_id, source, fingerprint, work, information, published, status, next_attempt_at, updated_at)
          SELECT ${values.productId}, ${JSON.stringify(values.source)}::jsonb, ${values.fingerprint}, ${JSON.stringify(values.work)}::jsonb, ${information ? JSON.stringify(information) : null}::jsonb, ${published ? JSON.stringify(published) : null}::jsonb, ${values.status}, ${values.nextAttemptAt.toISOString()}::timestamptz, ${values.updatedAt.toISOString()}::timestamptz
          WHERE ${fence(token)}
          ON CONFLICT (product_id) DO UPDATE SET source = EXCLUDED.source, fingerprint = EXCLUDED.fingerprint, work = EXCLUDED.work, information = EXCLUDED.information, published = EXCLUDED.published, status = EXCLUDED.status, next_attempt_at = EXCLUDED.next_attempt_at, updated_at = EXCLUDED.updated_at
          WHERE ${fence(token)} AND ${table.fingerprint} = ${previous?.fingerprint || ''} AND ${table.updatedAt} = ${previous?.updatedAt || new Date(0).toISOString()}::timestamptz`);
      }
      await database.update(state).set({ cursor: hasNextPage ? cursor : null, scanActive: hasNextPage, scanRequested: false, discoveredProducts: starting ? sources.length : sql`${state.discoveredProducts} + ${sources.length}`, ...(hasNextPage ? {} : { completedAt: new Date(), nextScanAt: new Date(Date.now() + 86400000) }), lastError: null }).where(and(eq(state.id, scanId), fence(token)));
    },
    nextProduct: async () => {
      const [row] = await database.select().from(table).where(and(inArray(table.status, ['pending', 'processing']), lte(table.nextAttemptAt, new Date()))).orderBy(asc(table.updatedAt), asc(table.productId)).limit(1);
      return row ? record(row) : null;
    },
    saveProgress: async (next, token, delay = 0) => {
      const rows = await database.update(table).set({ work: next.work, information: next.information, published: next.published, status: next.status, nextAttemptAt: new Date(Date.now() + delay), updatedAt: new Date() }).where(and(eq(table.productId, next.source.productId), eq(table.fingerprint, next.fingerprint), fence(token))).returning({ id: table.productId });
      return rows.length > 0;
    },
    find: async productId => {
      const [row] = await database.select().from(table).where(eq(table.productId, productId));
      return row ? record(row) : null;
    },
    list: async after => {
      const rows = await database.select().from(table).where(after ? sql`${table.productId} > ${after}` : undefined).orderBy(asc(table.productId)).limit(21);
      return { records: rows.slice(0, 20).map(record), nextCursor: rows.length > 20 ? rows[19].productId : null };
    },
    requestScan: async () => { await initialize(); await database.update(state).set({ scanRequested: true, nextScanAt: new Date() }).where(eq(state.id, scanId)); },
    saveReview: async next => {
      const rows = await database.update(table).set({ information: next.information, published: next.published, status: next.status, updatedAt: new Date() }).where(and(eq(table.productId, next.source.productId), eq(table.fingerprint, next.fingerprint), eq(table.updatedAt, new Date(next.updatedAt)), inArray(table.status, ['needs_review', 'verified']))).returning({ id: table.productId });
      return rows.length > 0;
    },
    scanError: async (code, token) => { await database.update(state).set({ lastError: code }).where(and(eq(state.id, scanId), eq(state.lockToken, token))); },
  };
  return store;
}
