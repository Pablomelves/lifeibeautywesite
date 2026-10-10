import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { comparisonGeometry, deriveProductInformation, publishConfirmedInformation, safeProductFact } from '../netlify/lib/product-analysis-rules.js';
import { ProductAnalysisError, productFingerprint, readAnalysisCatalogPage, type AnalysisShopifyReader } from '../netlify/lib/product-analysis-source.js';
import { canReviewProductInformation, createProductAnalysisAdminHandler, createProductInformationHandler } from '../netlify/lib/product-analysis-api.js';
import { equivalentAnalysisSource, initialAnalysisWork, type AnalysisStore } from '../netlify/lib/product-analysis-storage.js';
import { runProductAnalysis } from '../netlify/lib/product-analysis-worker.js';
import { ProductInformationContent } from '../src/components/ProductInformationSection.js';
import { safeProductImageUrl } from '../src/services/productInformation.js';
import type { ProductAnalysisSource, RawProductFact, ProductExtraction, ProductAnalysisRecord, ImageInspection, ProductImageComparison } from '../src/types/productInformation.js';

const imageUrl = 'https://cdn.shopify.com/s/files/1/original.jpg';
const source: ProductAnalysisSource = { id: 'gid://shopify/Product/123', productId: '123', title: 'Source test serum', handle: 'source-test', productType: 'serum', vendor: 'Source brand', description: 'Niacinamide 5%. Hydrates skin. Apply to clean skin.', descriptionHtml: '<p>Niacinamide 5%. Hydrates skin. Apply to clean skin.</p>', tags: [], updatedAt: '2026-10-10T20:00:00.000Z', metadata: [], metadataAccessible: true, images: [{ id: 'image1', url: imageUrl, width: 1000, height: 1000, altText: null }] };
const raw = (changes: Partial<RawProductFact> = {}): RawProductFact => ({ id: 'fact1', kind: 'ingredient', text: 'Niacinamide', excerpt: 'Niacinamide 5%.', concentration: '5%', function: null, complete: false, confidence: 0.99, ...changes });
const extraction = (facts: RawProductFact[] = []): ProductExtraction => ({ ocrText: facts.map(fact => fact.excerpt).join(' '), readability: 'readable', facts, comparison: { kind: 'none', credible: false, consistentFraming: false, pairKey: null, timeline: null, beforeRegion: null, afterRegion: null, confidence: 0 }, reasons: [] });
function inspection(facts: RawProductFact[] = []): ImageInspection { return { image: source.images[0], extraction: extraction(facts), verification: { ocrText: facts.map(fact => fact.excerpt).join(' '), verifiedFactIds: facts.map(fact => fact.id), comparisonVerified: true, confidence: 1, reasons: [] }, attempts: 0, verificationAttempts: 0, error: null, nextAttemptAt: source.updatedAt }; }
function recordFixture(): ProductAnalysisRecord {
  const work = { description: extraction([raw()]), descriptionAttempts: 1, images: [inspection([raw({ id: 'image-only', text: 'Squalane', concentration: null, excerpt: 'Squalane' })])] };
  const information = deriveProductInformation(source, work);
  return { source: structuredClone(source), fingerprint: productFingerprint(source), work, information, published: publishConfirmedInformation(information), status: 'needs_review', updatedAt: source.updatedAt };
}
function storeFixture(record: ProductAnalysisRecord | null = recordFixture()) {
  const state = { record, requested: false, released: false, progress: 0 };
  const store: AnalysisStore = { acquireLease: async () => 'lease', renewLease: async () => true, releaseLease: async () => { state.released = true; }, scanState: async () => ({ cursor: null, scanActive: false, scanRequested: false, nextScanAt: new Date(Date.now() + 60000) }), saveCatalogPage: async () => {}, nextProduct: async () => state.record && ['pending', 'processing'].includes(state.record.status) ? state.record : null, saveProgress: async record => { state.record = structuredClone(record); state.progress++; return true; }, find: async () => structuredClone(state.record), list: async () => ({ records: state.record ? [state.record] : [], nextCursor: null }), requestScan: async () => { state.requested = true; }, saveReview: async record => { state.record = structuredClone(record); return true; }, scanError: async () => {} };
  return { store, state };
}
const origin = 'https://lifeibeauty.com';
function reviewRequest(record: ProductAnalysisRecord, changes: Record<string, unknown> = {}, requestOrigin = origin) {
  return new Request(`${origin}/api/admin/product-analysis`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: requestOrigin }, body: JSON.stringify({ productId: record.source.productId, fingerprint: record.fingerprint, updatedAt: record.updatedAt, factIds: record.published?.facts.map(fact => fact.id) || [], comparisonIds: [], confirmation: true, ...changes }) });
}

test('only verbatim supported description facts automatically publish; independently read image-only facts stay private', () => {
  const record = recordFixture();
  assert.equal(record.published?.facts.length, 1);
  assert.equal(record.published?.facts[0].text, 'Niacinamide');
  assert.equal(record.information?.facts.find(fact => fact.text === 'Squalane')?.status, 'needs_review');
  const unsupported = deriveProductInformation(source, { description: extraction([raw({ text: 'Retinol', excerpt: 'Retinol 5%' })]), descriptionAttempts: 1, images: [] });
  assert.equal(unsupported.facts.length, 0);
});

test('concentrations, ingredient functions, INCI and application instructions cannot be invented', () => {
  assert.equal(safeProductFact(raw({ concentration: '10%' })), false);
  assert.equal(safeProductFact(raw({ function: 'Prevents disease' })), false);
  assert.equal(safeProductFact(raw({ kind: 'full_ingredients', complete: false })), false);
  assert.equal(safeProductFact(raw({ kind: 'full_ingredients', complete: true })), false);
  assert.equal(safeProductFact(raw({ kind: 'full_ingredients', text: 'Water, Glycerin, Niacinamide', excerpt: 'Ingredients: Water, Glycerin, Niacinamide', concentration: null, complete: true })), true);
  assert.equal(safeProductFact(raw({ text: 'Retinol' })), false);
  assert.equal(safeProductFact(raw({ text: 'Niacinamide', excerpt: 'Without Niacinamide', concentration: null })), false);
});

test('medical promises, packaging amounts, product names and slogans are not published as ingredients or benefits', () => {
  for (const text of ['Cures acne', 'Clinically proven', 'Net weight 50 ml', 'Medicube serum', 'Dedicated to real results']) {
    assert.equal(safeProductFact(raw({ kind: 'benefit', text, excerpt: text, concentration: null })), false);
  }
  assert.equal(safeProductFact(raw({ kind: 'usage', text: '30 ml', excerpt: '30 ml', concentration: null })), false);
  assert.equal(safeProductFact(raw({ kind: 'usage', text: 'Apply to clean skin', excerpt: 'Apply to clean skin', concentration: null })), true);
});

test('conflicting concentrations, full ingredient lists and frequencies require reconciliation', () => {
  const facts = [raw(), raw({ id: 'other', excerpt: 'Niacinamide 10%.', concentration: '10%' }), raw({ kind: 'frequency', text: 'Use daily', excerpt: 'Use daily', concentration: null }), raw({ kind: 'frequency', text: 'Use weekly', excerpt: 'Use weekly', concentration: null })];
  const result = deriveProductInformation({ ...source, description: facts.map(fact => fact.excerpt).join(' ') }, { description: extraction(facts), descriptionAttempts: 1, images: [] });
  assert.ok(result.facts.every(fact => fact.status === 'needs_review'));
  assert.equal(publishConfirmedInformation(result).facts.length, 0);
  const lists = ['Water, Glycerin, Niacinamide', 'Water, Niacinamide, Glycerin'].map(text => raw({ kind: 'full_ingredients', text, excerpt: `Ingredients: ${text}`, concentration: null, complete: true }));
  const listResult = deriveProductInformation({ ...source, description: lists.map(fact => fact.excerpt).join('\n') }, { description: extraction(lists), descriptionAttempts: 1, images: [] });
  assert.equal(listResult.facts.filter(fact => fact.status === 'confirmed').length, 0);
});

test('comparisons preserve original proportions, reject overlap, and always require human crop verification', () => {
  const before = { url: imageUrl, width: 1000, height: 1000, region: { x: 0, y: 0, width: 0.5, height: 1 } };
  const after = { ...before, region: { x: 0.5, y: 0, width: 0.5, height: 1 } };
  assert.equal(comparisonGeometry(before, after), 0.5);
  assert.equal(comparisonGeometry(before, { ...after, region: { ...after.region, x: 0.4 } }), null);
  assert.equal(comparisonGeometry(before, { ...after, width: 2000 }), null);
  const image = inspection();
  image.extraction!.ocrText = 'BEFORE AFTER';
  image.verification!.ocrText = 'BEFORE AFTER';
  image.extraction!.comparison = { ...image.extraction!.comparison, kind: 'composite', credible: true, consistentFraming: true, confidence: 1, beforeRegion: before.region, afterRegion: after.region };
  const result = deriveProductInformation(source, { description: extraction(), descriptionAttempts: 1, images: [image] });
  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].status, 'needs_review');
  assert.equal(publishConfirmedInformation(result).comparisons.length, 0);
  assert.equal(deriveProductInformation(source, { description: extraction(), descriptionAttempts: 1, images: [inspection()] }).comparisons.length, 0);
});

test('source reader exhausts each gallery and supports existing permissions without changing tokens', async () => {
  const queries: string[] = [];
  const reader: AnalysisShopifyReader = async <Result>(query: string) => {
    queries.push(query);
    if (query.includes('metafields(')) throw new ProductAnalysisError('METADATA_ACCESS_UNAVAILABLE');
    const value = query.includes('ProductAnalysisGallery') ? { product: { images: { nodes: [{ ...source.images[0], url: 'https://cdn.shopify.com/second.jpg' }], pageInfo: { hasNextPage: false, endCursor: null } } } } : { products: { nodes: [{ ...source, metafields: [], images: { nodes: source.images, pageInfo: { hasNextPage: true, endCursor: 'gallery-page-2' } } }], pageInfo: { hasNextPage: true, endCursor: 'catalog-page-2' } } };
    return value as Result;
  };
  const page = await readAnalysisCatalogPage(null, reader);
  assert.equal(page.products[0].images.length, 2);
  assert.equal(page.products[0].metadataAccessible, false);
  assert.equal(page.endCursor, 'catalog-page-2');
  assert.equal(queries.length, 3);
  await assert.rejects(readAnalysisCatalogPage('catalog-page-2', reader), /INCOMPLETE_CATALOG/);
});

test('unchanged evidence reuses individual OCR but new images and descriptions require new analysis', () => {
  const record = recordFixture();
  assert.equal(equivalentAnalysisSource(source, { ...source, updatedAt: '2026-10-11T00:00:00.000Z' }), true);
  assert.equal(equivalentAnalysisSource(source, { ...source, description: 'Different' }), false);
  assert.ok(initialAnalysisWork(source, record).images[0].extraction);
  assert.equal(initialAnalysisWork({ ...source, images: [{ ...source.images[0], url: 'https://cdn.shopify.com/new.jpg' }] }, record).images[0].extraction, null);
  assert.equal(initialAnalysisWork({ ...source, description: 'Different' }, record).description, null);
});

test('public data fails gracefully and stale Shopify evidence is never exposed', async () => {
  const { store, state } = storeFixture();
  const request = new Request(`${origin}/api/product-information?productId=123`);
  const body = await (await createProductInformationHandler(store, async () => source)(request)).json();
  assert.equal(body.information.facts.length, 1);
  const stale = await (await createProductInformationHandler(store, async () => ({ ...source, description: 'Changed' }))(request)).json();
  assert.equal(stale.information, null);
  assert.equal(state.requested, true);
  const failure = await createProductInformationHandler({ ...store, find: async () => { throw new Error('Unavailable'); } })(request);
  assert.equal(failure.status, 200);
  assert.equal((await failure.json()).information, null);
  assert.equal((await createProductInformationHandler(store)(new Request(`${origin}/api/product-information?productId=javascript:alert(1)`))).status, 400);
});

test('reviews require confirmed server-assigned roles and same-origin requests', async () => {
  assert.equal(canReviewProductInformation(null), false);
  assert.equal(canReviewProductInformation({ roles: ['admin'] }), false);
  assert.equal(canReviewProductInformation({ confirmedAt: source.updatedAt, roles: ['customer'] }), false);
  assert.equal(canReviewProductInformation({ confirmedAt: source.updatedAt, roles: ['product_reviewer'] }), true);
  const record = recordFixture();
  const { store } = storeFixture(record);
  assert.equal((await createProductAnalysisAdminHandler(store, async () => false)(reviewRequest(record))).status, 403);
  assert.equal((await createProductAnalysisAdminHandler(store, async () => true)(reviewRequest(record, {}, 'https://unrelated.example'))).status, 403);
  const invalid = new Request(`${origin}/api/admin/product-analysis`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{' });
  assert.equal((await createProductAnalysisAdminHandler(store, async () => true)(invalid)).status, 400);
  const large = new Request(`${origin}/api/admin/product-analysis`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ value: 'x'.repeat(40000) }) });
  assert.equal((await createProductAnalysisAdminHandler(store, async () => true)(large)).status, 400);
});

test('review publication rejects stale edits, unsupported candidate IDs, source changes and invented manual transcriptions', async () => {
  const record = recordFixture();
  const { store } = storeFixture(record);
  const handler = createProductAnalysisAdminHandler(store, async () => true, async () => source);
  assert.equal((await handler(reviewRequest(record, { updatedAt: 'stale' }))).status, 409);
  assert.equal((await handler(reviewRequest(record, { factIds: ['a'.repeat(24)] }))).status, 400);
  assert.equal((await handler(reviewRequest(record, { manualFacts: [{ ...raw(), text: 'Invented' , reference: '/products/source-test' }] }))).status, 400);
  assert.equal((await createProductAnalysisAdminHandler(store, async () => true, async () => ({ ...source, description: 'Changed' }))(reviewRequest(record))).status, 409);
  assert.equal((await handler(reviewRequest(record, { confirmation: false }))).status, 400);
});

test('reviewers can publish an explicitly checked original-image transcription without modifying Shopify', async () => {
  const record = recordFixture();
  const { store, state } = storeFixture(record);
  const response = await createProductAnalysisAdminHandler(store, async () => true, async () => source)(reviewRequest(record, { manualFacts: [{ ...raw({ kind: 'usage', text: 'Apply to clean skin', excerpt: 'Apply to clean skin', concentration: null }), reference: imageUrl }] }));
  assert.equal(response.status, 200);
  assert.equal(state.record?.published?.facts.length, 2);
  assert.deepEqual(state.record?.source, source);
});

test('reviewers can correct composite crops but cannot overlap regions or change original dimensions', async () => {
  const record = recordFixture();
  const candidate: ProductImageComparison = { id: 'a'.repeat(24), before: { url: imageUrl, width: 1000, height: 1000, region: { x: 0, y: 0, width: 0.4, height: 0.5 } }, after: { url: imageUrl, width: 1000, height: 1000, region: { x: 0.5, y: 0, width: 0.5, height: 0.5 } }, aspectRatio: 0.8, timeline: null, status: 'needs_review' };
  record.information!.comparisons = [candidate];
  const { store, state } = storeFixture(record);
  const handler = createProductAnalysisAdminHandler(store, async () => true, async () => source);
  const regions = [{ id: candidate.id, before: { x: 0, y: 0, width: 0.5, height: 0.5 }, after: { x: 0.5, y: 0, width: 0.5, height: 0.5 } }];
  assert.equal((await handler(reviewRequest(record, { comparisonIds: [candidate.id], regions: [{ ...regions[0], after: { ...regions[0].after, x: 0.4 } }] }))).status, 400);
  assert.equal((await handler(reviewRequest(record, { comparisonIds: [candidate.id], regions }))).status, 200);
  assert.equal(state.record?.published?.comparisons[0].aspectRatio, 1);
  assert.equal(state.record?.published?.comparisons[0].status, 'confirmed');
});

test('resumable workers inspect every image, independently verify it and release leases', async () => {
  const record = recordFixture();
  record.work = initialAnalysisWork(source);
  record.status = 'pending'; record.information = null; record.published = null;
  const { store, state } = storeFixture(record);
  const calls: string[] = [];
  await runProductAnalysis(10000, store, { catalog: async () => { throw new Error('Not due'); }, description: async () => { calls.push('description'); return extraction([raw()]); }, image: async () => { calls.push('image'); return extraction([raw()]); }, verify: async () => { calls.push('verify'); return inspection([raw()]).verification!; } });
  assert.deepEqual(calls, ['description', 'image', 'verify']);
  assert.equal(state.record?.information?.imagesInspected, 1);
  assert.equal(state.released, true);
  assert.equal(state.progress, 4);
  assert.equal((await runProductAnalysis(10000, { ...store, acquireLease: async () => null })).busy, true);
});

test('missing analysis retries do not erase previously reviewed publication', async () => {
  const record = recordFixture();
  record.status = 'processing'; record.published!.status = 'verified';
  record.published!.facts[0].text = 'Previously source-checked fact';
  const { store, state } = storeFixture(record);
  await runProductAnalysis(10000, store);
  assert.equal(state.record?.published?.facts[0].text, 'Previously source-checked fact');
});

test('safe React rendering does not execute extracted content or show empty comparison components', () => {
  const record = recordFixture();
  record.published!.facts[0].text = '<script>untrusted()</script>';
  const html = renderToStaticMarkup(createElement(ProductInformationContent, { information: record.published, productTitle: source.title }));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('Before &amp; After'));
  assert.ok(html.includes('Full ingredient information is being verified.'));
  const other = renderToStaticMarkup(createElement(ProductInformationContent, { information: { ...record.published!, category: 'other', facts: [] }, productTitle: 'Accessory' }));
  assert.ok(!other.includes('Full Ingredients'));
  for (const url of ['javascript:alert(1)', 'http://cdn.shopify.com/image.jpg', 'https://cdn.shopify.com.evil.example/img', 'https://user:password@cdn.shopify.com/img']) assert.equal(safeProductImageUrl(url), false);
});

test('prepared catalog audit covers all real images and exposes no image-only claims or unchecked comparisons', () => {
  const sql = readFileSync('netlify/database/migrations/20261010203426_seed_product_image_analysis/migration.sql', 'utf8');
  let images = 0;
  const records = sql.trim().split('\n').map(line => {
    const values = [...line.matchAll(/'((?:[^']|'')*)'/g)].map(match => match[1].replace(/''/g, "'"));
    return { source: JSON.parse(values[2]), work: JSON.parse(values[3]), information: JSON.parse(values[4]), published: JSON.parse(values[5]) } as Pick<ProductAnalysisRecord, 'source' | 'work' | 'information' | 'published'>;
  });
  assert.equal(records.length, 9);
  for (const record of records) {
    images += record.source.images.length;
    assert.equal(record.work.images.length, record.source.images.length);
    assert.ok(record.work.images.every(image => image.extraction));
    assert.equal(record.published?.comparisons.length, 0);
    assert.ok(record.published?.facts.every(fact => fact.status === 'confirmed' && fact.evidence.some(evidence => evidence.type !== 'image')));
    assert.ok(record.published?.facts.every(fact => fact.evidence.some(evidence => evidence.type !== 'description' || record.source.description.toLowerCase().includes(evidence.excerpt.toLowerCase()))));
  }
  assert.equal(images, 78);
});
