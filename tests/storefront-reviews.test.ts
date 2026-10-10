import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canModerateReviews, createModerationHandler, createPublishedReviewsHandler, createSubmitReviewHandler, validateReviewSubmission, validProductId, type ReviewStore } from '../netlify/lib/product-reviews.js';
import { getProductReviews, submitProductReview } from '../src/services/reviews.js';
import type { ModeratedProductReview, ProductReviewSubmission } from '../src/types.js';

const origin = 'https://lifeibeauty.com';
const input: ProductReviewSubmission = { productId: '123', submissionId: 'fd06ea31-6cda-4a38-b7d0-d4cb2988663f', author: 'Test nickname', rating: 3, title: 'Test submission headline', comment: 'Automated test review text, not customer feedback.', consent: true, website: '' };

function fixture() {
  const rows: ModeratedProductReview[] = [];
  const submissions = new Set<string>();
  const store: ReviewStore = {
    published: async productId => {
      const approved = rows.filter(row => row.productId === productId && row.status === 'approved');
      return { reviews: approved.map(({ status, ...row }) => row), total: approved.length, averageRating: approved.length ? approved.reduce((sum, row) => sum + row.rating, 0) / approved.length : null, nextCursor: null };
    },
    submit: async (review, productName) => {
      if (submissions.has(review.submissionId)) return;
      submissions.add(review.submissionId);
      rows.push({ id: rows.length + 1, productId: review.productId, productName, author: review.author, rating: review.rating, title: review.title, comment: review.comment, status: 'pending', createdAt: new Date().toISOString() });
    },
    queue: async status => ({ reviews: rows.filter(row => row.status === status), nextCursor: null }),
    moderate: async (id, status) => {
      const row = rows.find(review => review.id === id);
      if (!row) return false;
      row.status = status;
      return true;
    },
  };
  return { store, rows };
}

function write(path: string, body: unknown, method = 'POST', requestOrigin = origin) {
  return new Request(origin + path, { method, headers: { 'Content-Type': 'application/json', Origin: requestOrigin }, body: JSON.stringify(body) });
}

test('review input requires an actual product ID, valid rating, adequate text, and consent', () => {
  assert.ok(validateReviewSubmission(input));
  assert.equal(validProductId('123'), true);
  for (const value of ['0', '-1', '1.5', '9007199254740992', 'gid://shopify/Product/123']) assert.equal(validProductId(value), false);
  for (const changes of [{ rating: 0 }, { rating: 6 }, { rating: 2.5 }, { rating: '5' }, { consent: false }, { author: 'A' }, { title: 'Hi' }, { comment: 'Too short' }, { comment: 'a'.repeat(3001) }, { submissionId: 'invalid' }, { author: 'Bad\u0000name' }]) assert.equal(validateReviewSubmission({ ...input, ...changes }), null);
  assert.equal(validateReviewSubmission({ ...input, author: '  Nickname  ' })?.author, 'Nickname');
});

test('moderation requires a confirmed Identity account with a server-assigned role', () => {
  assert.equal(canModerateReviews(null), false);
  assert.equal(canModerateReviews({ roles: ['admin'] }), false);
  assert.equal(canModerateReviews({ confirmedAt: '2026-10-10', roles: ['customer'] }), false);
  assert.equal(canModerateReviews({ confirmedAt: '2026-10-10' }), false);
  assert.equal(canModerateReviews({ confirmedAt: '2026-10-10', roles: ['review_moderator'] }), true);
  assert.equal(canModerateReviews({ confirmedAt: '2026-10-10', roles: ['admin'] }), true);
});

test('submissions start pending and retries do not duplicate reviews', async () => {
  const { store, rows } = fixture();
  const submit = createSubmitReviewHandler(store, async id => id === '123' ? 'Real catalog title' : null);
  for (let attempt = 0; attempt < 2; attempt++) assert.equal((await submit(write('/api/product-reviews/submit', { ...input, status: 'approved', verified: true, productName: 'Ignored fake title' }))).status, 202);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'pending');
  assert.equal(rows[0].productName, 'Real catalog title');
  assert.equal('verified' in rows[0], false);
  const response = await createPublishedReviewsHandler(store)(new Request(origin + '/api/product-reviews?productId=123'));
  assert.deepEqual(await response.json(), { reviews: [], total: 0, averageRating: null, nextCursor: null });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('submissions reject cross-origin requests, honeypots, missing products, malformed and oversized input', async () => {
  const { store, rows } = fixture();
  const submit = createSubmitReviewHandler(store, async () => null);
  assert.equal((await submit(write('/api/product-reviews/submit', input, 'POST', 'https://other.example'))).status, 403);
  assert.equal((await submit(write('/api/product-reviews/submit', { ...input, website: 'spam' }))).status, 400);
  assert.equal((await submit(write('/api/product-reviews/submit', input))).status, 404);
  assert.equal((await submit(new Request(origin + '/api/product-reviews/submit', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await submit(write('/api/product-reviews/submit', { ...input, comment: 'a'.repeat(16000) }))).status, 400);
  assert.equal((await submit(new Request(origin + '/api/product-reviews/submit'))).status, 405);
  assert.equal(rows.length, 0);
});

test('only authorized approval publishes reviews and rejection removes them from totals', async () => {
  const { store } = fixture();
  await createSubmitReviewHandler(store, async () => 'Catalog title')(write('/api/product-reviews/submit', input));
  const denied = createModerationHandler(store, async () => false);
  assert.equal((await denied(new Request(origin + '/api/admin/product-reviews'))).status, 403);
  assert.equal((await denied(write('/api/admin/product-reviews', { id: 1, status: 'approved' }, 'PATCH'))).status, 403);
  const moderate = createModerationHandler(store, async () => true);
  assert.equal((await moderate(write('/api/admin/product-reviews', { id: 1, status: 'approved' }, 'PATCH', 'https://other.example'))).status, 403);
  assert.equal((await moderate(write('/api/admin/product-reviews', { id: 1, status: 'approved' }, 'PATCH'))).status, 200);
  const published = createPublishedReviewsHandler(store);
  const approved = await (await published(new Request(origin + '/api/product-reviews?productId=123'))).json();
  assert.equal(approved.total, 1);
  assert.equal(approved.averageRating, 3);
  assert.equal(approved.reviews[0].comment, input.comment);
  assert.equal('status' in approved.reviews[0], false);
  assert.equal('submissionId' in approved.reviews[0], false);
  assert.equal((await (await published(new Request(origin + '/api/product-reviews?productId=456'))).json()).total, 0);
  await moderate(write('/api/admin/product-reviews', { id: 1, status: 'rejected' }, 'PATCH'));
  assert.equal((await (await published(new Request(origin + '/api/product-reviews?productId=123'))).json()).total, 0);
});

test('review APIs validate cursors, statuses, IDs, and methods', async () => {
  const { store } = fixture();
  const published = createPublishedReviewsHandler(store);
  for (const query of ['', '?productId=abc', '?productId=123&before=-1', '?productId=123&before=1.5']) assert.equal((await published(new Request(origin + '/api/product-reviews' + query))).status, 400);
  const moderate = createModerationHandler(store, async () => true);
  assert.equal((await moderate(new Request(origin + '/api/admin/product-reviews?status=invalid'))).status, 400);
  assert.equal((await moderate(write('/api/admin/product-reviews', { id: 1, status: 'invalid' }, 'PATCH'))).status, 400);
  assert.equal((await moderate(write('/api/admin/product-reviews', { id: 0, status: 'approved' }, 'PATCH'))).status, 400);
  assert.equal((await moderate(write('/api/admin/product-reviews', { id: 1, status: 'approved' }, 'PATCH'))).status, 404);
});

test('catalog and database failures produce clear errors without exposing internal details', async () => {
  const { store } = fixture();
  const broken: ReviewStore = { ...store, submit: async () => { throw new Error('private database detail'); }, published: async () => { throw new Error('private database detail'); } };
  for (const response of [await createSubmitReviewHandler(broken, async () => 'Catalog title')(write('/api/product-reviews/submit', input)), await createPublishedReviewsHandler(broken)(new Request(origin + '/api/product-reviews?productId=123')), await createSubmitReviewHandler(store, async () => { throw new Error('private upstream detail'); })(write('/api/product-reviews/submit', input))]) {
    assert.equal(response.status, 503);
    assert.doesNotMatch(JSON.stringify(await response.json()), /private|database|upstream/);
  }
});

test('review client handles rate limiting and failed persistence instead of reporting success', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ error: 'Unable to save.' }, { status: 503 });
    await assert.rejects(submitProductReview(input), /Unable to save/);
    globalThis.fetch = async () => new Response('Too many requests', { status: 429 });
    await assert.rejects(submitProductReview(input), /Too many attempts/);
    globalThis.fetch = async () => new Response('Not JSON', { status: 500 });
    await assert.rejects(getProductReviews(123), /temporarily unavailable/);
  } finally { globalThis.fetch = original; }
});
