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
  const response = await fetch('/api/bag', { method, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Your bag could not be saved. Please retry.');
  return data as { lines?: StoredBagLine[]; revision: number };
}
