import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';
import { canReviewProductInformation, createProductAnalysisAdminHandler } from '../lib/product-analysis-api.js';
import { getAnalysisStore } from '../lib/product-analysis-storage.js';

export default async (request: Request) => {
  try { return await createProductAnalysisAdminHandler(getAnalysisStore(), async () => canReviewProductInformation(await getUser()))(request); }
  catch { return Response.json({ error: 'Product analysis is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
};

export const config: Config = { path: '/api/admin/product-analysis' };
