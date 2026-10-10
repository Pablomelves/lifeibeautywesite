import type { Config, Context } from '@netlify/functions';
import { runProductAnalysis } from '../lib/product-analysis-worker.js';
import { ProductAnalysisError } from '../lib/product-analysis-source.js';

export default async (_request: Request, context: Context) => {
  if (context.deploy.context !== 'production') return;
  try { await runProductAnalysis(); }
  catch (error) { console.error('Product analysis:', error instanceof ProductAnalysisError ? error.code : 'PRODUCT_ANALYSIS_UNAVAILABLE'); }
};

export const config: Config = { schedule: '* * * * *' };
