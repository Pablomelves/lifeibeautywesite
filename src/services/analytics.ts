import type { CartItem } from '../types.js';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    lifeiAnalyticsConsent?: boolean;
  }
}

export function trackShoppingEvent(event: 'view_item' | 'search' | 'add_to_cart' | 'view_cart' | 'begin_checkout' | 'shopping_error', items: CartItem[] = [], resultCount?: number) {
  if (typeof window === 'undefined' || window.lifeiAnalyticsConsent !== true || typeof window.gtag !== 'function' || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return false;
  const payload = {
    ...(items.length ? {
      currency: items[0].product.currencyCode || 'USD',
      value: items.reduce((total, item) => total + item.product.numericPrice * item.quantity, 0),
      items: items.map(item => ({ item_id: item.variantId || item.product.selectedVariantId || item.product.shopifyId, price: item.product.numericPrice, quantity: item.quantity })),
    } : {}),
    ...(typeof resultCount === 'number' ? { result_count: resultCount } : {}),
  };
  try { window.gtag('event', event, payload); return true; } catch { return false; }
}
