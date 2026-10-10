import type { Config } from '@netlify/functions';
import { createPublishedReviewsHandler } from '../lib/product-reviews.js';
import { getReviewStore } from '../lib/review-storage.js';

export default async (request: Request) => {
  try { return await createPublishedReviewsHandler(getReviewStore())(request); }
  catch { return Response.json({ error: 'Reviews are temporarily unavailable. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
};

export const config: Config = { path: '/api/product-reviews' };
