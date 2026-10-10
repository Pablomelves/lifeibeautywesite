import type { ModeratedProductReview, ProductReviewPage, ProductReviewSubmission } from '../../src/types.js';

export type ReviewStatus = ModeratedProductReview['status'];
export function canModerateReviews(user: { confirmedAt?: string; roles?: string[] } | null): boolean {
  return !!user?.confirmedAt && !!user.roles?.some(role => role === 'admin' || role === 'review_moderator');
}

export interface ReviewStore {
  published: (productId: string, before: number | null) => Promise<ProductReviewPage>;
  submit: (review: ProductReviewSubmission, productName: string) => Promise<void>;
  queue: (status: ReviewStatus, before: number | null) => Promise<{ reviews: ModeratedProductReview[]; nextCursor: number | null }>;
  moderate: (id: number, status: ReviewStatus) => Promise<boolean>;
}

const responseHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: responseHeaders });

export function validProductId(value: unknown): value is string {
  return typeof value === 'string' && /^[1-9]\d{0,15}$/.test(value) && Number.isSafeInteger(Number(value));
}

export function validateReviewSubmission(value: unknown): ProductReviewSubmission | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (!validProductId(input.productId) || typeof input.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.submissionId)) return null;
  if (!Number.isInteger(input.rating) || Number(input.rating) < 1 || Number(input.rating) > 5 || input.consent !== true) return null;
  const fields = { author: [2, 60], title: [3, 120], comment: [20, 3000] };
  const normalized: Record<string, string> = {};
  for (const [field, [minimum, maximum]] of Object.entries(fields)) {
    if (typeof input[field] !== 'string') return null;
    const text = input[field].trim();
    if (text.length < minimum || text.length > maximum || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) return null;
    normalized[field] = text;
  }
  if (typeof input.website !== 'string' || input.website.length > 200) return null;
  return { submissionId: input.submissionId, productId: input.productId, author: normalized.author, rating: Number(input.rating), title: normalized.title, comment: normalized.comment, consent: true, website: input.website };
}

function sameOrigin(request: Request) {
  return request.headers.get('Origin') === new URL(request.url).origin && request.headers.get('Sec-Fetch-Site') !== 'cross-site';
}

async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new Error('Invalid request');
  if (Number(request.headers.get('Content-Length')) > 15000) throw new Error('Invalid request');
  const body = await request.text();
  if (new TextEncoder().encode(body).length > 15000) throw new Error('Invalid request');
  return JSON.parse(body);
}

function cursor(request: Request): number | null | false {
  const value = new URL(request.url).searchParams.get('before');
  if (value === null) return null;
  const parsed = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : false;
}

export function createPublishedReviewsHandler(store: ReviewStore) {
  return async (request: Request) => {
    if (request.method !== 'GET') return reply({ error: 'Method not allowed.' }, 405);
    const productId = new URL(request.url).searchParams.get('productId');
    const before = cursor(request);
    if (!validProductId(productId) || before === false) return reply({ error: 'Choose a valid product.' }, 400);
    try { return reply(await store.published(productId, before)); }
    catch { return reply({ error: 'Reviews are temporarily unavailable. Please try again.' }, 503); }
  };
}

export function createSubmitReviewHandler(store: ReviewStore, getProductName: (id: string) => Promise<string | null>) {
  return async (request: Request) => {
    if (request.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);
    if (!sameOrigin(request)) return reply({ error: 'Please submit your review from this website.' }, 403);
    let input: ProductReviewSubmission | null;
    try { input = validateReviewSubmission(await readBody(request)); }
    catch { return reply({ error: 'Please check your review and try again.' }, 400); }
    if (!input || input.website.trim()) return reply({ error: 'Please provide a nickname, rating, headline, honest review, and publication consent.' }, 400);
    try {
      const productName = await getProductName(input.productId);
      if (!productName) return reply({ error: 'This product is not available in our storefront.' }, 404);
      await store.submit(input, productName);
      return reply({ accepted: true, message: 'Your review was received and is awaiting moderation.' }, 202);
    } catch { return reply({ error: 'Your review could not be saved. Please try again.' }, 503); }
  };
}

export function createModerationHandler(store: ReviewStore, authorize: () => Promise<boolean>) {
  return async (request: Request) => {
    if (request.method !== 'GET' && request.method !== 'PATCH') return reply({ error: 'Method not allowed.' }, 405);
    try {
      if (!await authorize()) return reply({ error: 'Sign in with a Netlify Identity account assigned the admin or review_moderator role.' }, 403);
      if (request.method === 'GET') {
        const status = new URL(request.url).searchParams.get('status') || 'pending';
        const before = cursor(request);
        if (!['pending', 'approved', 'rejected'].includes(status) || before === false) return reply({ error: 'Choose a valid review status.' }, 400);
        return reply(await store.queue(status as ReviewStatus, before));
      }
      if (!sameOrigin(request)) return reply({ error: 'Please moderate reviews from this website.' }, 403);
      let input: { id?: unknown; status?: unknown };
      try { input = await readBody(request) as typeof input; }
      catch { return reply({ error: 'Invalid review update.' }, 400); }
      if (!input || !Number.isSafeInteger(input.id) || Number(input.id) <= 0 || !['pending', 'approved', 'rejected'].includes(String(input.status))) return reply({ error: 'Invalid review update.' }, 400);
      const updated = await store.moderate(Number(input.id), input.status as ReviewStatus);
      return updated ? reply({ updated: true }) : reply({ error: 'Review not found.' }, 404);
    } catch { return reply({ error: 'Review moderation is temporarily unavailable. Please try again.' }, 503); }
  };
}
