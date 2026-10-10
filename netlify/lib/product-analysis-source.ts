import { createHash } from 'node:crypto';
import type { GalleryImage, ProductAnalysisSource } from '../../src/types/productInformation.js';

export class ProductAnalysisError extends Error {
  constructor(public code: string) { super(code); }
}

export function analysisImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 3000) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['cdn.shopify.com', 'maison-co-store1.myshopify.com'].includes(url.hostname) && !url.username && !url.password && !url.port;
  } catch { return false; }
}

export function productFingerprint(source: ProductAnalysisSource) {
  return createHash('sha256').update(JSON.stringify({ ...source, metadata: [...source.metadata].sort((first, second) => `${first.namespace}.${first.key}`.localeCompare(`${second.namespace}.${second.key}`)) })).digest('hex');
}

export type AnalysisShopifyReader = <Result>(query: string, variables: Record<string, unknown>) => Promise<Result>;

export const analysisShopifyQuery: AnalysisShopifyReader = async <Result>(query: string, variables: Record<string, unknown>): Promise<Result> => {
  const domain = (process.env.SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com').replace(/^https?:\/\//, '').split('/')[0];
  const version = process.env.SHOPIFY_API_VERSION || '2026-10';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (domain !== 'maison-co-store1.myshopify.com' || !/^\d{4}-(01|04|07|10)$/.test(version) || (token && privateToken) || /^(shpat_|shpca_|shpss_)/.test(token || '') || /^(shpat_|shpca_)/.test(privateToken || '')) throw new ProductAnalysisError('STOREFRONT_CONFIGURATION_UNAVAILABLE');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Shopify-Storefront-Access-Token'] = token;
  if (privateToken) headers['Shopify-Storefront-Private-Token'] = privateToken;
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, { method: 'POST', headers, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new ProductAnalysisError('STOREFRONT_READ_UNAVAILABLE');
  const payload = await response.json() as { data?: Result; errors?: unknown[] };
  if (payload.errors?.some(error => !!error && typeof error === 'object' && /access denied for metafield|unauthenticated_read_metafields/i.test(String((error as { message?: unknown }).message)))) throw new ProductAnalysisError('METADATA_ACCESS_UNAVAILABLE');
  if (!payload.data || payload.errors?.length) throw new ProductAnalysisError('STOREFRONT_QUERY_REJECTED');
  return payload.data;
};

const metadataIdentifiers = ['ingredients', 'full_ingredients', 'key_ingredients', 'benefits', 'how_to_use', 'usage', 'skin_type', 'warnings', 'before_after'].map(key => ({ namespace: 'custom', key }));
const productFields = `id title handle productType vendor description descriptionHtml tags updatedAt
  images(first: 100) { nodes { id url width height altText } pageInfo { hasNextPage endCursor } }`;
const metadataFields = 'metafields(identifiers: $metadata) { namespace key value type }';

interface SourceNode extends Omit<ProductAnalysisSource, 'productId' | 'metadata' | 'metadataAccessible' | 'images'> {
  metafields: (ProductAnalysisSource['metadata'][number] | null)[];
  images: { nodes: GalleryImage[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
}

async function completeSource(node: SourceNode, reader: AnalysisShopifyReader, metadataAccessible: boolean): Promise<ProductAnalysisSource> {
  const images = [...node.images.nodes];
  let pageInfo = node.images.pageInfo;
  const visited = new Set<string>();
  while (pageInfo.hasNextPage) {
    if (!pageInfo.endCursor || visited.has(pageInfo.endCursor) || visited.size > 100) throw new ProductAnalysisError('INCOMPLETE_IMAGE_GALLERY');
    visited.add(pageInfo.endCursor);
    const result = await reader<{ product: { images: SourceNode['images'] } | null }>(`query ProductAnalysisGallery($id: ID!, $after: String!) { product(id: $id) { images(first: 100, after: $after) { nodes { id url width height altText } pageInfo { hasNextPage endCursor } } } }`, { id: node.id, after: pageInfo.endCursor });
    if (!result.product) throw new ProductAnalysisError('PRODUCT_UNAVAILABLE');
    images.push(...result.product.images.nodes);
    pageInfo = result.product.images.pageInfo;
  }
  const { metafields, images: connection, ...product } = node;
  return { ...product, productId: node.id.replace(/^gid:\/\/shopify\/Product\//, ''), metadata: (metafields || []).filter((field): field is NonNullable<typeof field> => !!field), metadataAccessible, images };
}

async function readWithMetadata<Result>(reader: AnalysisShopifyReader, query: (metadata: boolean) => string, variables: Record<string, unknown>) {
  try { return { data: await reader<Result>(query(true), { ...variables, metadata: metadataIdentifiers }), metadataAccessible: true }; }
  catch (error) {
    if (!(error instanceof ProductAnalysisError) || error.code !== 'METADATA_ACCESS_UNAVAILABLE') throw error;
    return { data: await reader<Result>(query(false), variables), metadataAccessible: false };
  }
}

export async function readAnalysisCatalogPage(after: string | null, reader: AnalysisShopifyReader = analysisShopifyQuery) {
  const { data: result, metadataAccessible } = await readWithMetadata<{ products: { nodes: SourceNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }>(reader, metadata => `query ProductAnalysisCatalog($after: String${metadata ? ', $metadata: [HasMetafieldsIdentifier!]!' : ''}) { products(first: 10, after: $after, sortKey: ID) { nodes { ${productFields} ${metadata ? metadataFields : ''} } pageInfo { hasNextPage endCursor } } }`, { after });
  if (result.products.pageInfo.hasNextPage && (!result.products.pageInfo.endCursor || result.products.pageInfo.endCursor === after)) throw new ProductAnalysisError('INCOMPLETE_CATALOG');
  const products: ProductAnalysisSource[] = [];
  for (const node of result.products.nodes) products.push(await completeSource(node, reader, metadataAccessible));
  return { products, ...result.products.pageInfo };
}

export async function readAnalysisProduct(productId: string, reader: AnalysisShopifyReader = analysisShopifyQuery) {
  if (!/^[1-9]\d{0,15}$/.test(productId)) throw new ProductAnalysisError('INVALID_PRODUCT');
  const { data: result, metadataAccessible } = await readWithMetadata<{ product: SourceNode | null }>(reader, metadata => `query ProductAnalysisSource($id: ID!${metadata ? ', $metadata: [HasMetafieldsIdentifier!]!' : ''}) { product(id: $id) { ${productFields} ${metadata ? metadataFields : ''} } }`, { id: `gid://shopify/Product/${productId}` });
  return result.product ? completeSource(result.product, reader, metadataAccessible) : null;
}
