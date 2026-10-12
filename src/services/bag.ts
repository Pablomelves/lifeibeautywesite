import type { CartItem, Product } from '../types.js';

export interface StoredBagLine { productId: number; variantId: string; quantity: number }

export function serializeBag(items: CartItem[]): StoredBagLine[] {
  return items.map(item => ({ productId: item.product.id, variantId: item.variantId || item.product.selectedVariantId || '', quantity: item.quantity }));
}

export function restoreBag(lines: StoredBagLine[], products: Product[]): CartItem[] {
  return lines.flatMap(line => {
    const product = products.find(product => product.id === line.productId);
    const variant = product?.variants?.find(variant => variant.id === line.variantId);
    if (!product || !variant || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 999) return [];
    return [{ product: { ...product, selectedVariantId: variant.id, price: variant.price, numericPrice: variant.numericPrice, availableForSale: variant.availableForSale }, variantId: variant.id, quantity: line.quantity, selectedSize: variant.title === 'Default Title' ? product.volume : variant.title }];
  });
}

export async function requestBag(method: 'GET' | 'PUT', body?: { lines: StoredBagLine[]; revision: number }, signal?: AbortSignal) {
  const response = await fetch('/api/bag', { 
    method, 
    credentials: 'same-origin', 
    cache: 'no-store', 
    headers: { 'Content-Type': 'application/json' }, 
    ...(body ? { body: JSON.stringify(body) } : {}), 
    signal: (() => {
      try {
        const timeoutSig = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(10000) : undefined;
        if (signal && timeoutSig && typeof (AbortSignal as any).any === 'function') {
          return (AbortSignal as any).any([signal, timeoutSig]);
        }
        return signal || timeoutSig;
      } catch {
        return signal;
      }
    })(), 
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      throw new Error('Your shopping bag could not be parsed. Please retry.');
    }
  } else {
    // Non-JSON response (e.g. HTML 404, 502 gateway error)
    throw new Error('Shopping bag service is temporarily unavailable. Please retry.');
  }

  if (!response.ok) throw new Error(data?.error || 'Your bag could not be saved. Please retry.');
  return data as { lines?: StoredBagLine[]; revision: number };
}
