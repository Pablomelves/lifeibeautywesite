import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit2, CheckCircle, Percent, DollarSign } from 'lucide-react';
import { Discount } from '../../types';

interface AdminDiscountsTabProps {
  discounts: Discount[];
  onSaveDiscounts: (discounts: Discount[]) => void;
}

export const AdminDiscountsTab: React.FC<AdminDiscountsTabProps> = ({
  discounts,
  onSaveDiscounts
}) => {
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNew = () => {
    setEditingDiscount({
      id: `DISC-${Date.now().toString().slice(-4)}`,
      code: '',
      type: 'percentage',
      value: 15,
      minPurchase: 40,
      usageCount: 0,
      usageLimit: 500,
      active: true,
      expiresAt: '2026-12-31',
      description: 'Promotional discount campaign'
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: string) => {
    const updated = discounts.map((d) => (d.id === id ? { ...d, active: !d.active } : d));
    onSaveDiscounts(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this discount code?')) {
      const updated = discounts.filter((d) => d.id !== id);
      onSaveDiscounts(updated);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscount || !editingDiscount.code) return;

    const formatted: Discount = {
      ...editingDiscount,
      code: editingDiscount.code.trim().toUpperCase()
    };

    const idx = discounts.findIndex((d) => d.id === formatted.id);
    if (idx !== -1) {
      const updated = [...discounts];
      updated[idx] = formatted;
      onSaveDiscounts(updated);
    } else {
      onSaveDiscounts([formatted, ...discounts]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Discounts & Coupon Codes</h2>
          <p className="text-xs text-stone-500">
            Create promotional voucher codes, minimum purchase requirements, and flash sale discounts
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Discount Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {discounts.map((disc) => (
          <div
            key={disc.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              disc.active
                ? 'bg-white border-stone-200 shadow-2xs'
                : 'bg-stone-50 border-stone-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-base text-stone-900 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
                  {disc.code}
                </span>
                <button
                  onClick={() => handleToggleActive(disc.id)}
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full cursor-pointer ${
                    disc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {disc.active ? 'Active' : 'Paused'}
                </button>
              </div>

              <div className="text-2xl font-extrabold text-stone-900 mb-1">
                {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`}
              </div>
              <p className="text-xs text-stone-500 mb-4">{disc.description}</p>

              <div className="space-y-1 text-[11px] text-stone-500 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span>Minimum Order:</span>
                  <span className="font-semibold text-stone-700">
                    {disc.minPurchase ? `$${disc.minPurchase}` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Redemptions:</span>
                  <span className="font-semibold text-stone-700">{disc.usageCount} times</span>
                </div>
                {disc.expiresAt && (
                  <div className="flex justify-between">
                    <span>Expiration Date:</span>
                    <span className="font-semibold text-stone-700">{disc.expiresAt}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingDiscount(disc);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                title="Edit discount"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(disc.id)}
                className="p-1.5 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Delete discount"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingDiscount && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">
                {editingDiscount.code ? 'Edit Discount' : 'Create Voucher Code'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEOUL25"
                  value={editingDiscount.code}
                  onChange={(e) => setEditingDiscount({ ...editingDiscount, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={editingDiscount.type}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={editingDiscount.value}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min Order Amount ($)</label>
                  <input
                    type="number"
                    value={editingDiscount.minPurchase || 0}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, minPurchase: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={editingDiscount.expiresAt || ''}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description / Customer Note</label>
                <input
                  type="text"
                  value={editingDiscount.description || ''}
                  onChange={(e) => setEditingDiscount({ ...editingDiscount, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
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
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
