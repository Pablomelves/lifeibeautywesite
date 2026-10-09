import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 15 }: StarRatingProps) {
  const boundedRating = Math.max(0, Math.min(5, rating));

  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${boundedRating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fillPercentage = Math.max(0, Math.min(1, boundedRating - index)) * 100;

        return (
          <span key={index} className="relative inline-flex" aria-hidden="true">
            <Star size={size} className="text-slate-200" fill="currentColor" />
            <Star
              size={size}
              className="absolute inset-0 text-amber-400"
              fill="currentColor"
              style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
            />
          </span>
        );
      })}
    </span>
  );
}
