import type { Product, ShopifyVariant, CartItem, ShopifyConfig } from '../types.js';
import { collectionFamily } from './collectionRules.js';

const DEFAULT_DOMAIN = 'maison-co-store1.myshopify.com';
const DEFAULT_API_VERSION = '2026-10';

export function getShopifyConfig(): ShopifyConfig {
  return {
    domain: DEFAULT_DOMAIN,
    storefrontAccessToken: '',
    apiVersion: DEFAULT_API_VERSION,
    isConnected: true,
  };
}

/**
 * Execute a GraphQL query against Shopify Storefront API
 * Uses the server-managed connection exclusively.
 */
async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  try {
    const res = await fetch('/api/shopify/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 404 || res.headers.get('content-type')?.includes('text/html')) {
      throw new Error('The Shopify connection endpoint is unavailable. The Netlify Shopify function must be deployed with this website.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || `Shopify request failed (HTTP ${res.status}). Verify the Netlify connection settings and Shopify product publication.`);
    }
    if (json.errors?.length || !json.data) {
      throw new Error('Shopify rejected the request. Verify Storefront API permissions and product publication for this sales channel.');
    }
    return json.data as T;
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new Error('Shopify took too long to respond. Please try again.');
    }
    throw error;
  }
}

/* =====================================================================
   GraphQL Queries
===================================================================== */

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) @inContext(country: US) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
          collections(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { id title handle }
          }
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 250) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 250) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  query SearchProducts($query: String!, $first: Int!) @inContext(country: US) {
    products(query: $query, first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
          collections(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { id title handle }
          }
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 250) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 250) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        discountCodes { code applicable }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
      warnings { code }
    }
  }
`;

/* =====================================================================
   Transformer: Shopify Node -> Li Fei Beauty Product
===================================================================== */

export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  productType: string;
  tags: string[];
  collections?: {
    nodes: { id: string; title: string; handle: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    pageInfo?: { hasNextPage: boolean; endCursor: string };
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        } | null;
        selectedOptions?: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
}

export function transformShopifyProduct(node: ShopifyProductNode, index: number): Product {
  const numericPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || '0') || 0;
  const currency = node.priceRange?.minVariantPrice?.currencyCode === 'USD' ? '$' : `${node.priceRange?.minVariantPrice?.currencyCode || '$'} `;
  const price = `${currency}${numericPrice.toFixed(2)}`;

  let originalPrice: string | undefined = undefined;
  if (node.compareAtPriceRange?.minVariantPrice?.amount) {
    const origNumeric = parseFloat(node.compareAtPriceRange.minVariantPrice.amount);
    if (origNumeric > numericPrice) {
      originalPrice = `${currency}${origNumeric.toFixed(2)}`;
    }
  }

  const primaryImage = node.images?.edges?.[0]?.node?.url || '';
  const allImages = (node.images?.edges || []).map(edge => edge.node.url);

  const variants: ShopifyVariant[] = (node.variants?.edges || []).map((v) => ({
    id: v.node.id,
    title: v.node.title,
    price: `${currency}${parseFloat(v.node.price?.amount || '0').toFixed(2)}`,
    numericPrice: parseFloat(v.node.price?.amount || '0'),
    compareAtPrice: v.node.compareAtPrice ? `${currency}${parseFloat(v.node.compareAtPrice.amount).toFixed(2)}` : undefined,
    availableForSale: v.node.availableForSale,
    selectedOptions: v.node.selectedOptions,
  }));
  const defaultVariant = variants.find(variant => variant.availableForSale) || variants[0];

  const collections = node.collections?.nodes || [];
  const categoryNames: Record<string, string> = { serums: 'Serums', masks: 'Masks', cleansers: 'Cleansers', moisturizers: 'Moisturizers', eye: 'Eye Care', bundles: 'Sets & Bundles', tools: 'Tools & Rollers' };
  const family = collections.map(collection => collectionFamily(collection.title)).find(Boolean);
  const category: Product['category'] = family ? categoryNames[family] : collections[0]?.title || 'Uncategorized';

  // Soft Korean brand background aesthetics
  const palettes = [
    { bg: '#EFA6B7', panel: '#FDF0F3', themeColor: '#EC3460', darkTone: false },
    { bg: '#5E101D', panel: '#3F0811', themeColor: '#EC3460', darkTone: true },
    { bg: '#E4980E', panel: '#FCF2DC', themeColor: '#D97706', darkTone: false },
    { bg: '#CBD5E1', panel: '#F1F5F9', themeColor: '#475569', darkTone: false },
  ];
  const aesthetic = palettes[index % palettes.length];

  // Stable numeric ID derived from Shopify GraphQL ID (gid://shopify/Product/123456789)
  const numericIdMatch = node.id.match(/\d+$/);
  const stableId = numericIdMatch ? parseInt(numericIdMatch[0], 10) : 1000 + index;

  return {
    id: stableId,
    name: node.title,
    subtitle: node.productType || '',
    src: primaryImage,
    bg: aesthetic.bg,
    panel: aesthetic.panel,
    themeColor: aesthetic.themeColor,
    darkTone: aesthetic.darkTone,
    price: defaultVariant?.price || price,
    numericPrice: defaultVariant?.numericPrice ?? numericPrice,
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    originalPrice: defaultVariant?.compareAtPrice && Number(defaultVariant.compareAtPrice.replace(/[^\d.]/g, '')) > (defaultVariant.numericPrice ?? numericPrice) ? defaultVariant.compareAtPrice : undefined,
    volume: defaultVariant?.title && defaultVariant.title !== 'Default Title' ? defaultVariant.title : '',
    category,
    collections,
    rating: 0,
    reviewsCount: 0,
    badge: (node.tags || []).includes('bestseller') ? 'Bestseller' : (node.tags || []).includes('new') ? 'New Arrival' : undefined,
    clinicalClaim: '',
    benefits: [],
    keyIngredients: [],
    allIngredients: '',
    howToUse: [],
    ritualStep: '',
    skinType: '',
    fullDescription: node.description || '',
    description: node.description || '',
    descriptionHtml: node.descriptionHtml || '',
    stockStatus: node.availableForSale ? 'In Stock' : 'Out of Stock',
    shopifyId: node.id,
    handle: node.handle,
    variants,
    selectedVariantId: defaultVariant?.id,
    availableForSale: node.availableForSale,
    images: allImages.length > 0 ? allImages : [primaryImage],
  };
}

/* =====================================================================
   Public API Methods
==================================================================== */

/**
 * Fetch real products from Shopify Storefront API
 */
export async function getShopifyProducts(first = 24): Promise<Product[]> {
  interface ProductsResponse {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: Array<{
        node: ShopifyProductNode;
      }>;
    };
  }

  const nodes: ShopifyProductNode[] = [];
  let after: string | null = null;
  do {
    const data: ProductsResponse = await shopifyFetch<ProductsResponse>(PRODUCTS_QUERY, { first: Math.min(250, Math.max(1, first)), after });
    if (!data?.products?.edges || !data.products.pageInfo) {
      throw new Error('Shopify returned an invalid product response. Please verify Storefront product permissions.');
    }
    nodes.push(...data.products.edges.map(edge => edge.node));
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    if (data.products.pageInfo.hasNextPage && !after) throw new Error('Shopify returned an invalid product cursor.');
  } while (after);
  await Promise.all(nodes.map(async node => {
    await loadRemainingVariants(node);
    await loadRemainingCollections(node);
  }));
  return nodes.map(transformShopifyProduct);
}

async function loadRemainingVariants(node: ShopifyProductNode): Promise<void> {
  while (node.variants.pageInfo?.hasNextPage) {
    const data = await shopifyFetch<{ product: { variants: ShopifyProductNode['variants'] } }>(`
      query ProductVariants($id: ID!, $after: String!) {
        product(id: $id) {
          variants(first: 250, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges { node {
              id title availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
            } }
          }
        }
      }
    `, { id: node.id, after: node.variants.pageInfo.endCursor });
    if (!data?.product?.variants) throw new Error('Unable to load all Shopify product variants.');
    node.variants.edges.push(...data.product.variants.edges);
    node.variants.pageInfo = data.product.variants.pageInfo;
  }
}

async function loadRemainingCollections(node: ShopifyProductNode): Promise<void> {
  while (node.collections?.pageInfo.hasNextPage) {
    const after = node.collections.pageInfo.endCursor;
    if (!after) throw new Error('Shopify returned an invalid collection membership cursor.');
    const data = await shopifyFetch<{ product: { collections: NonNullable<ShopifyProductNode['collections']> } | null }>(`
      query ProductCollections($id: ID!, $after: String!) {
        product(id: $id) {
          collections(first: 100, after: $after) { nodes { id title handle } pageInfo { hasNextPage endCursor } }
        }
      }
    `, { id: node.id, after });
    if (!data?.product?.collections) throw new Error('Unable to load all Shopify collection memberships.');
    node.collections.nodes.push(...data.product.collections.nodes);
    node.collections.pageInfo = data.product.collections.pageInfo;
  }
}

/**
 * Search products via Shopify Storefront API
 */
export async function searchShopifyProducts(searchQuery: string, first = 10): Promise<Product[] | null> {
  interface SearchResponse {
    products: {
      edges: Array<{
        node: ShopifyProductNode;
      }>;
    };
  }

  const data = await shopifyFetch<SearchResponse>(SEARCH_QUERY, { query: searchQuery, first });
  if (!data?.products?.edges) {
    return null;
  }

  await Promise.all(data.products.edges.map(async edge => {
    await loadRemainingVariants(edge.node);
    await loadRemainingCollections(edge.node);
  }));
  return data.products.edges.map((edge, idx) => transformShopifyProduct(edge.node, idx));
}

/**
 * Fetch collections from Shopify
 */
export async function getShopifyCollections(first = 10): Promise<Array<{ id: string; title: string; handle: string; description: string; image?: string }> | null> {
  interface CollectionsResponse {
    collections: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          image?: { url: string };
        };
      }>;
    };
  }

  const collections: NonNullable<Awaited<ReturnType<typeof getShopifyCollections>>> = [];
  let after: string | null = null;
  do {
    const data: CollectionsResponse | null = await shopifyFetch<CollectionsResponse>(COLLECTIONS_QUERY, { first: Math.min(100, Math.max(1, first)), after });
    if (!data?.collections?.edges || !data.collections.pageInfo) return null;
    collections.push(...data.collections.edges.map(edge => ({
      id: edge.node.id, title: edge.node.title, handle: edge.node.handle,
      description: edge.node.description, image: edge.node.image?.url,
    })));
    after = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null;
    if (data.collections.pageInfo.hasNextPage && !after) throw new Error('Shopify returned an invalid collection cursor.');
  } while (after);
  return collections;
}

/**
 * Create a real Shopify Checkout URL from current cart items
 */
export async function createShopifyCheckout(cartItems: CartItem[], discountCode?: string): Promise<string> {
  if (!cartItems.length) throw new Error('Your shopping bag is empty.');
  const lines = cartItems
    .map((item) => {
      const merchandiseId = item.variantId || item.product.selectedVariantId || item.product.variants?.find(variant => variant.availableForSale)?.id;
      const variant = item.product.variants?.find(variant => variant.id === merchandiseId);
      if (item.product.availableForSale === false || variant?.availableForSale === false) {
        throw new Error(`${item.product.name} is currently unavailable. Remove it from your bag or select an available variant.`);
      }
      if (!merchandiseId || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(merchandiseId) || !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error('Select an available Shopify product variant and a valid quantity before checkout.');
      }
      return {
        merchandiseId,
        quantity: item.quantity,
      };
    });

  interface CartCreateResponse {
    cartCreate: {
      cart?: {
        id: string;
        checkoutUrl: string;
        totalQuantity: number;
        discountCodes?: Array<{ code: string; applicable: boolean }>;
      };
      userErrors: Array<{ field: string[]; message: string }>;
      warnings?: Array<{ code: string }>;
    };
  }

  const data = await shopifyFetch<CartCreateResponse>(CART_CREATE_MUTATION, {
    input: { lines, ...(discountCode ? { discountCodes: [discountCode] } : {}) },
  });

  if (data?.cartCreate?.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors.map(error => error.message).join(' '));
  }
  const cart = data?.cartCreate?.cart;
  if (!cart) throw new Error('Shopify did not create a cart. Please check your bag and try again.');
  if (cart.totalQuantity !== cartItems.reduce((sum, item) => sum + item.quantity, 0) || data.cartCreate.warnings?.length) {
    throw new Error('Shopify could not checkout all selected items at these quantities. Please check your bag and try again.');
  }
  if (discountCode && !cart.discountCodes?.some(code => code.code.toUpperCase() === discountCode.toUpperCase() && code.applicable)) {
    throw new Error('This discount code is not applicable to your bag. Remove it or use another code.');
  }
  if (data?.cartCreate?.cart?.checkoutUrl) {
    return data.cartCreate.cart.checkoutUrl;
  }

  throw new Error('Shopify did not return a checkout URL. Please try again.');
}

export async function validateShopifyDiscount(items: CartItem[], code: string) {
  await createShopifyCheckout(items, code);
}
