import React, { useState } from 'react';
import { Star } from 'lucide-react';
import type { Product } from '../types';
import { getDemoProductReviews } from '../data/demoProductReviews';

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
  const [filter, setFilter] = useState<number | null>(null);
  const { reviews, rating, count } = getDemoProductReviews(product);
  const filteredReviews = filter === null ? reviews : reviews.filter(review => review.rating === filter);

  return (
    <section id="product-reviews" className="py-10" aria-labelledby="product-reviews-heading">
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <h3 id="product-reviews-heading" className="font-anton text-2xl uppercase tracking-tight text-slate-900">Reviews & photos</h3>
      </div>
      <p className="text-xs text-slate-500 mb-5">These are fictional sample reviews, not live customer feedback. Photos are illustrative product images, not customer submissions.</p>
      <div className="rounded-2xl border border-[#A64D63]/20 bg-[#FFF5FA] p-5 mb-5 flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className="sm:min-w-40">
          <p className="text-4xl font-anton text-slate-900">{rating.toFixed(1)}<span className="text-base font-inter text-slate-500"> / 5</span></p>
          <div className="mt-2"><ReviewStars rating={rating} size={18} /></div>
          <p className="mt-1 text-xs text-slate-500">Based on {count} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(stars => {
            const total = reviews.filter(review => review.rating === stars).length;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs text-slate-600">
                <span className="w-9">{stars} star</span>
                <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-[#A64D63] rounded-full" style={{ width: `${total / count * 100}%` }} /></div>
                <span className="w-4 text-right">{total}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-5" aria-label="Filter reviews">
        {[null, 5, 4].map(stars => (
          <button key={stars ?? 'all'} type="button" aria-pressed={filter === stars} onClick={() => setFilter(stars)} className={`text-xs px-3 py-2 rounded-full border cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A64D63] ${filter === stars ? 'bg-[#A64D63] border-[#A64D63] text-white' : 'border-slate-200 text-slate-600 hover:border-[#A64D63]'}`}>
            {stars === null ? `All reviews (${count})` : `${stars} stars (${reviews.filter(review => review.rating === stars).length})`}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <article key={review.id} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <ReviewStars rating={review.rating} size={13} />
              <span className="text-[11px] text-slate-400">{review.date}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">{review.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
            <p className="text-[11px] text-slate-500 mt-3">{review.author} · {review.location}</p>
            {review.photo && (
              <figure className="mt-4">
                <img src={review.photo} alt={`Illustrative product photo of ${product.name}`} loading="lazy" width={120} height={120} className="w-30 h-30 rounded-xl bg-white object-contain border border-slate-200" />
              </figure>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
