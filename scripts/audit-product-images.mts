import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readAnalysisCatalogPage, ProductAnalysisError, productFingerprint } from '../netlify/lib/product-analysis-source.js';
import { extractProductDescription, extractProductImage, verifyProductImage } from '../netlify/lib/product-analysis-ai.js';
import { deriveProductInformation, needsImageVerification, publishConfirmedInformation } from '../netlify/lib/product-analysis-rules.js';
import { renderProductAnalysisAudit } from '../netlify/lib/product-analysis-audit.js';
import type { ImageInspection, ProductAnalysisRecord, ProductAnalysisSource, ProductAnalysisWork } from '../src/types/productInformation.js';

async function retry<Result>(operation: () => Promise<Result>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { return await operation(); }
    catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
  throw new ProductAnalysisError('AUDIT_RETRY_FAILED');
}

async function inspectSource(source: ProductAnalysisSource): Promise<ProductAnalysisRecord> {
  const work: ProductAnalysisWork = { description: null, descriptionAttempts: 0, images: [] };
  try { work.description = await retry(() => extractProductDescription(source, 45000)); }
  catch { work.descriptionAttempts = 3; }
  let imageIndex = 0;
  const inspections: ImageInspection[] = new Array(source.images.length);
  const inspectNext = async () => {
    while (imageIndex < source.images.length) {
      const index = imageIndex++;
      const inspection: ImageInspection = { image: source.images[index], extraction: null, verification: null, attempts: 0, verificationAttempts: 0, nextAttemptAt: new Date().toISOString(), error: null };
      try { inspection.extraction = await retry(() => extractProductImage(inspection.image, 45000)); }
      catch (error) { inspection.attempts = 3; inspection.error = error instanceof ProductAnalysisError ? error.code : 'IMAGE_INSPECTION_UNAVAILABLE'; }
      if (needsImageVerification(inspection)) {
        try { inspection.verification = await retry(() => verifyProductImage(inspection, 45000)); }
        catch (error) { inspection.verificationAttempts = 3; inspection.error = error instanceof ProductAnalysisError ? error.code : 'IMAGE_VERIFICATION_UNAVAILABLE'; }
      }
      inspections[index] = inspection;
      console.log(`Inspected gallery image ${index + 1}/${source.images.length} for ${source.handle}.`);
    }
  };
  await Promise.all(Array.from({ length: 3 }, inspectNext));
  work.images = inspections;
  const information = deriveProductInformation(source, work);
  return { source, fingerprint: productFingerprint(source), status: information.status, work, information, published: publishConfirmedInformation(information), updatedAt: new Date().toISOString() };
}

function writeArtifact(path: string, content: string) {
  execFileSync('apply_patch', [], { input: `*** Begin Patch\n*** Add File: ${path}\n${content.split('\n').map(line => `+${line}`).join('\n')}\n*** End Patch`, stdio: ['pipe', 'ignore', 'ignore'], maxBuffer: 4000000 });
}

const records: ProductAnalysisRecord[] = [];
let after: string | null = null;
do {
  const page = await readAnalysisCatalogPage(after);
  for (const source of page.products) {
    console.log(`Auditing ${source.handle}: ${source.images.length} gallery images.`);
    records.push(await inspectSource(source));
  }
  after = page.hasNextPage ? page.endCursor : null;
} while (after);
writeArtifact('docs/product-image-audit.md', renderProductAnalysisAudit(records));

if (process.argv.includes('--seed')) {
  const literal = (value: string) => `'${value.replace(/'/g, "''")}'`;
  const statements = records.map(record => `INSERT INTO product_image_analysis (product_id, fingerprint, source, work, information, published, status, updated_at) VALUES (${literal(record.source.productId)}, ${literal(record.fingerprint)}, ${literal(JSON.stringify(record.source))}::jsonb, ${literal(JSON.stringify(record.work))}::jsonb, ${literal(JSON.stringify(record.information))}::jsonb, ${literal(JSON.stringify(record.published))}::jsonb, ${literal(record.status)}, ${literal(record.updatedAt)}::timestamptz) ON CONFLICT (product_id) DO NOTHING;`);
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const seedPath = `netlify/database/migrations/${timestamp}_seed_product_image_analysis/migration.sql`;
  if (existsSync(seedPath)) throw new Error('The analysis seed migration already exists and was not modified.');
  writeArtifact(seedPath, statements.join('\n'));
}
console.log(`Audit recorded ${records.length} real Shopify products and ${records.reduce((total, record) => total + record.source.images.length, 0)} gallery images.`);
