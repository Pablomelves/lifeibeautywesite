import { Star } from 'lucide-react';
import type { Product } from '../types';

export function ReviewStars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="relative inline-flex text-slate-200" aria-hidden="true">
          <Star size={size} fill="currentColor" />
          <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-500" style={{ width: `${Math.max(0, Math.min(1, rating - index)) * 100}%` }}>
            <Star size={size} fill="currentColor" />
          </span>
        </span>
      ))}
    </span>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  return <section id="product-reviews" className="py-10" aria-labelledby="product-reviews-heading"><h3 id="product-reviews-heading" className="font-anton text-2xl uppercase tracking-tight text-slate-900 mb-3">Customer reviews</h3><div className="rounded-2xl border border-[#A64D63]/20 bg-[#FFF5FA] p-5 text-xs text-slate-600">No authenticated customer reviews are available for {product.name} yet. Ratings and customer photos will appear only when genuine review data is available.</div></section>;
}
