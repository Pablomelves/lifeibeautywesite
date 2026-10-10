import type { AnalysisStore } from './product-analysis-storage.js';
import { getAnalysisStore } from './product-analysis-storage.js';
import { extractProductDescription, extractProductImage, verifyProductImage } from './product-analysis-ai.js';
import { deriveProductInformation, needsImageVerification, publishConfirmedInformation } from './product-analysis-rules.js';
import { ProductAnalysisError, readAnalysisCatalogPage } from './product-analysis-source.js';

export async function runProductAnalysis(budget = 24000, store: AnalysisStore = getAnalysisStore(), operations = { catalog: readAnalysisCatalogPage, description: extractProductDescription, image: extractProductImage, verify: verifyProductImage }) {
  const deadline = Date.now() + Math.min(budget, 12 * 60 * 1000);
  const token = await store.acquireLease();
  if (!token) return { busy: true, steps: 0 };
  let steps = 0;
  try {
    const scan = await store.scanState();
    if (scan.scanActive || scan.scanRequested || scan.nextScanAt <= new Date()) {
      const page = await operations.catalog(scan.scanActive ? scan.cursor : null);
      await store.saveCatalogPage(page.products, page.endCursor, page.hasNextPage, token);
    }
    while (Date.now() < deadline - 3500) {
      if (!await store.renewLease(token)) break;
      const record = await store.nextProduct();
      if (!record) break;
      const timeout = Math.max(1000, Math.min(18000, deadline - Date.now() - 2000));
      let delay = 0;
      record.status = 'processing';
      if (!record.work.description && record.work.descriptionAttempts < 3) {
        record.work.descriptionAttempts += 1;
        try { record.work.description = await operations.description(record.source, timeout); }
        catch { delay = record.work.descriptionAttempts * 60000; }
      } else {
        const inspection = record.work.images.find(image => !image.extraction && image.attempts < 3 || needsImageVerification(image));
        if (inspection) {
          try {
            if (!inspection.extraction) { inspection.attempts += 1; inspection.extraction = await operations.image(inspection.image, timeout); }
            else { inspection.verificationAttempts += 1; inspection.verification = await operations.verify(inspection, timeout); }
            inspection.error = null;
          } catch (error) {
            inspection.error = error instanceof ProductAnalysisError ? error.code : 'IMAGE_ANALYSIS_UNAVAILABLE';
            delay = Math.max(inspection.attempts, inspection.verificationAttempts) * 60000;
          }
        } else {
          record.information = deriveProductInformation(record.source, record.work);
          if (record.published?.status === 'verified') {
            const reviewed = record.published;
            record.information.facts = [...record.information.facts.filter(fact => !reviewed.facts.some(existing => existing.id === fact.id)), ...reviewed.facts];
            record.information.comparisons = [...record.information.comparisons.filter(comparison => !reviewed.comparisons.some(existing => existing.id === comparison.id)), ...reviewed.comparisons];
            record.published = { ...reviewed, updatedAt: new Date().toISOString() };
          } else record.published = publishConfirmedInformation(record.information);
          record.status = record.information.status;
        }
      }
      if (!await store.saveProgress(record, token, delay)) break;
      steps += 1;
    }
    return { busy: false, steps };
  } catch (error) {
    await store.scanError(error instanceof ProductAnalysisError ? error.code : 'PRODUCT_ANALYSIS_UNAVAILABLE', token);
    throw error;
  } finally { await store.releaseLease(token); }
}
