import { and, avg, count, desc, eq, lt } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { customerProductReviews } from '../../db/schema.js';
import type { ProductReview } from '../../src/types.js';
import type { ReviewStore } from './product-reviews.js';

const pageSize = 20;

export function getReviewStore(): ReviewStore {
  const database = getDatabase();
  const table = customerProductReviews;
  const publicFields = { id: table.id, productId: table.productId, productName: table.productName, author: table.author, rating: table.rating, title: table.title, comment: table.comment, createdAt: table.createdAt };
  const publicRow = (row: typeof table.$inferSelect | Omit<typeof table.$inferSelect, 'submissionId' | 'moderatedAt' | 'status'>): ProductReview => ({ id: row.id, productId: row.productId, productName: row.productName, author: row.author, rating: row.rating, title: row.title, comment: row.comment, createdAt: row.createdAt.toISOString() });
  return {
    published: async (productId, before) => {
      const filter = and(eq(table.productId, productId), eq(table.status, 'approved'));
      const [summary] = await database.select({ total: count(), average: avg(table.rating) }).from(table).where(filter);
      const rows = await database.select(publicFields).from(table).where(and(filter, before ? lt(table.id, before) : undefined)).orderBy(desc(table.id)).limit(pageSize + 1);
      return { reviews: rows.slice(0, pageSize).map(publicRow), total: Number(summary.total), averageRating: summary.total ? Number(summary.average) : null, nextCursor: rows.length > pageSize ? rows[pageSize - 1].id : null };
    },
    submit: async (review, productName) => {
      await database.insert(table).values({ submissionId: review.submissionId, productId: review.productId, productName, author: review.author, rating: review.rating, title: review.title, comment: review.comment, status: 'pending' }).onConflictDoNothing({ target: table.submissionId });
    },
    queue: async (status, before) => {
      const rows = await database.select({ ...publicFields, status: table.status }).from(table).where(and(eq(table.status, status), before ? lt(table.id, before) : undefined)).orderBy(desc(table.id)).limit(pageSize + 1);
      return { reviews: rows.slice(0, pageSize).map(row => ({ ...publicRow(row), status: row.status })), nextCursor: rows.length > pageSize ? rows[pageSize - 1].id : null };
    },
    moderate: async (id, status) => {
      const rows = await database.update(table).set({ status, moderatedAt: new Date() }).where(eq(table.id, id)).returning({ id: table.id });
      return rows.length > 0;
    },
  };
}
