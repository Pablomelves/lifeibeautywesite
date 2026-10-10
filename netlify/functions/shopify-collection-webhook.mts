import type { Config, Context } from '@netlify/functions';
import { getDatabase } from '../../db/index.js';
import { shopifyWebhookEvents } from '../../db/schema.js';
import { verifyWebhook } from '../lib/shopify-admin.js';

export default async (request: Request, context?: Context) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (process.env.SHOPIFY_SYNC_ENABLED !== 'true' || !process.env.SHOPIFY_WEBHOOK_SECRET || (process.env.CONTEXT && process.env.CONTEXT !== 'production') || (context?.deploy.context && context.deploy.context !== 'production')) {
    return new Response('Automation is not activated', { status: 503 });
  }
  if (request.headers.get('x-shopify-shop-domain') !== 'maison-co-store1.myshopify.com') return new Response('Invalid store', { status: 401 });
  const body = await request.text();
  if (Buffer.byteLength(body) > 2 * 1024 * 1024) return new Response('Payload too large', { status: 413 });
  if (!verifyWebhook(body, request.headers.get('x-shopify-hmac-sha256'), process.env.SHOPIFY_WEBHOOK_SECRET)) return new Response('Invalid signature', { status: 401 });
  const topic = request.headers.get('x-shopify-topic') || '';
  const eventId = request.headers.get('x-shopify-event-id') || request.headers.get('x-shopify-webhook-id');
  if (!eventId || eventId.length > 200) return new Response('Missing event ID', { status: 400 });
  if (!['products/create', 'products/update', 'products/delete', 'collections/create', 'collections/update', 'collections/delete'].includes(topic)) return new Response(null, { status: 204 });
  let productId: string | null = null;
  try {
    const payload = JSON.parse(body);
    if (topic.startsWith('products/')) {
      productId = payload.admin_graphql_api_id || (Number.isSafeInteger(payload.id) ? `gid://shopify/Product/${payload.id}` : null);
      if (!productId || !/^gid:\/\/shopify\/Product\/\d+$/.test(productId)) return new Response('Invalid product ID', { status: 400 });
    }
  } catch {
    return new Response('Invalid payload', { status: 400 });
  }
  try {
    await getDatabase().insert(shopifyWebhookEvents).values({ id: eventId, topic, productId }).onConflictDoNothing();
    return new Response(null, { status: 204 });
  } catch {
    return new Response('Temporary persistence failure; retry delivery', { status: 503 });
  }
};

export const config: Config = { path: '/api/shopify/collection-webhook' };
