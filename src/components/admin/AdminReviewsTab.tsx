import React, { useState } from 'react';
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  Filter, 
  ShieldCheck, 
  Clock,
  Heart
} from 'lucide-react';
import { ReviewModeration } from '../../types';

interface AdminReviewsTabProps {
  reviews: ReviewModeration[];
  onUpdateStatus: (reviewId: number, status: 'approved' | 'rejected') => void;
  onToggleFeatured: (reviewId: number) => void;
  onDeleteReview: (reviewId: number) => void;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({
  reviews,
  onUpdateStatus,
  onToggleFeatured,
  onDeleteReview,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved';
    if (filter === 'featured') return r.featured;
    return true;
  });

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Customer Reviews &amp; Social Proof Moderation
          </h2>
          <p className="text-xs text-slate-500">
            Audit customer feedback, approve authentic verified purchases, and feature glowing testimonials.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <Clock size={14} className="animate-spin-slow" />
            <span>{pendingCount} Reviews Pending Verification</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          Pending Moderation ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          Approved Live
        </button>
        <button
          onClick={() => setFilter('featured')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'featured'
              ? 'bg-[#EC3460] text-white shadow-raspberry'
              : 'bg-rose-50 text-[#EC3460] border border-rose-200 hover:bg-rose-100'
          }`}
        >
          ★ Featured on Homepage
        </button>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-slate-400 text-xs">No reviews matching this status filter.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Product tag, Status pill, and Star rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                      {rev.productName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        rev.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rev.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {rev.status}
                      </span>

                      {rev.featured && (
                        <span className="text-[10px] font-bold bg-[#FFF0F9] text-[#EC3460] px-2 py-0.5 rounded-full border border-[#FFCDF2]">
                          Featured ★
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stars & Title */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? '' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{rev.rating}.0</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {rev.comment}
                  </p>
                </div>

                {/* Author Info & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{rev.author}</span>
                    {rev.verified && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
                        <ShieldCheck size={12} /> Verified Buyer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Feature button */}
                    <button
                      onClick={() => onToggleFeatured(rev.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        rev.featured
                          ? 'bg-[#FFF0F9] text-[#EC3460] border-[#FFCDF2]'
                          : 'text-slate-400 border-slate-200 hover:text-[#EC3460]'
                      }`}
                      title={rev.featured ? 'Remove from Featured' : 'Feature on Storefront'}
                    >
                      <Sparkles size={14} />
                    </button>

                    {/* Approve / Reject buttons */}
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => onUpdateStatus(rev.id, 'approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Approve
                      </button>
                    )}

                    {rev.status !== 'rejected' && rev.status !== 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(rev.id, 'rejected')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Hide
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteReview(rev.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
