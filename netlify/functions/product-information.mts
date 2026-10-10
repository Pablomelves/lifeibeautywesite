import type { Config } from '@netlify/functions';
import { createProductInformationHandler } from '../lib/product-analysis-api.js';
import { getAnalysisStore } from '../lib/product-analysis-storage.js';

export default async (request: Request) => {
  try { return await createProductInformationHandler(getAnalysisStore())(request); }
  catch { return Response.json({ information: null, status: 'pending' }, { headers: { 'Cache-Control': 'no-store' } }); }
};

export const config: Config = { path: '/api/product-information' };
