import { createHash } from 'node:crypto';
import type { ComparisonImage, ImageInspection, ImageRegion, ProductAnalysisSource, ProductAnalysisWork, ProductFact, ProductImageComparison, ProductInformation, RawProductFact } from '../../src/types/productInformation.js';
import { analysisImageUrl, productFingerprint } from './product-analysis-source.js';

const normalized = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
const identifier = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 24);
const medicalClaim = /\b(cure[sd]?|treat(?:s|ment)?|heal(?:s|ing)?|prevent(?:s|ion)?|guarantee[sd]?|clinically|clinical trial|cell repair|skin regeneration|natural repair|swelling|disease|eczema|psoriasis|rosacea|prescription|medical)\b/i;

export function validRegion(region: ImageRegion | null): region is ImageRegion {
  return !!region && [region.x, region.y, region.width, region.height].every(Number.isFinite) && region.x >= 0 && region.y >= 0 && region.width > 0.04 && region.height > 0.04 && region.x + region.width <= 1.000001 && region.y + region.height <= 1.000001;
}

export function comparisonGeometry(before: ComparisonImage, after: ComparisonImage): number | null {
  if (![before, after].every(image => analysisImageUrl(image.url) && image.width > 0 && image.height > 0 && validRegion(image.region))) return null;
  const beforeRatio = before.width * before.region.width / (before.height * before.region.height);
  const afterRatio = after.width * after.region.width / (after.height * after.region.height);
  if (Math.abs(beforeRatio / afterRatio - 1) > 0.02 || beforeRatio < 0.2 || beforeRatio > 5) return null;
  if (before.url === after.url) {
    const overlapWidth = Math.min(before.region.x + before.region.width, after.region.x + after.region.width) - Math.max(before.region.x, after.region.x);
    const overlapHeight = Math.min(before.region.y + before.region.height, after.region.y + after.region.height) - Math.max(before.region.y, after.region.y);
    if (overlapWidth > 0.000001 && overlapHeight > 0.000001) return null;
  }
  return beforeRatio;
}

export function safeProductFact(fact: RawProductFact) {
  if ([fact.text, fact.excerpt, fact.concentration, fact.function].some(value => value && (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) || /\b(?:sk-[a-zA-Z0-9_-]{20,}|shpat_[a-zA-Z0-9]{20,}|ntk_[a-zA-Z0-9]{20,})\b/.test(value)))) return false;
  if (!fact.text.trim() || fact.text.length > 16000 || !fact.excerpt.trim() || fact.excerpt.length > 20000 || !Number.isFinite(fact.confidence) || fact.confidence < 0 || fact.confidence > 1) return false;
  if (!normalized(fact.excerpt).includes(normalized(fact.text))) return false;
  if (fact.concentration && (!/\d/.test(fact.concentration) || !normalized(fact.excerpt).includes(normalized(fact.concentration)))) return false;
  if (fact.function && !normalized(fact.excerpt).includes(normalized(fact.function))) return false;
  if (fact.kind !== 'warning' && (medicalClaim.test(fact.text) || (fact.function && medicalClaim.test(fact.function)))) return false;
  if (fact.kind === 'benefit' && /\d\s*%|\b(?:\d+\s*(?:days?|weeks?)|instant(?:ly)?|proven)\b/i.test(fact.text)) return false;
  if (['ingredient', 'benefit', 'usage'].includes(fact.kind) && /\b(?:\d+(?:\.\d+)?\s*(?:ml|fl[.]?\s*oz|oz|grams?|sheets)|net\s*(?:wt|weight)|lot\s+number|expiry\s+date)\b/i.test(fact.text)) return false;
  if (['ingredient', 'benefit'].includes(fact.kind) && /\b(?:serum|cream|mask|patch|pads?|stick|medicube|biodance)\b/i.test(fact.text)) return false;
  if (fact.kind === 'ingredient' && (fact.text.length > 180 || (fact.text.match(/,/g) || []).length > 2 || /carefully chosen|botanical extracts and|\|\s*%/i.test(fact.text))) return false;
  if (fact.kind === 'benefit' && /dedicated to real results|dermatologically|tested|in minutes|best seller|made in|ultimate|irresistible|safe and practical|harmful ingredients/i.test(fact.text)) return false;
  if (fact.kind === 'usage' && (!/\b(apply|use|massage|cleanse|wash|rinse|place|wear|leave|remove|peel|mix|spread|pat|swipe|wipe|overnight|hours?|minutes?)\b/i.test(fact.text) || /quick,? effective results/i.test(fact.text))) return false;
  if (fact.kind === 'ingredient' && /free[ -]?(?:of|from)|without|does not contain|doesn't contain|not present/i.test(fact.excerpt)) return false;
  return fact.kind !== 'full_ingredients' || (fact.complete && /\b(?:ingredients|inci)\b/i.test(fact.excerpt) && fact.text.split(',').length >= 3);
}

function textEvidence(source: ProductAnalysisSource, excerpt: string): ProductFact['evidence'][number] | null {
  if (normalized(source.description).includes(normalized(excerpt))) return { type: 'description', reference: `/products/${encodeURIComponent(source.handle)}`, excerpt };
  const field = source.metadata.find(field => normalized(field.value).includes(normalized(excerpt)));
  return field ? { type: 'metafield', reference: `${field.namespace}.${field.key}`, excerpt } : null;
}

function verifiedImageFact(inspection: ImageInspection, fact: RawProductFact) {
  return inspection.extraction?.readability === 'readable' && fact.confidence >= 0.98 && !!inspection.verification && inspection.verification.confidence >= 0.98 && inspection.verification.verifiedFactIds.includes(fact.id) && normalized(inspection.extraction.ocrText).includes(normalized(fact.excerpt)) && normalized(inspection.verification.ocrText).includes(normalized(fact.excerpt));
}

function resolveComparisons(images: ImageInspection[], reasons: string[]) {
  const comparisons: ProductImageComparison[] = [];
  const makeImage = (inspection: ImageInspection, region: ImageRegion | null): ComparisonImage | null => validRegion(region) && inspection.image.width && inspection.image.height ? { url: inspection.image.url, width: inspection.image.width, height: inspection.image.height, region } : null;
  const eligible = images.filter(inspection => inspection.extraction && inspection.extraction.comparison.kind !== 'none' && inspection.extraction.comparison.confidence >= 0.5);
  for (const inspection of eligible) {
    const comparison = inspection.extraction!.comparison;
    if (!comparison.beforeRegion || !comparison.afterRegion) continue;
    const before = makeImage(inspection, comparison.beforeRegion);
    const after = makeImage(inspection, comparison.afterRegion);
    const ratio = before && after && comparisonGeometry(before, after);
    if (!before || !after) { reasons.push('A composite comparison needs reliable, equally proportioned, non-overlapping photo regions.'); continue; }
    const labelled = /\bbefore\b/i.test(inspection.extraction!.ocrText) && /\bafter\b/i.test(inspection.extraction!.ocrText);
    const independentlyVerified = !!ratio && comparison.credible && comparison.consistentFraming && comparison.confidence >= 0.98 && labelled && inspection.extraction!.readability === 'readable' && inspection.verification?.comparisonVerified && inspection.verification.confidence >= 0.99 && /\bbefore\b/i.test(inspection.verification.ocrText) && /\bafter\b/i.test(inspection.verification.ocrText);
    const timeline = comparison.timeline && normalized(inspection.extraction!.ocrText).includes(normalized(comparison.timeline)) && (!independentlyVerified || normalized(inspection.verification!.ocrText).includes(normalized(comparison.timeline))) ? comparison.timeline : null;
    comparisons.push({ id: identifier(JSON.stringify([before, after])), before, after, aspectRatio: ratio || before.width * before.region.width / (before.height * before.region.height), timeline, status: 'needs_review' });
  }
  const beforeImages = eligible.filter(inspection => inspection.extraction!.comparison.kind === 'before' && !inspection.extraction!.comparison.afterRegion);
  const afterImages = eligible.filter(inspection => inspection.extraction!.comparison.kind === 'after' && !inspection.extraction!.comparison.beforeRegion);
  for (const beforeInspection of beforeImages) {
    const key = beforeInspection.extraction!.comparison.pairKey;
    const matches = afterImages.filter(inspection => key ? inspection.extraction!.comparison.pairKey === key : beforeImages.length === 1 && afterImages.length === 1);
    if (matches.length !== 1) { reasons.push('Separately labelled result photos need manual pairing.'); continue; }
    const afterInspection = matches[0];
    const fullRegion = { x: 0, y: 0, width: 1, height: 1 };
    const before = makeImage(beforeInspection, beforeInspection.extraction!.comparison.beforeRegion || fullRegion);
    const after = makeImage(afterInspection, afterInspection.extraction!.comparison.afterRegion || fullRegion);
    const ratio = before && after && comparisonGeometry(before, after);
    if (!before || !after || !ratio) { reasons.push('Separate comparison photographs have incompatible framing or proportions.'); continue; }
    comparisons.push({ id: identifier(JSON.stringify([before, after])), before, after, aspectRatio: ratio, timeline: null, status: 'needs_review' });
  }
  return comparisons;
}

export function deriveProductInformation(source: ProductAnalysisSource, work: ProductAnalysisWork): ProductInformation {
  const facts: ProductFact[] = [];
  const reasons: string[] = [];
  const append = (rawFact: RawProductFact, inspection?: ImageInspection) => {
    const fact = { ...rawFact, function: rawFact.function && medicalClaim.test(rawFact.function) ? null : rawFact.function };
    if (!safeProductFact(fact)) { reasons.push(`An unsupported ${fact.kind.replaceAll('_', ' ')} statement was withheld.`); return; }
    const corroboration = textEvidence(source, fact.excerpt);
    if (!inspection && !corroboration) { reasons.push('A description extraction did not match its original source text.'); return; }
    if (inspection && (!analysisImageUrl(inspection.image.url) || !normalized(inspection.extraction!.ocrText).includes(normalized(fact.excerpt)))) { reasons.push('Image text could not be traced reliably to its OCR transcript.'); return; }
    const evidence: ProductFact['evidence'] = corroboration ? [corroboration] : [];
    if (inspection) evidence.push({ type: 'image', reference: inspection.image.url, excerpt: fact.excerpt });
    const status = corroboration && fact.confidence >= 0.95 ? 'confirmed' : 'needs_review';
    if (inspection && !corroboration && verifiedImageFact(inspection, fact)) reasons.push('Image-only ingredient or instruction text still needs human source verification before publication.');
    const kind = fact.kind === 'usage' && /\bdaily use\b|\buse\b.*\bdaily\b|suitable for daily/i.test(fact.text) ? 'frequency' : fact.kind;
    const next: ProductFact = { id: identifier(`${kind}|${normalized(fact.text)}|${fact.concentration || ''}`), kind, text: fact.text, concentration: fact.concentration, function: fact.function, status, evidence };
    const duplicate = facts.find(existing => existing.id === next.id);
    if (duplicate) { duplicate.evidence.push(...evidence); if (status === 'confirmed') duplicate.status = 'confirmed'; }
    else facts.push(next);
  };
  for (const fact of work.description?.facts || []) append(fact);
  if (!work.description) reasons.push('Product description analysis needs another attempt.');
  for (const inspection of work.images) {
    if (!inspection.extraction) { reasons.push('A gallery image could not be inspected.'); continue; }
    if (inspection.extraction.readability === 'partial' || inspection.extraction.readability === 'unreadable') reasons.push('Blurry, incomplete, or unreadable image text requires manual verification.');
    reasons.push(...inspection.extraction.reasons, ...(inspection.verification?.reasons || []));
    for (const fact of inspection.extraction.facts) append(fact, inspection);
    if (['uncertain', 'progression'].includes(inspection.extraction.comparison.kind)) reasons.push('Possible result or progression imagery needs manual verification.');
  }
  const ingredients = facts.filter(fact => fact.kind === 'ingredient');
  for (const ingredient of ingredients) {
    const ingredientName = (fact: ProductFact) => normalized(fact.concentration ? fact.text.replace(fact.concentration, '') : fact.text);
    const conflicting = ingredients.some(other => other.id !== ingredient.id && ingredientName(other) === ingredientName(ingredient) && !!other.concentration && !!ingredient.concentration && other.concentration !== ingredient.concentration);
    if (conflicting) { ingredient.status = 'needs_review'; reasons.push('Conflicting ingredient concentrations require manual verification.'); }
  }
  const frequencies = facts.filter(fact => fact.kind === 'frequency');
  if (new Set(frequencies.map(fact => normalized(fact.text))).size > 1) {
    for (const fact of frequencies) fact.status = 'needs_review';
    reasons.push('Multiple application-frequency statements require manual reconciliation.');
  }
  const completeLists = facts.filter(fact => fact.kind === 'full_ingredients');
  if (new Set(completeLists.map(fact => normalized(fact.text))).size > 1) {
    for (const fact of completeLists) fact.status = 'needs_review';
    reasons.push('Different full ingredient lists were found; their applicability requires review.');
  }
  const comparisons = resolveComparisons(work.images, reasons);
  const accessory = /\b(?:bags?|rollers?|brushes?|tools?|accessories|accessory)\b/i.test(`${source.productType} ${source.title}`);
  const category = !accessory && /skincare|skin care|serum|cream|cleanser|mask|toner|patch|balm|moistur|sunscreen|essence|exfoliat|pore.*pads/i.test(`${source.productType} ${source.title} ${source.tags.join(' ')} ${source.description}`) ? 'skincare' : 'other';
  if (!source.metadataAccessible) reasons.push('Shopify metafields are not readable through the existing Storefront permissions.');
  if (category === 'skincare' && !facts.some(fact => fact.kind === 'full_ingredients' && fact.status === 'confirmed')) reasons.push('Full ingredient information is being verified.');
  if (!facts.some(fact => fact.kind === 'usage' && fact.status === 'confirmed')) reasons.push('Application instructions require manual verification.');
  if (facts.some(fact => fact.status === 'needs_review') || comparisons.some(comparison => comparison.status === 'needs_review')) reasons.push('Unconfirmed image-derived information is awaiting review.');
  return { productId: source.productId, handle: source.handle, title: source.title, fingerprint: productFingerprint(source), category, status: reasons.length ? 'needs_review' : 'verified', facts, comparisons, imagesTotal: source.images.length, imagesInspected: work.images.filter(inspection => !!inspection.extraction).length, reasons: [...new Set(reasons)], updatedAt: new Date().toISOString() };
}

export function publishConfirmedInformation(information: ProductInformation): ProductInformation {
  return { ...information, facts: information.facts.filter(fact => fact.status === 'confirmed'), comparisons: information.comparisons.filter(comparison => comparison.status === 'confirmed'), reasons: [] };
}

export function needsImageVerification(inspection: ImageInspection) {
  return !!inspection.extraction && (inspection.extraction.facts.length > 0 || inspection.extraction.comparison.kind !== 'none') && !inspection.verification && inspection.verificationAttempts < 3;
}
