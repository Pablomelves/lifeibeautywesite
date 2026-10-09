import { Product, ShopifyVariant, CartItem, ShopifyConfig } from '../types';

const DEFAULT_DOMAIN = 'lifeibeauty.myshopify.com';
const DEFAULT_STOREFRONT_TOKEN = '28514afc85b8fa8d004788302c17417e';
const DEFAULT_API_VERSION = '2024-01';

const getEnv = (key: string, fallback = ''): string => {
  const value = import.meta.env[key];
  return value ? String(value) : fallback;
};

const ENV_DOMAIN = getEnv('VITE_SHOPIFY_STORE_DOMAIN', DEFAULT_DOMAIN);
const ENV_TOKEN = getEnv('VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN', DEFAULT_STOREFRONT_TOKEN);
const ENV_API_VERSION = getEnv('VITE_SHOPIFY_API_VERSION', DEFAULT_API_VERSION);

// LocalStorage keys for optional in-app settings
const STORAGE_KEY_DOMAIN = 'lifei_shopify_domain';
const STORAGE_KEY_TOKEN = 'lifei_shopify_token';
const STORAGE_KEY_CART_ID = 'lifei_shopify_cart_id';

export function getShopifyConfig(): ShopifyConfig {
  let domain = '';
  let storefrontAccessToken = '';

  if (typeof window !== 'undefined') {
    domain = localStorage.getItem(STORAGE_KEY_DOMAIN) || ENV_DOMAIN || DEFAULT_DOMAIN;
    storefrontAccessToken = localStorage.getItem(STORAGE_KEY_TOKEN) || ENV_TOKEN || DEFAULT_STOREFRONT_TOKEN;
  } else {
    domain = ENV_DOMAIN || DEFAULT_DOMAIN;
    storefrontAccessToken = ENV_TOKEN || DEFAULT_STOREFRONT_TOKEN;
  }

  // Clean domain if it has http, trailing slashes, or missing myshopify.com
  domain = domain.replace(/^https?:\/\//, '').split('/')[0].trim();
  if (domain && !domain.includes('.')) {
    domain = `${domain}.myshopify.com`;
  }

  const isConnected = Boolean(domain && storefrontAccessToken && !storefrontAccessToken.includes('your_public'));

  return {
    domain,
    storefrontAccessToken: storefrontAccessToken.trim(),
    apiVersion: ENV_API_VERSION,
    isConnected,
  };
}

export function saveShopifyConfig(domain: string, token: string): ShopifyConfig {
  let cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].trim();
  if (cleanDomain && !cleanDomain.includes('.')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }
  const cleanToken = token.trim();

  if (typeof window !== 'undefined') {
    if (cleanDomain) localStorage.setItem(STORAGE_KEY_DOMAIN, cleanDomain);
    else localStorage.removeItem(STORAGE_KEY_DOMAIN);

    if (cleanToken) localStorage.setItem(STORAGE_KEY_TOKEN, cleanToken);
    else localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  return getShopifyConfig();
}

/**
 * Execute a GraphQL query against Shopify Storefront API
 * Attempts serverless proxy first (/api/shopify/graphql), falling back to direct Storefront API
 */
async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  const config = getShopifyConfig();

  if (!config.isConnected) {
    return null;
  }

  // Try Netlify server-side function endpoint first
  try {
    const proxyRes = await fetch('/api/shopify/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && !json.errors && json.data) {
        return json.data as T;
      }
    }
  } catch {
    // Continue to direct endpoint fallback
  }

  // Fallback to direct Shopify Storefront API endpoint
  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.warn(`[Shopify Storefront API] Request failed with HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.warn('[Shopify Storefront API] GraphQL Errors:', json.errors);
      return null;
    }

    return json.data as T;
  } catch (err) {
    console.warn('[Shopify Storefront API] Network error:', err);
    return null;
  }
}

/* =====================================================================
   GraphQL Queries
===================================================================== */

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
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
          images(first: 6) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
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
  query SearchProducts($query: String!, $first: Int!) {
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
          images(first: 6) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
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
  query GetCollections($first: Int!) {
    collections(first: $first) {
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
    numericPrice: parseFloat(v.node.price?.amount || '0') || numericPrice,
    compareAtPrice: v.node.compareAtPrice ? `${currency}${parseFloat(v.node.compareAtPrice.amount).toFixed(2)}` : undefined,
    availableForSale: v.node.availableForSale,
    selectedOptions: v.node.selectedOptions,
  }));

  // Map category based on productType or tags
  let category: Product['category'] = 'Serums';
  const typeLower = (node.productType || '').toLowerCase();
  const tagsStr = (node.tags || []).join(' ').toLowerCase();

  if (typeLower.includes('mask') || tagsStr.includes('mask')) {
    category = 'Masks';
  } else if (typeLower.includes('cream') || typeLower.includes('moistur') || tagsStr.includes('moisturizer')) {
    category = 'Moisturizers';
  } else if (typeLower.includes('clean') || typeLower.includes('pad') || tagsStr.includes('cleanser')) {
    category = 'Cleansers';
  } else if (typeLower.includes('eye') || tagsStr.includes('eye')) {
    category = 'Eye Care';
  } else if (typeLower.includes('set') || typeLower.includes('bundle') || tagsStr.includes('set')) {
    category = 'Sets & Bundles';
  } else if (typeLower.includes('roller') || typeLower.includes('tool') || tagsStr.includes('roller')) {
    category = 'Tools & Rollers';
  }

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
  const stableId = numericIdMatch ? parseInt(numericIdMatch[0].slice(-6), 10) : 1000 + index;

  return {
    id: stableId,
    name: node.title,
    subtitle: node.productType || 'Seoul Certified Skincare',
    src: primaryImage,
    bg: aesthetic.bg,
    panel: aesthetic.panel,
    themeColor: aesthetic.themeColor,
    darkTone: aesthetic.darkTone,
    price,
    numericPrice,
    originalPrice,
    volume: variants[0]?.title && variants[0]?.title !== 'Default Title' ? variants[0]?.title : 'Full Size',
    category,
    rating: 4.9,
    reviewsCount: 120 + (index * 25),
    badge: (node.tags || []).includes('bestseller') ? 'Bestseller' : (node.tags || []).includes('new') ? 'New Arrival' : 'Shopify Verified',
    clinicalClaim: '+100% Bio-Active Delivery & Barrier Radiance',
    benefits: [
      'Clinically formulated Korean skincare actives for direct cellular repair',
      'Provides a lasting, dewy glass-skin finish with zero pore-clogging heaviness',
      'Certified authentic manufacturing with direct Seoul headquarters verification',
    ],
    keyIngredients: (node.tags || []).slice(0, 4).length > 0 ? (node.tags || []).slice(0, 4) : ['Seoul Active Botanical Complex', 'Hyaluronic Acid', 'Peptides'],
    allIngredients: node.description || 'Water, Glycerin, Butylene Glycol, Centella Asiatica, Sodium Hyaluronate, Niacinamide, Adenosine, Ethylhexylglycerin.',
    howToUse: [
      'Apply to freshly cleansed and toned skin.',
      'Gently smooth in upward lifting motions along the facial contour.',
      'Follow with your favorite barrier cream and daytime sunscreen.'
    ],
    ritualStep: 'Targeted Clinical Treatment & Glow Restoration',
    skinType: 'All Skin Types · Dermatologically Tested',
    fullDescription: node.descriptionHtml ? node.descriptionHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : node.description || 'Clinical Korean formulation curated by Li Fei Beauty.',
    stockStatus: node.availableForSale ? 'In Stock' : 'Out of Stock',
    shopifyId: node.id,
    handle: node.handle,
    variants,
    selectedVariantId: variants[0]?.id,
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
export async function getShopifyProducts(first = 24): Promise<Product[] | null> {
  interface ProductsResponse {
    products: {
      edges: Array<{
        node: ShopifyProductNode;
      }>;
    };
  }

  const data = await shopifyFetch<ProductsResponse>(PRODUCTS_QUERY, { first });
  if (!data?.products?.edges || data.products.edges.length === 0) {
    return null;
  }

  return data.products.edges.map((edge, idx) => transformShopifyProduct(edge.node, idx));
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

  return data.products.edges.map((edge, idx) => transformShopifyProduct(edge.node, idx));
}

/**
 * Fetch collections from Shopify
 */
export async function getShopifyCollections(first = 10): Promise<Array<{ id: string; title: string; handle: string; description: string; image?: string }> | null> {
  interface CollectionsResponse {
    collections: {
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

  const data = await shopifyFetch<CollectionsResponse>(COLLECTIONS_QUERY, { first });
  if (!data?.collections?.edges) return null;

  return data.collections.edges.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    handle: e.node.handle,
    description: e.node.description,
    image: e.node.image?.url,
  }));
}

/**
 * Create a real Shopify Checkout URL from current cart items
 */
export async function createShopifyCheckout(cartItems: CartItem[]): Promise<string | null> {
  const config = getShopifyConfig();
  if (!config.isConnected) {
    return null;
  }

  // Format cart lines for Shopify Cart API
  const lines = cartItems
    .filter((item) => item.product.shopifyId || item.variantId)
    .map((item) => {
      const merchandiseId = item.variantId || item.product.selectedVariantId || item.product.variants?.[0]?.id || item.product.shopifyId;
      return {
        merchandiseId,
        quantity: item.quantity,
      };
    })
    .filter((line): line is { merchandiseId: string; quantity: number } => Boolean(line.merchandiseId));

  if (lines.length === 0) {
    // If no Shopify IDs, create a draft link to the storefront
    return `https://${config.domain}/cart`;
  }

  interface CartCreateResponse {
    cartCreate: {
      cart?: {
        id: string;
        checkoutUrl: string;
      };
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }

  const data = await shopifyFetch<CartCreateResponse>(CART_CREATE_MUTATION, {
    input: { lines },
  });

  if (data?.cartCreate?.cart?.checkoutUrl) {
    if (typeof window !== 'undefined' && data.cartCreate.cart.id) {
      localStorage.setItem(STORAGE_KEY_CART_ID, data.cartCreate.cart.id);
    }
    return data.cartCreate.cart.checkoutUrl;
  }

  // Fallback to Shopify cart permalink if mutation errors
  const lineQuery = lines.map((l) => `${l.merchandiseId.split('/').pop()}:${l.quantity}`).join(',');
  return `https://${config.domain}/cart/${lineQuery}`;
}
