import { createHash } from 'node:crypto';
import type { ProductAnalysisRecord, ProductFact, ProductInformation, RawProductFact, ImageRegion } from '../../src/types/productInformation.js';
import type { AnalysisStore } from './product-analysis-storage.js';
import { equivalentAnalysisSource } from './product-analysis-storage.js';
import { readAnalysisProduct } from './product-analysis-source.js';
import { comparisonGeometry, safeProductFact, validRegion } from './product-analysis-rules.js';
import { renderProductAnalysisAudit } from './product-analysis-audit.js';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
const validId = (value: unknown): value is string => typeof value === 'string' && /^[1-9]\d{0,15}$/.test(value);

export function canReviewProductInformation(user: { confirmedAt?: string; roles?: string[] } | null) {
  return !!user?.confirmedAt && !!user.roles?.some(role => role === 'admin' || role === 'product_reviewer');
}

async function requestBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('Content-Type')?.startsWith('application/json') || Number(request.headers.get('Content-Length')) > 32768) throw new Error('Invalid request');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Invalid request');
  let size = 0;
  let body = '';
  const decoder = new TextDecoder();
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > 32768) { await reader.cancel(); throw new Error('Invalid request'); }
    body += decoder.decode(part.value, { stream: true });
  }
  body += decoder.decode();
  const value = JSON.parse(body);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request');
  return value;
}

export function createProductInformationHandler(store: AnalysisStore, readProduct = readAnalysisProduct) {
  return async (request: Request) => {
    if (request.method !== 'GET') return reply({ error: 'Method not allowed.' }, 405);
    const productId = new URL(request.url).searchParams.get('productId');
    if (!validId(productId)) return reply({ error: 'Choose a valid Shopify product.' }, 400);
    try {
      const record = await store.find(productId);
      if (!record?.published) return reply({ information: null, status: record?.status || 'pending' });
      const source = await readProduct(productId);
      if (!source) return reply({ information: null, status: 'pending' }, 404);
      if (!equivalentAnalysisSource(record.source, source)) {
        await store.requestScan();
        return reply({ information: null, status: 'pending' });
      }
      const information: ProductInformation = { ...record.published, facts: record.published.facts.filter(fact => fact.status === 'confirmed'), comparisons: record.published.comparisons.filter(comparison => comparison.status === 'confirmed' && !!comparisonGeometry(comparison.before, comparison.after)), reasons: [] };
      return reply({ information, status: record.status });
    } catch { return reply({ information: null, status: 'pending', message: 'Product information is being verified. The original product description and purchase options remain available.' }); }
  };
}

export function createProductAnalysisAdminHandler(store: AnalysisStore, authorize: () => Promise<boolean>, readProduct = readAnalysisProduct) {
  return async (request: Request) => {
    if (!['GET', 'POST', 'PATCH'].includes(request.method)) return reply({ error: 'Method not allowed.' }, 405);
    try {
      if (!await authorize()) return reply({ error: 'Sign in with a confirmed Netlify Identity admin or product_reviewer account.' }, 403);
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const after = url.searchParams.get('after');
        if (after && !validId(after)) return reply({ error: 'Invalid audit cursor.' }, 400);
        if (url.searchParams.get('export') === 'markdown') {
          const records: ProductAnalysisRecord[] = [];
          let cursor: string | null = null;
          const visited = new Set<string>();
          do {
            const page = await store.list(cursor);
            records.push(...page.records);
            cursor = page.nextCursor;
            if (cursor && visited.has(cursor)) throw new Error('Invalid audit cursor');
            if (cursor) visited.add(cursor);
          } while (cursor);
          return new Response(renderProductAnalysisAudit(records), { headers: { ...headers, 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="lifei-product-image-audit.md"' } });
        }
        const page = await store.list(after);
        return reply({ records: page.records.map(({ work, ...record }) => record), nextCursor: page.nextCursor, scan: await store.scanState() });
      }
      if (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return reply({ error: 'Use the administration page on this website.' }, 403);
      let body: Record<string, unknown>;
      try { body = await requestBody(request); }
      catch { return reply({ error: 'Use a valid JSON source-review request within the size limit.' }, 400); }
      if (request.method === 'POST' && body.action === 'scan') { await store.requestScan(); return reply({ queued: true }, 202); }
      if (request.method !== 'PATCH' || !validId(body.productId) || typeof body.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(body.fingerprint) || body.confirmation !== true || !Array.isArray(body.factIds) || !Array.isArray(body.comparisonIds) || body.factIds.length > 500 || body.comparisonIds.length > 50 || ![...body.factIds, ...body.comparisonIds].every(id => typeof id === 'string' && /^[a-f0-9]{24}$/.test(id))) return reply({ error: 'Select supported facts and confirm that you checked their original sources.' }, 400);
      const record = await store.find(body.productId);
      if (!record?.information || record.fingerprint !== body.fingerprint || record.updatedAt !== body.updatedAt || !['needs_review', 'verified'].includes(record.status)) return reply({ error: 'The product analysis changed. Refresh the review queue.' }, 409);
      const source = await readProduct(body.productId);
      if (!source || !equivalentAnalysisSource(record.source, source)) return reply({ error: 'The Shopify product changed. Run a new catalog scan before publishing.' }, 409);
      const selectedFacts = new Set(body.factIds as string[]);
      const selectedComparisons = new Set(body.comparisonIds as string[]);
      if ([...selectedFacts].some(id => !record.information!.facts.some(fact => fact.id === id)) || [...selectedComparisons].some(id => !record.information!.comparisons.some(comparison => comparison.id === id))) return reply({ error: 'Only source-backed analysis candidates can be published.' }, 400);
      const facts: ProductFact[] = record.information.facts.filter(fact => selectedFacts.has(fact.id)).map(fact => ({ ...fact, status: 'confirmed' as const }));
      if (body.manualFacts !== undefined) {
        if (!Array.isArray(body.manualFacts) || body.manualFacts.length > 20) return reply({ error: 'Too many manual source transcriptions.' }, 400);
        for (const entry of body.manualFacts) {
          if (!entry || typeof entry !== 'object') return reply({ error: 'Invalid source transcription.' }, 400);
          const fact = entry as RawProductFact & { reference: string };
          if (!['ingredient', 'benefit', 'concern', 'skin_type', 'usage', 'frequency', 'warning', 'full_ingredients'].includes(fact.kind) || typeof fact.text !== 'string' || typeof fact.excerpt !== 'string' || ![fact.concentration, fact.function].every(value => value === null || typeof value === 'string') || typeof fact.complete !== 'boolean' || !safeProductFact({ ...fact, confidence: 1 })) return reply({ error: 'Transcriptions must preserve original wording, supported concentrations, and complete ingredient order, without medical claims.' }, 400);
          const image = source.images.find(image => image.url === fact.reference);
          const description = fact.reference === `/products/${encodeURIComponent(source.handle)}` && source.description.includes(fact.excerpt);
          const metadata = source.metadata.find(field => `${field.namespace}.${field.key}` === fact.reference && field.value.includes(fact.excerpt));
          if (!image && !description && !metadata) return reply({ error: 'Use an original gallery image or a matching Shopify source excerpt.' }, 400);
          const next: ProductFact = { id: createHash('sha256').update(JSON.stringify([fact.kind, fact.text, fact.concentration, fact.reference])).digest('hex').slice(0, 24), kind: fact.kind, text: fact.text, concentration: fact.concentration, function: fact.function, status: 'confirmed', evidence: [{ type: image ? 'image' : metadata ? 'metafield' : 'description', reference: fact.reference, excerpt: fact.excerpt }] };
          if (!facts.some(existing => existing.kind === next.kind && existing.text === next.text && existing.concentration === next.concentration)) facts.push(next);
        }
      }
      if (facts.filter(fact => fact.kind === 'full_ingredients').length > 1 || facts.some(fact => fact.kind === 'ingredient' && facts.some(other => other.id !== fact.id && other.kind === 'ingredient' && other.text.toLowerCase() === fact.text.toLowerCase() && other.concentration !== fact.concentration))) return reply({ error: 'Resolve conflicting ingredient concentrations or complete ingredient lists before publishing.' }, 400);
      const comparisons = record.information.comparisons.filter(comparison => selectedComparisons.has(comparison.id)).map(comparison => ({ ...comparison, status: 'confirmed' as const }));
      if (body.regions !== undefined) {
        if (!Array.isArray(body.regions) || body.regions.length > 50) return reply({ error: 'Invalid comparison regions.' }, 400);
        for (const value of body.regions) {
          if (!value || typeof value !== 'object') return reply({ error: 'Invalid comparison regions.' }, 400);
          const correction = value as { id: string; before: ImageRegion; after: ImageRegion };
          const comparison = comparisons.find(comparison => comparison.id === correction.id);
          if (!comparison || !validRegion(correction.before) || !validRegion(correction.after)) return reply({ error: 'Choose valid photo regions on a selected original comparison.' }, 400);
          comparison.before = { ...comparison.before, region: correction.before };
          comparison.after = { ...comparison.after, region: correction.after };
          const ratio = comparisonGeometry(comparison.before, comparison.after);
          if (!ratio) return reply({ error: 'Photo regions must not overlap and must have matching proportions.' }, 400);
          comparison.aspectRatio = ratio;
        }
      }
      for (const comparison of comparisons) {
        for (const photo of [comparison.before, comparison.after]) {
          const original = source.images.find(image => image.url === photo.url);
          if (original?.width !== photo.width || original?.height !== photo.height) return reply({ error: 'Original gallery dimensions must remain unchanged.' }, 400);
        }
      }
      if (comparisons.some(comparison => !comparisonGeometry(comparison.before, comparison.after) || ![comparison.before.url, comparison.after.url].every(url => source.images.some(image => image.url === url)))) return reply({ error: 'Comparison images must be unaltered, proportion-matched images from this product gallery.' }, 400);
      record.published = { ...record.information, status: 'verified', facts, comparisons, reasons: [], updatedAt: new Date().toISOString() };
      record.information = { ...record.information, facts: [...record.information.facts.filter(fact => !facts.some(selected => selected.id === fact.id)), ...facts], comparisons: record.information.comparisons.map(comparison => comparisons.find(selected => selected.id === comparison.id) || comparison) };
      record.status = 'verified';
      if (!await store.saveReview(record)) return reply({ error: 'The analysis changed before your review was saved. Refresh and try again.' }, 409);
      return reply({ updated: true });
    } catch { return reply({ error: 'Product analysis is temporarily unavailable. No Shopify product or checkout data was changed.' }, 503); }
  };
}
