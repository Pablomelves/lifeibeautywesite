import type { ProductAnalysisRecord } from '../../src/types/productInformation.js';
import { ANALYSIS_MODEL, VERIFICATION_MODEL } from './product-analysis-ai.js';

const markdownText = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\r\n]+/g, ' ').replace(/[|`*_]/g, '\\$&');
const markdownUrl = (value: string) => value.replace(/\(/g, '%28').replace(/\)/g, '%29');

export function renderProductAnalysisAudit(records: ProductAnalysisRecord[]) {
  const imageCount = records.reduce((total, record) => total + record.source.images.length, 0);
  const inspectedCount = records.reduce((total, record) => total + record.work.images.filter(image => image.extraction).length, 0);
  const enabled = records.filter(record => record.published?.comparisons.length);
  const manual = records.filter(record => record.information?.status !== 'verified');
  const lines = ['# Product Image Analysis Audit', '', `Recorded: ${new Date().toISOString()}`, '', `Catalog products: ${records.length}. Gallery images: ${imageCount}. Successfully inspected images: ${inspectedCount}.`, '', `Products with published comparisons in prepared records: ${enabled.length}. Products requiring some manual verification: ${manual.length}.`, '', `Individual image OCR used ${ANALYSIS_MODEL}. Image-only evidence and composite comparisons received a separate ${VERIFICATION_MODEL} verification pass. Image-only facts and every comparison crop still require human source review; only sufficiently confident, verbatim corroboration in existing Shopify descriptions or readable metafields is automatically eligible. Clinical efficacy was not independently verified. Unreadable, unsupported, conflicting, and uncertain claims were withheld.`, '', 'This report describes the live source audit and prepared database records. Production publication and interaction checks must be repeated after platform deployment. A comparison candidate is not a claim of production deployment.', ''];
  for (const record of records) {
    const information = record.information;
    lines.push(`## ${markdownText(record.source.title)}`, '', `Shopify ID: ${record.source.id}. Handle: ${markdownText(record.source.handle)}.`, '', `Gallery coverage: ${record.work.images.filter(image => image.extraction).length}/${record.source.images.length}. Status: ${record.status}. Metafields: ${record.source.metadataAccessible ? 'readable through existing permissions' : 'not readable through existing permissions; no permissions were changed'}.`, '', '### Successfully Extracted, Source-Confirmed Information', '');
    const facts = record.published?.facts || [];
    if (!facts.length) lines.push('No sufficiently supported facts were eligible for publication. Existing Shopify descriptions were retained.', '');
    for (const fact of facts) {
      lines.push(`- ${fact.kind.replaceAll('_', ' ')}: ${markdownText(fact.text)}${fact.concentration ? ` (${markdownText(fact.concentration)})` : ''}${fact.function ? ` — ${markdownText(fact.function)}` : ''}`);
      for (const evidence of fact.evidence) lines.push(`  - Source: ${evidence.type === 'image' ? `[original gallery image](${markdownUrl(evidence.reference)})` : markdownText(evidence.reference)}. Supporting text: “${markdownText(evidence.excerpt)}”`);
    }
    lines.push('', '### Before-and-After Comparisons', '');
    const comparisons = information?.comparisons || [];
    if (!comparisons.length) lines.push('No comparison with usable candidate photo regions was identified. Any unresolved progression imagery was flagged below. No empty comparison component was enabled.');
    for (const comparison of comparisons) {
      lines.push(`- ${record.published?.comparisons.some(published => published.id === comparison.id) ? 'Approved for publication in stored review' : 'Withheld pending manual verification'}: [before source](${markdownUrl(comparison.before.url)}) and [after source](${markdownUrl(comparison.after.url)}).`);
      lines.push(`  - Original photo regions: before ${JSON.stringify(comparison.before.region)}; after ${JSON.stringify(comparison.after.region)}. Photographs were not generated, retouched, or enhanced.`);
      if (comparison.timeline) lines.push(`  - Documented source timeline: ${markdownText(comparison.timeline)}.`);
    }
    lines.push('', '### Manual Verification', '');
    if (!information?.reasons.length) lines.push('No outstanding extraction warnings were recorded.');
    for (const reason of information?.reasons || []) lines.push(`- ${markdownText(reason)}`);
    for (const fact of information?.facts.filter(fact => fact.status === 'needs_review') || []) lines.push(`- Withheld ${fact.kind.replaceAll('_', ' ')} candidate: ${markdownText(fact.text)}${fact.concentration ? ` (${markdownText(fact.concentration)})` : ''}.`);
    lines.push('', '### Every Gallery Image', '', '| Image | OCR status | Extracted facts | Independent verification |', '| --- | --- | --- | --- |');
    for (const [index, image] of record.work.images.entries()) lines.push(`| [Image ${index + 1}](${markdownUrl(image.image.url)}) | ${image.extraction?.readability || markdownText(image.error || 'not inspected')} | ${image.extraction?.facts.length || 0} | ${image.verification ? `${image.verification.verifiedFactIds.length} facts checked; comparison ${image.verification.comparisonVerified ? 'confirmed' : 'not confirmed'}` : 'not verified / no verifiable candidate'} |`);
    lines.push('');
  }
  return lines.join('\n');
}
