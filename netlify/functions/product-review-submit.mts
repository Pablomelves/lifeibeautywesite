import type { Config, Context } from '@netlify/functions';
import { createSubmitReviewHandler } from '../lib/product-reviews.js';
import { getReviewStore } from '../lib/review-storage.js';
import shopify from './shopify.mjs';

export default async (request: Request, context: Context) => {
  try {
    return await createSubmitReviewHandler(getReviewStore(), async productId => {
      const response = await shopify(new Request(request.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'query ReviewProduct($id: ID!) @inContext(country: US) { product(id: $id) { id title } }', variables: { id: `gid://shopify/Product/${productId}` } }) }), context);
      if (!response.ok) throw new Error('Catalog unavailable');
      const result = await response.json();
      if (result.errors?.length) throw new Error('Catalog unavailable');
      return result.data?.product?.title || null;
    })(request);
  } catch { return Response.json({ error: 'Your review could not be saved. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
};

export const config: Config = { path: '/api/product-reviews/submit', rateLimit: { windowLimit: 5, windowSize: 600, aggregateBy: ['ip'] } };
