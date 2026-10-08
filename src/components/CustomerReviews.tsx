import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, Sparkles, Activity } from 'lucide-react';
import { STORE_REVIEWS } from '../data/storeData';

export const CustomerReviews: React.FC = () => {
  const [filterRating, setFilterRating] = useState<number | 'all' | 'rolling'>('all');
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});

  const filteredReviews = filterRating === 'all' 
    ? STORE_REVIEWS 
    : filterRating === 'rolling'
    ? STORE_REVIEWS.filter((r) => r.productId === 8 || r.beforeAfterTimeframe)
    : STORE_REVIEWS.filter((r) => r.rating === filterRating);

  const toggleLike = (id: string) => {
    setLikesMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FFF5FA] font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Rating Summary Bar */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#FFCDF2]/70 shadow-xs mb-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div>
              <span className="font-anton text-5xl sm:text-6xl text-slate-900 leading-none">
                4.94
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <h3 className="font-bold text-slate-900 text-lg uppercase">
                VERIFIED GLOW SATISFACTION
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Based on 2,840+ verified buyer reviews worldwide
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-600 font-medium">
                <span>98% Repurchase Rate</span>
                <span>·</span>
                <span>96% Noticeable Glass Glow in 14 Days</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                filterRating === 'all'
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              All Reviews ({STORE_REVIEWS.length})
            </button>
            <button
              onClick={() => setFilterRating('rolling')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                filterRating === 'rolling'
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              <Sparkles size={12} className={filterRating === 'rolling' ? 'text-white' : 'text-[#EC3460]'} />
              <span>Rolling Facial B&A (3)</span>
            </button>
            <button
              onClick={() => setFilterRating(5)}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                filterRating === 5
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              <Star size={12} fill="currentColor" className="text-amber-400" />
              <span>5 Stars</span>
            </button>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredReviews.map((review) => {
            const isLiked = Boolean(likesMap[review.id]);
            const baseLikes = review.likes || 18;
            const currentLikes = isLiked ? baseLikes + 1 : baseLikes;

            return (
              <div
                key={review.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFCDF2]/60 shadow-xs flex flex-col justify-between hover:border-[#EC3460]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {review.date}
                    </span>
                  </div>

                  {/* Before & After Special Highlighting Badge */}
                  {review.beforeAfterTimeframe && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-[10px] bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Sparkles size={11} className="text-[#EC3460]" />
                        {review.beforeAfterTimeframe}
                      </span>
                      {review.measuredMetric && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <Activity size={10} className="text-emerald-600" />
                          {review.measuredMetric}
                        </span>
                      )}
                    </div>
                  )}

                  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2">
                    "{review.title}"
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Routine Paired Badge */}
                  {review.routineUsed && (
                    <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/60 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">Ritual:</span>
                      <span>{review.routineUsed}</span>
                    </div>
                  )}

                  {/* Skin Profile Tags */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 text-[11px]">
                    <span className="bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2]/50 px-2.5 py-1 rounded-md font-medium">
                      Skin Goal: {review.skinConcern}
                    </span>
                    <span className="bg-slate-50 text-slate-700 border border-slate-200/60 px-2.5 py-1 rounded-md font-medium">
                      Type: {review.skinType}
                    </span>
                  </div>
                </div>

                {/* Author Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{review.author}</span>
                      {review.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle size={10} />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {review.location} · {review.productName}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleLike(review.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isLiked 
                        ? 'bg-[#FFF0F9] border-[#FFCDF2] text-[#EC3460] font-semibold' 
                        : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <ThumbsUp size={12} className={isLiked ? 'fill-current' : ''} />
                    <span>{currentLikes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
