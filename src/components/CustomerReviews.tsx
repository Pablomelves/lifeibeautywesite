import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VerifiedReview {
  id: string;
  name: string;
  location: string;
  date: string;
  rating: number;
  headline: string;
  body: string;
  productName: string;
  productImage: string;
  verifiedBuyer: boolean;
}

const VERIFIED_REVIEWS: VerifiedReview[] = [
  {
    id: 'rev-1',
    name: 'Sarah M.',
    location: 'Los Angeles, CA',
    date: 'March 2026',
    rating: 5,
    headline: 'Glass skin in a bottle',
    body: 'The Medicube PDRN serum made my skin look hydrated and plump within two days. The texture is lightweight, absorbs quickly, and gives an unreal healthy glow under makeup.',
    productName: 'Medicube PDRN Pink Peptide Serum',
    productImage: '/products/medicube-pink.jpg',
    verifiedBuyer: true,
  },
  {
    id: 'rev-2',
    name: 'Emily T.',
    location: 'Austin, TX',
    date: 'February 2026',
    rating: 5,
    headline: 'Best collagen mask I have ever used',
    body: 'I wore the Biodance mask overnight. When I woke up, the sheet had turned completely clear and my pores looked practically invisible. 100% authentic Seoul formula.',
    productName: 'Biodance Bio-Collagen Real Deep Mask',
    productImage: '/products/biodance.png',
    verifiedBuyer: true,
  },
  {
    id: 'rev-3',
    name: 'Jessica K.',
    location: 'New York, NY',
    date: 'January 2026',
    rating: 5,
    headline: 'Pore texture completely smoothed out',
    body: 'These turmeric & kojic pads replaced my harsh physical exfoliators. Gentle enough for daily use, yet powerful enough to fade post-acne dark marks noticeably.',
    productName: 'Kojic Acid & Turmeric Radiance Pads',
    productImage: '/products/medicube-turmeric.jpg',
    verifiedBuyer: true,
  },
  {
    id: 'rev-4',
    name: 'Hannah L.',
    location: 'Seattle, WA',
    date: 'March 2026',
    rating: 5,
    headline: 'Spa level facial sculpting at home',
    body: 'The cryo contour roller stays icy cold without freezer burn. It immediately depuffs morning swelling and sculpts the jawline like a professional lymphatic treatment.',
    productName: 'Seoul Clinical Cryo Contour Roller Set',
    productImage: '/products/facial-roller.jpg',
    verifiedBuyer: true,
  },
];

export const CustomerReviews: React.FC = () => {
  return (
    <section 
      id="reviews" 
      aria-label="Verified Customer Reviews" 
      className="site-customer-reviews py-16 sm:py-20 lg:py-24 bg-[#FFF5FA] font-inter border-b border-[#FFCDF2]/50"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#EC3460]">
              VERIFIED COMMUNITY LOVES
            </span>
          </div>
          <h2 className="font-anton text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#171417] leading-none">
            CUSTOMER REVIEWS
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#171417]">4.9 / 5.0</span>
            <span className="text-xs text-[#6F6870]">from over 2,400+ verified customer rituals</span>
          </div>
        </div>

        {/* Reviews Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {VERIFIED_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#FFCDF2]/60 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:border-[#EC3460]/40"
            >
              <div>
                {/* Stars and Verification Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  {review.verifiedBuyer && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} aria-hidden="true" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                {/* Headline and Quote */}
                <h3 className="font-bold text-sm sm:text-base text-[#171417] mb-2 leading-snug">
                  "{review.headline}"
                </h3>
                <p className="text-xs text-[#6F6870] leading-relaxed mb-4">
                  {review.body}
                </p>
              </div>

              {/* Reviewer Details & Product Purchased Thumbnail */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-xs text-[#171417] block truncate">
                    {review.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {review.location} · {review.date}
                  </span>
                </div>

                {/* Product Thumbnail */}
                <div 
                  className="w-10 h-10 rounded-xl bg-[#FFF0F9] border border-[#FFCDF2]/70 p-0.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs"
                  title={review.productName}
                >
                  <img
                    src={review.productImage}
                    alt={review.productName}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
