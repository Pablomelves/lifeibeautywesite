import React, { useState, useMemo } from 'react';
import { Star, Filter, ArrowUpDown, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { Review, Product, ReviewStats } from '../../types';
import { StarRating, RatingBreakdown, ReviewCard, ReviewMediaItem } from './ReviewSystem';
import { ReviewForm } from './ReviewForm';

interface ProductReviewSectionProps {
  product: Product;
  reviews: Review[];
}

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ product, reviews }) => {
  const [filterRating, setFilterRating] = useState<number | 'all' | 'media' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const stats = useMemo((): ReviewStats => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return { averageRating: 0, totalReviews: 0, ratingBreakdown: {} };
    }
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const breakdown: Record<number, number> = {};
    reviews.forEach(r => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });
    return {
      averageRating: sum / totalReviews,
      totalReviews,
      ratingBreakdown: breakdown
    };
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter
    if (filterRating !== 'all') {
      if (typeof filterRating === 'number') {
        result = result.filter(r => r.rating === filterRating);
      } else if (filterRating === 'media') {
        result = result.filter(r => r.media && r.media.length > 0);
      } else if (filterRating === 'verified') {
        result = result.filter(r => r.verified);
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

    return result;
  }, [reviews, filterRating, sortBy]);

  const mediaReviews = reviews.filter(r => r.media && r.media.length > 0);

  return (
    <div className="py-12 border-t border-slate-100 font-inter">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-16">
        {/* Left: Summary */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <h2 className="font-anton text-3xl uppercase tracking-tight text-slate-900">
            Customer Reviews
          </h2>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-6xl font-anton text-slate-900 leading-none">
              {stats.averageRating ? stats.averageRating.toFixed(1) : product.rating}
            </span>
            <div className="mt-4">
              <StarRating 
                rating={stats.averageRating || product.rating} 
                size={20} 
                count={stats.totalReviews || product.reviewsCount} 
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              100% Authentic Community Feedback
            </p>
          </div>
          <button 
            onClick={() => setShowReviewForm(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-md cursor-pointer"
          >
            Write a Review
          </button>
        </div>

        {/* Right: Breakdown */}
        <div className="flex-1 max-w-sm w-full">
          <RatingBreakdown stats={stats} />
        </div>
      </div>

      {/* Real Results Media Gallery */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={18} className="text-[#EC3460]" />
          <h3 className="font-anton text-xl uppercase text-slate-900">Real Results From Our Customers</h3>
        </div>
        
        {mediaReviews.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {mediaReviews.flatMap(r => r.media || []).slice(0, 8).map((media, i) => (
              <ReviewMediaItem key={i} media={media} />
            ))}
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Be the first to share your results ✨</p>
            <p className="text-xs text-slate-400 max-w-xs">Upload a photo or video with your review to help the community.</p>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="sticky top-0 bg-white z-20 py-4 border-b border-slate-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button 
            onClick={() => setFilterRating('all')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              filterRating === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(num => (
            <button 
              key={num}
              onClick={() => setFilterRating(num)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterRating === num ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {num} <Star size={10} fill={filterRating === num ? "white" : "currentColor"} />
            </button>
          ))}
          <button 
            onClick={() => setFilterRating('media')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              filterRating === 'media' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Photos & Videos
          </button>
          <button 
            onClick={() => setFilterRating('verified')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              filterRating === 'verified' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Verified
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest text-slate-700 outline-none focus:border-[#EC3460] cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ArrowUpDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-2">
        {filteredAndSortedReviews.length > 0 ? (
          filteredAndSortedReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-sm text-slate-500 italic">No reviews match your filter selection ✨</p>
          </div>
        )}
      </div>

      {/* Review Form Modal Overlay */}
      {showReviewForm && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="my-auto w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <ReviewForm 
              productName={product.name} 
              productId={product.id}
              onClose={() => setShowReviewForm(false)}
              onSubmit={(data) => {
                console.log('Submitted review:', data);
                setShowReviewForm(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
