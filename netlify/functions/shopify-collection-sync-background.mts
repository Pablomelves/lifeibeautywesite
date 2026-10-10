import type { Config, Context } from '@netlify/functions';
import { authorizeOperator, safeError } from '../lib/shopify-admin.js';
import { runSync } from '../lib/shopify-sync.js';

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST' || !authorizeOperator(request)) return;
  if (context.deploy.context !== 'production') return;
  try {
    await runSync(12 * 60 * 1000);
  } catch (error) {
    console.error('Shopify collection synchronization:', safeError(error));
  }
};

export const config: Config = { path: '/api/shopify/collection-sync-background', background: true };
