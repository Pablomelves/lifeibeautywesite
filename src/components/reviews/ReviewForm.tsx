import React, { useState } from 'react';
import { Star, X, Camera, Video, Loader2, Check } from 'lucide-react';

interface ReviewFormProps {
  productName: string;
  productId: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productName, productId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        onSubmit({ rating, productId });
      }, 2000);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="font-anton text-2xl uppercase text-slate-900 mb-2">Thank You for Glowing!</h3>
        <p className="text-sm text-slate-600">Your review has been submitted and is helping others find their ritual.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg font-inter">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-anton text-xl uppercase text-slate-900">Write a Review</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{productName}</p>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Star Rating */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2 text-center">
            How would you rate your glow?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="text-amber-400 p-1 transition-transform hover:scale-125 cursor-pointer"
              >
                <Star 
                  size={32} 
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                  className="transition-all"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900">Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EC3460]/20 focus:border-[#EC3460] outline-none transition-all"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EC3460]/20 focus:border-[#EC3460] outline-none transition-all"
              placeholder="Your email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900">Review Title</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EC3460]/20 focus:border-[#EC3460] outline-none transition-all"
            placeholder="Sum up your experience"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900">Review Text</label>
          <textarea 
            required
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EC3460]/20 focus:border-[#EC3460] outline-none transition-all resize-none"
            placeholder="Tell us more about the results, texture, and how you used it..."
          />
        </div>

        {/* Media Upload Mock */}
        <div className="flex gap-3">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-[#EC3460] hover:border-[#EC3460]/50 transition-all text-xs font-bold">
            <Camera size={16} />
            Add Photos
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-[#EC3460] hover:border-[#EC3460]/50 transition-all text-xs font-bold">
            <Video size={16} />
            Add Video
          </button>
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Review'
          )}
        </button>
      </form>
    </div>
  );
};
