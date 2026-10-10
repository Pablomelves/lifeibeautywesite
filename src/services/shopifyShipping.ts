import type { CartItem } from '../types.js';
import { shopifyFetch } from './shopifyClient.js';

export interface ShippingAddress {
  address1: string;
  address2: string;
  city: string;
  provinceCode: string;
  zip: string;
  countryCode: string;
}

export interface ShippingOption {
  handle: string;
  title: string | null;
  deliveryMethodType: string;
  estimatedCost: { amount: string; currencyCode: string };
}

export interface ShippingGroup {
  id: string;
  deliveryOptions: ShippingOption[];
}

export interface ShippingEstimate {
  groups: ShippingGroup[];
  combined: { amount: number; currencyCode: string } | null;
  source: 'live' | 'configured';
}

const GROUP_FIELDS = `
  pageInfo { hasNextPage }
  nodes {
    id
    deliveryOptions { handle title deliveryMethodType estimatedCost { amount currencyCode } }
  }
`;

const LIVE_RATES_QUERY = `
  query ShippingRates($id: ID!) {
    cart(id: $id) {
      id
      ... @defer { deliveryGroups(first: 250, withCarrierRates: true) { ${GROUP_FIELDS} } }
    }
  }
`;

const CONFIGURED_RATES_QUERY = `
  query ConfiguredShippingRates($id: ID!) {
    cart(id: $id) { deliveryGroups(first: 250) { ${GROUP_FIELDS} } }
  }
`;

interface RatesResponse {
  cart: { deliveryGroups?: { pageInfo: { hasNextPage: boolean }; nodes: ShippingGroup[] } } | null;
}

export function getShopifyCartLines(items: CartItem[]) {
  if (!items.length) throw new Error('Your shopping bag is empty.');
  if (items.length > 250) throw new Error('Shopify can estimate up to 250 different items at once.');
  return items.map(item => {
    const merchandiseId = item.variantId || item.product.selectedVariantId || item.product.variants?.find(variant => variant.availableForSale)?.id;
    const variant = item.product.variants?.find(variant => variant.id === merchandiseId);
    if (item.product.availableForSale === false || variant?.availableForSale === false) {
      throw new Error(`${item.product.name} is currently unavailable. Remove it from your bag or select an available variant.`);
    }
    if (!merchandiseId || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(merchandiseId) || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error('Select an available Shopify product variant and a valid quantity.');
    }
    return { merchandiseId, quantity: item.quantity };
  });
}

export function getShippingSummary(data: RatesResponse, source: ShippingEstimate['source']): ShippingEstimate {
  const connection = data.cart?.deliveryGroups;
  if (!connection || connection.pageInfo.hasNextPage) throw new Error('Shipping rates are incomplete. Please check shipping at checkout.');
  const groups = connection.nodes.map(group => ({
    ...group,
    deliveryOptions: group.deliveryOptions.filter(option =>
      ['SHIPPING', 'LOCAL', 'PICKUP_POINT'].includes(option.deliveryMethodType)
      && option.estimatedCost.amount.trim() !== ''
      && Number.isFinite(Number(option.estimatedCost.amount))
      && Number(option.estimatedCost.amount) >= 0
      && /^[A-Z]{3}$/.test(option.estimatedCost.currencyCode)
    ),
  }));
  if (!groups.length || groups.some(group => !group.deliveryOptions.length)) {
    throw new Error('Shopify returned no shipping rates for this address and these items. Check the address or continue to checkout for available delivery options.');
  }
  const cheapest = groups.map(group => group.deliveryOptions.reduce((best, option) =>
    Number(option.estimatedCost.amount) < Number(best.estimatedCost.amount) ? option : best
  ));
  const currencyCode = cheapest[0].estimatedCost.currencyCode;
  const sameCurrency = groups.every(group => group.deliveryOptions.every(option => option.estimatedCost.currencyCode === currencyCode));
  return {
    groups,
    source,
    combined: sameCurrency ? { amount: cheapest.reduce((sum, option) => sum + Number(option.estimatedCost.amount), 0), currencyCode } : null,
  };
}

export async function getShippingCountries(signal: AbortSignal) {
  const data = await shopifyFetch<{ localization: { availableCountries: { isoCode: string; name: string }[] } }>(
    'query ShippingCountries { localization { availableCountries { isoCode name } } }', {}, signal,
  );
  return data.localization.availableCountries;
}

export async function getShopifyShippingEstimate(items: CartItem[], address: ShippingAddress, discountCode: string | undefined, signal: AbortSignal): Promise<ShippingEstimate> {
  if (!address.address1.trim() || !address.city.trim() || !/^[A-Z]{2}$/.test(address.countryCode)) {
    throw new Error('Enter a street address, city, and country to calculate shipping.');
  }
  const deliveryAddress = Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()]));
  const data = await shopifyFetch<{ cartCreate: { cart: { id: string; totalQuantity: number } | null; userErrors: { message: string }[]; warnings: { code: string }[] } }>(`
    mutation ShippingCartCreate($input: CartInput!) {
      cartCreate(input: $input) { cart { id totalQuantity } userErrors { message } warnings { code } }
    }
  `, {
    input: {
      lines: getShopifyCartLines(items),
      buyerIdentity: { countryCode: address.countryCode },
      delivery: { addresses: [{ address: { deliveryAddress }, selected: true, oneTimeUse: true }] },
      ...(discountCode ? { discountCodes: [discountCode] } : {}),
    },
  }, signal);
  const result = data.cartCreate;
  if (result.userErrors.length) throw new Error(result.userErrors.map(error => error.message).join(' '));
  if (!result.cart || result.cart.totalQuantity !== items.reduce((sum, item) => sum + item.quantity, 0) || result.warnings?.length) {
    throw new Error('Shopify could not quote all selected items. Check availability and your delivery address, or continue to checkout.');
  }
  const variables = { id: result.cart.id };
  try {
    return getShippingSummary(await shopifyFetch<RatesResponse>(LIVE_RATES_QUERY, variables, signal), 'live');
  } catch (error) {
    if (signal.aborted) throw error;
    return getShippingSummary(await shopifyFetch<RatesResponse>(CONFIGURED_RATES_QUERY, variables, signal), 'configured');
  }
}
