import React from 'react';
import { Star, CheckCircle, ThumbsUp, Image as ImageIcon, Video as VideoIcon, Plus } from 'lucide-react';
import { Review, ReviewMedia, ReviewStats } from '../../types';

export const StarRating: React.FC<{ rating: number; size?: number; showValue?: boolean; count?: number }> = ({ 
  rating, 
  size = 16, 
  showValue = false,
  count
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={size} 
            fill={i < Math.floor(rating) ? "currentColor" : "none"} 
            className={i < Math.floor(rating) ? "" : "text-slate-200"}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-bold text-slate-900">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs font-medium text-slate-500 underline underline-offset-4 decoration-slate-200">
          {count} Reviews
        </span>
      )}
    </div>
  );
};

export const RatingBreakdown: React.FC<{ stats: ReviewStats }> = ({ stats }) => {
  return (
    <div className="space-y-2.5 w-full max-w-xs">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = stats.ratingBreakdown[star] || 0;
        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-10 shrink-0">
              <span className="text-xs font-bold text-slate-700">{star}</span>
              <Star size={10} fill="currentColor" className="text-amber-400" />
            </div>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ReviewMediaItem: React.FC<{ media: ReviewMedia; onClick?: () => void }> = ({ media, onClick }) => {
  const [showLightbox, setShowLightbox] = React.useState(false);

  const handleClick = () => {
    setShowLightbox(true);
    if (onClick) onClick();
  };

  return (
    <>
      <div 
        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-100"
        onClick={handleClick}
      >
        {(media.thumbnailUrl || media.url) ? (
          <img 
            src={media.thumbnailUrl || media.url} 
            alt="Review media" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
             <ImageIcon size={20} className="text-slate-300" />
          </div>
        )}
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-slate-900 shadow-sm translate-y-0 group-hover:-translate-y-1 transition-transform">
              <Plus size={20} className="rotate-45 ml-0.5 fill-current" />
            </div>
          </div>
        )}
      </div>

      {showLightbox && (
        <div 
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowLightbox(false)}
        >
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <Plus size={32} className="rotate-45" />
          </button>
          <div className="max-w-5xl max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {media.type === 'video' ? (
              media.url ? (
                <video src={media.url} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
              ) : (
                <div className="text-white">Video not found</div>
              )
            ) : (
              media.url ? (
                <img src={media.url} alt="Full size review" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              ) : (
                <div className="text-white">Image not found</div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="py-8 border-b border-slate-100 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <StarRating rating={review.rating} size={14} />
            <span className="text-xs font-bold text-slate-900">{review.title}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <span>{review.author}</span>
            <span>·</span>
            <span>{new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            {review.verified && (
              <>
                <span>·</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle size={10} />
                  Verified Purchase
                </span>
              </>
            )}
          </div>
        </div>
        {review.skinConcern && (
          <div className="flex flex-wrap gap-1.5">
             <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600 whitespace-nowrap">
               Goal: {review.skinConcern}
             </span>
             {review.skinType && (
               <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600 whitespace-nowrap">
                 Type: {review.skinType}
               </span>
             )}
          </div>
        )}
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        {review.comment}
      </p>

      {review.media && review.media.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.media.map((item: ReviewMedia, i: number) => (
            <div key={i} className="w-20 h-20">
              <ReviewMediaItem media={item} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer group">
          <ThumbsUp size={12} className="group-hover:scale-110 transition-transform" />
          <span>Helpful ({review.helpfulCount || 0})</span>
        </button>
      </div>
    </div>
  );
};
