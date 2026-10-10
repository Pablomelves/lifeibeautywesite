import type { ModeratedProductReview, ProductReviewPage, ProductReviewSubmission } from '../types.js';

async function reviewRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', signal: AbortSignal.timeout(15000), ...init });
  if (response.status === 429) throw new Error('Too many attempts. Please wait a few minutes before trying again.');
  let body: { error?: string };
  try { body = await response.json(); }
  catch { throw new Error('Reviews are temporarily unavailable. Please try again.'); }
  if (!response.ok) throw new Error(body.error || 'Your review request failed. Please try again.');
  return body as T;
}

export function getProductReviews(productId: number, before?: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ productId: String(productId) });
  if (before) params.set('before', String(before));
  return reviewRequest<ProductReviewPage>('/api/product-reviews?' + params, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
}

export function submitProductReview(review: ProductReviewSubmission) {
  return reviewRequest<{ accepted: boolean; message: string }>('/api/product-reviews/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) });
}

export function getModerationQueue(status: ModeratedProductReview['status'], before?: number) {
  const params = new URLSearchParams({ status });
  if (before) params.set('before', String(before));
  return reviewRequest<{ reviews: ModeratedProductReview[]; nextCursor: number | null }>('/api/admin/product-reviews?' + params);
}

export function moderateProductReview(id: number, status: ModeratedProductReview['status']) {
  return reviewRequest<{ updated: boolean }>('/api/admin/product-reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
}
