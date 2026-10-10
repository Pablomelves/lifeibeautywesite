import type { Config, Context } from '@netlify/functions';
import { safeError } from '../lib/shopify-admin.js';
import { runSync } from '../lib/shopify-sync.js';

export default async (_request: Request, context: Context) => {
  if (process.env.SHOPIFY_SYNC_ENABLED !== 'true') return;
  if (context.deploy.context !== 'production') return;
  try {
    await runSync();
  } catch (error) {
    console.error('Shopify collection synchronization:', safeError(error));
  }
};

export const config: Config = { schedule: '*/5 * * * *' };
