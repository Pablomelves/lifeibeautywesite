import type { Config, Context } from '@netlify/functions';
import { adminQuery, authorizeOperator, installWebhooks, loadAdminCollections, safeError, syncConfiguration, SyncError } from '../lib/shopify-admin.js';
import { enqueueProduct, requestFullScan, syncStatus } from '../lib/shopify-sync.js';

export default async (request: Request, context?: Context) => {
  const headers = { 'Cache-Control': 'no-store' };
  if (!authorizeOperator(request)) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (context?.deploy.context && context.deploy.context !== 'production') return Response.json({ error: 'PRODUCTION_ONLY' }, { status: 403, headers });
  if (!['GET', 'POST'].includes(request.method)) return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  try {
    syncConfiguration();
    if (request.method === 'GET') return Response.json(await syncStatus(new URL(request.url).searchParams.get('after') || ''), { headers });
    let body: { action?: string; productId?: string };
    try {
      body = await request.json();
      if (!body || typeof body !== 'object') throw new Error();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
    }
    if (body.action === 'setup') {
      const access = await adminQuery<{ currentAppInstallation: { accessScopes: { handle: string }[] } }>('query { currentAppInstallation { accessScopes { handle } } }');
      if (!access.currentAppInstallation.accessScopes.some(scope => scope.handle === 'write_products')) throw new SyncError('MISSING_WRITE_PRODUCTS_PERMISSION', false);
      const collections = await loadAdminCollections();
      const topics = await installWebhooks();
      await requestFullScan();
      return Response.json({ status: 'queued', topics, collections: collections.map(collection => ({ id: collection.id, title: collection.title, handle: collection.handle, automated: !!collection.ruleSet })) }, { status: 202, headers });
    }
    if (body.action === 'scan') {
      await requestFullScan();
      return Response.json({ status: 'queued' }, { status: 202, headers });
    }
    if (body.action === 'product' && typeof body.productId === 'string' && /^gid:\/\/shopify\/Product\/\d+$/.test(body.productId)) {
      await enqueueProduct(body.productId);
      return Response.json({ status: 'queued' }, { status: 202, headers });
    }
    return Response.json({ error: 'Expected setup, scan, or product action with a Shopify product GID' }, { status: 400, headers });
  } catch (error) {
    return Response.json({ error: safeError(error), enabled: process.env.SHOPIFY_SYNC_ENABLED === 'true' }, { status: 503, headers });
  }
};

export const config: Config = { path: '/api/shopify/collection-sync' };
