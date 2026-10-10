import type { ProductAnalysisRecord, ProductInformation, RawProductFact, ImageRegion } from '../types/productInformation.js';

export function safeProductImageUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['cdn.shopify.com', 'maison-co-store1.myshopify.com'].includes(url.hostname) && !url.username && !url.password && !url.port; }
  catch { return false; }
}

async function analysisRequest<Result>(path: string, init: RequestInit = {}): Promise<Result> {
  const response = await fetch(path, { credentials: 'same-origin', ...init, signal: init.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) throw new Error(body?.error || 'Product information is temporarily unavailable.');
  return body;
}

export function getProductInformation(productId: string, signal: AbortSignal) {
  return analysisRequest<{ information: ProductInformation | null; status: ProductInformation['status'] }>(`/api/product-information?${new URLSearchParams({ productId })}`, { signal });
}

export type AnalysisReviewRecord = Omit<ProductAnalysisRecord, 'work'>;

export function getProductAnalysisQueue(after?: string | null) {
  return analysisRequest<{ records: AnalysisReviewRecord[]; nextCursor: string | null; scan: { scanActive: boolean; nextScanAt: string } }>(`/api/admin/product-analysis${after ? `?${new URLSearchParams({ after })}` : ''}`);
}

export async function requestProductAnalysisScan() {
  await analysisRequest('/api/admin/product-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'scan' }) });
  const response = await fetch('/api/admin/product-analysis/run', { method: 'POST', credentials: 'same-origin' });
  if (!response.ok) throw new Error('The scan was queued, but the background worker could not be started. The scheduled worker will resume it.');
}

export function publishReviewedProductInformation(record: AnalysisReviewRecord, factIds: string[], comparisonIds: string[], regions: { id: string; before: ImageRegion; after: ImageRegion }[] = [], manualFacts: (RawProductFact & { reference: string })[] = []) {
  return analysisRequest('/api/admin/product-analysis', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: record.source.productId, fingerprint: record.fingerprint, updatedAt: record.updatedAt, factIds, comparisonIds, regions, manualFacts, confirmation: true }) });
}

export async function downloadProductAnalysisAudit() {
  const response = await fetch('/api/admin/product-analysis?export=markdown', { credentials: 'same-origin', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('The audit report could not be downloaded.');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lifei-product-image-audit.md';
  link.click();
  URL.revokeObjectURL(url);
}
