import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';
import { canReviewProductInformation } from '../lib/product-analysis-api.js';
import { runProductAnalysis } from '../lib/product-analysis-worker.js';
import { ProductAnalysisError } from '../lib/product-analysis-source.js';

export default async (request: Request) => {
  if (request.method !== 'POST' || !canReviewProductInformation(await getUser())) return;
  if (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return;
  try { await runProductAnalysis(12 * 60 * 1000); }
  catch (error) { console.error('Product analysis:', error instanceof ProductAnalysisError ? error.code : 'PRODUCT_ANALYSIS_UNAVAILABLE'); }
};

export const config: Config = { path: '/api/admin/product-analysis/run', background: true };
