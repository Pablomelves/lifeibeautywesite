import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { createBagHandler, type BagLine } from '../lib/storefront-bag.js';

export default async (request: Request) => createBagHandler({
  read: async id => {
    const database = getDatabase();
    await database.sql`DELETE FROM storefront_bags WHERE id IN (SELECT id FROM storefront_bags WHERE expires_at <= NOW() LIMIT 100)`;
    const rows = await database.sql`SELECT lines, revision FROM storefront_bags WHERE id = ${id} AND expires_at > NOW()`;
    return rows[0] ? { lines: rows[0].lines as BagLine[], revision: rows[0].revision as number } : null;
  },
  save: async (id, lines, revision) => {
    const database = getDatabase();
    await database.sql`DELETE FROM storefront_bags WHERE id = ${id} AND expires_at <= NOW()`;
    if (revision > 0) {
      const rows = await database.sql`UPDATE storefront_bags SET lines = ${JSON.stringify(lines)}::jsonb, revision = revision + 1, expires_at = NOW() + INTERVAL '30 days' WHERE id = ${id} AND revision = ${revision} RETURNING revision`;
      return rows[0] ? rows[0].revision as number : null;
    }
    const rows = await database.sql`INSERT INTO storefront_bags (id, lines, revision, expires_at) VALUES (${id}, ${JSON.stringify(lines)}::jsonb, 1, NOW() + INTERVAL '30 days') ON CONFLICT (id) DO NOTHING RETURNING revision`;
    return rows[0] ? rows[0].revision as number : null;
  },
})(request);

export const config: Config = { path: '/api/bag' };
