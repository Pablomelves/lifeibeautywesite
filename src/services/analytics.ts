import type { CartItem } from '../types.js';

export const META_PIXEL_ID = '2122402601696752';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    lifeiAnalyticsConsent?: boolean;
    __lastMetaTrackedPath?: string;
  }
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.lifeiAnalyticsConsent !== true) return false;
  if (navigator.doNotTrack === '1') return false;
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return false;
  return true;
}

export function trackPageView(path?: string): boolean {
  if (!hasAnalyticsConsent()) return false;
  if (typeof window.fbq !== 'function') return false;

  const currentPath = (path || (typeof window !== 'undefined' ? window.location.pathname : ''))
    .replace(/\/$/, '') || '/';

  if (window.__lastMetaTrackedPath === currentPath) {
    return false; // prevent duplicate event for the same path
  }

  try {
    window.fbq('track', 'PageView');
    window.__lastMetaTrackedPath = currentPath;
    return true;
  } catch {
    return false;
  }
}

export function trackShoppingEvent(
  event: 'view_item' | 'search' | 'add_to_cart' | 'view_cart' | 'begin_checkout' | 'shopping_error',
  items: CartItem[] = [],
  resultCount?: number
): boolean {
  if (!hasAnalyticsConsent()) return false;

  const hasGtag = typeof window.gtag === 'function';
  const hasFbq = typeof window.fbq === 'function';
  if (!hasGtag && !hasFbq) return false;

  let tracked = false;
  const payload = {
    ...(items.length ? {
      currency: items[0].product.currencyCode || 'USD',
      value: items.reduce((total, item) => total + item.product.numericPrice * item.quantity, 0),
      items: items.map(item => ({ item_id: item.variantId || item.product.selectedVariantId || item.product.shopifyId, price: item.product.numericPrice, quantity: item.quantity })),
    } : {}),
    ...(typeof resultCount === 'number' ? { result_count: resultCount } : {}),
  };

  if (hasGtag) {
    try {
      window.gtag!('event', event, payload);
      tracked = true;
    } catch {}
  }

  if (hasFbq) {
    try {
      const fbEventMap: Record<string, string> = {
        view_item: 'ViewContent',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
      };
      const fbEvent = fbEventMap[event];
      if (fbEvent) {
        const totalValue = items.reduce((total, item) => total + item.product.numericPrice * item.quantity, 0);
        const currency = items[0]?.product.currencyCode || 'USD';
        const contentIds = items.map(item => String(item.variantId || item.product.selectedVariantId || item.product.shopifyId));
        window.fbq!('track', fbEvent, {
          content_ids: contentIds,
          content_type: 'product',
          value: totalValue,
          currency,
          ...(event === 'begin_checkout' ? { num_items: items.reduce((total, item) => total + item.quantity, 0) } : {})
        });
        tracked = true;
      }
    } catch {}
  }

  return tracked;
}
