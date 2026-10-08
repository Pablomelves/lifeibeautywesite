import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Edit2, Plus, Sparkles, Filter, Check, Eye } from 'lucide-react';
import { ReviewModeration, Product } from '../../types';

interface AdminReviewsTabProps {
  reviews: ReviewModeration[];
  products: Product[];
  onSaveReviews: (reviews: ReviewModeration[]) => void;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({
  reviews,
  products,
  onSaveReviews
}) => {
  const [filterProduct, setFilterProduct] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [editingReview, setEditingReview] = useState<ReviewModeration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = reviews.filter((r) => {
    if (filterProduct !== 'all' && Number(r.productId) !== Number(filterProduct)) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = (id: number | string, status: 'approved' | 'pending' | 'rejected') => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    onSaveReviews(updated);
  };

  const handleDelete = (id: number | string) => {
    if (confirm('Permanently delete this customer review?')) {
      const updated = reviews.filter((r) => r.id !== id);
      onSaveReviews(updated);
    }
  };

  const handleOpenNew = () => {
    const defaultProduct = products[0];
    setEditingReview({
      id: Date.now(),
      productId: defaultProduct ? defaultProduct.id : 1,
      productName: defaultProduct ? defaultProduct.name : 'MEDICUBE PDRN PINK',
      author: '',
      email: '',
      rating: 5,
      title: '',
      comment: '',
      date: 'Just now',
      status: 'approved',
      verified: true,
      featured: false,
      skinConcern: 'Dehydration',
      photos: []
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const matchedProd = products.find((p) => p.id === Number(editingReview.productId));
    const toSave: ReviewModeration = {
      ...editingReview,
      productName: matchedProd ? matchedProd.name : editingReview.productName
    };

    const idx = reviews.findIndex((r) => r.id === toSave.id);
    if (idx !== -1) {
      const updated = [...reviews];
      updated[idx] = toSave;
      onSaveReviews(updated);
    } else {
      onSaveReviews([toSave, ...reviews]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Customer Reviews & Moderation</h2>
          <p className="text-xs text-stone-500">
            Audit, approve, edit customer feedback, and upload verified photo/video proof per product
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Review Manually
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-500">Product:</span>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none"
          >
            <option value="all">All Products ({reviews.length})</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <span className="ml-auto text-stone-400 font-medium">
          Showing {filtered.length} reviews
        </span>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Author & Rating</th>
                <th className="py-3 px-4">Associated Product</th>
                <th className="py-3 px-4">Headline & Content</th>
                <th className="py-3 px-4">Photos</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((rev) => (
                <tr key={rev.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{rev.author}</div>
                    <div className="flex text-amber-400 my-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400">{rev.date}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-rose-700">
                    {rev.productName || `Product #${rev.productId}`}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-stone-900 line-clamp-1">{rev.title}</div>
                    <div className="text-stone-500 text-[11px] line-clamp-2">{rev.comment}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {rev.photos && rev.photos.length > 0 ? (
                      <div className="flex gap-1">
                        {rev.photos.map((p, i) => (
                          <div key={i} className="w-8 h-8 rounded-md overflow-hidden border border-stone-200">
                            <img src={p} alt="Review thumb" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px]">No media</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(rev.id, 'approved')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Approve review"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(rev.id, 'rejected')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Reject review"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingReview(rev);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit review"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Edit / Add Modal */}
      {isModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">
                {editingReview.title ? 'Edit Review' : 'Create Customer Review'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Target Product</label>
                <select
                  value={editingReview.productId}
                  onChange={(e) => setEditingReview({ ...editingReview, productId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Author</label>
                  <input
                    type="text"
                    required
                    value={editingReview.author}
                    onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Star Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={editingReview.title}
                  onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Content</label>
                <textarea
                  rows={3}
                  required
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Attached Photo URL</label>
                <input
                  type="text"
                  value={(editingReview.photos && editingReview.photos[0]) || ''}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      photos: e.target.value.trim() ? [e.target.value.trim()] : []
                    })
                  }
                  placeholder="/products/medicube-pink.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Approval Status</label>
                  <select
                    value={editingReview.status}
                    onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Verified Purchase</label>
                  <select
                    value={editingReview.verified ? 'yes' : 'no'}
                    onChange={(e) => setEditingReview({ ...editingReview, verified: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  >
                    <option value="yes">Verified Customer</option>
                    <option value="no">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
