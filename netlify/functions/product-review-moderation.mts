import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';
import { canModerateReviews, createModerationHandler } from '../lib/product-reviews.js';
import { getReviewStore } from '../lib/review-storage.js';

export default async (request: Request) => {
  try {
    return await createModerationHandler(getReviewStore(), async () => {
      const user = await getUser();
      return canModerateReviews(user);
    })(request);
  } catch { return Response.json({ error: 'Review moderation is temporarily unavailable. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
};

export const config: Config = { path: '/api/admin/product-reviews' };
