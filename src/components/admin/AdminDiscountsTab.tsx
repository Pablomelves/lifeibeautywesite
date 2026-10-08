import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Check, 
  X, 
  Percent, 
  DollarSign, 
  Calendar, 
  Copy, 
  AlertCircle 
} from 'lucide-react';
import { Discount } from '../../types';

interface AdminDiscountsTabProps {
  discounts: Discount[];
  onAddDiscount: (discount: Omit<Discount, 'id' | 'usageCount'>) => void;
  onUpdateDiscount: (id: string, updates: Partial<Discount>) => void;
  onDeleteDiscount: (id: string) => void;
}

export const AdminDiscountsTab: React.FC<AdminDiscountsTabProps> = ({
  discounts,
  onAddDiscount,
  onUpdateDiscount,
  onDeleteDiscount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(15);
  const [minPurchase, setMinPurchase] = useState(40);
  const [usageLimit, setUsageLimit] = useState(500);
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const handleCopy = (couponCode: string) => {
    navigator.clipboard?.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    onAddDiscount({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value) || 10,
      minPurchase: Number(minPurchase) || 0,
      usageLimit: Number(usageLimit) || undefined,
      active: true,
      expiresAt: expiresAt || undefined,
      description: description.trim() || `${type === 'percentage' ? `${value}% off` : `$${value} off`} on orders over $${minPurchase}`,
    });

    setIsModalOpen(false);
    setCode('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Promotional Coupons &amp; Discount Engine
          </h2>
          <p className="text-xs text-slate-500">
            Create percentage or fixed cash discounts, set minimum cart rules, and manage promo codes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((disc) => {
          const isExpired = disc.expiresAt && new Date(disc.expiresAt) < new Date();
          const isCopied = copiedCode === disc.code;

          return (
            <div
              key={disc.id}
              className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                disc.active && !isExpired
                  ? 'bg-white border-slate-200/80 shadow-xs hover:border-[#FFCDF2]'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                {/* Top Badge & Delete */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    disc.type === 'percentage'
                      ? 'bg-rose-50 text-[#EC3460] border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value}.00 OFF`}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateDiscount(disc.id, { active: !disc.active })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        disc.active
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-slate-500 bg-slate-200'
                      }`}
                    >
                      {disc.active ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => onDeleteDiscount(disc.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Code Pill */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-3">
                  <span className="font-mono text-base font-anton tracking-wider text-slate-900">
                    {disc.code}
                  </span>
                  <button
                    onClick={() => handleCopy(disc.code)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#EC3460] transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-3">
                  {disc.description || `Save ${disc.type === 'percentage' ? `${disc.value}%` : `$${disc.value}`} on eligible orders.`}
                </p>
              </div>

              {/* Rules and Usage Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Min. Order Value:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {disc.minPurchase === 0 ? 'No minimum' : `$${disc.minPurchase.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Count:</span>
                  <span className="font-mono text-slate-800">
                    {disc.usageCount} {disc.usageLimit ? `/ ${disc.usageLimit}` : 'times'}
                  </span>
                </div>
                {disc.expiresAt && (
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Valid Until:</span>
                    <span>{disc.expiresAt}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* Create Coupon Modal */}
      {/* ================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <h3 className="font-anton text-xl uppercase tracking-wide text-slate-950">
                Create Promotional Code
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SEOUL25 / SPRINGGLOW"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono font-bold text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-semibold cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Value {type === 'percentage' ? '(%)' : '($)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    placeholder={type === 'percentage' ? '15' : '10'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Min Order Spend ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    placeholder="40.00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    placeholder="500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Storefront Note
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15% VIP autumn barrier hydration discount on orders over $40"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EC3460] hover:bg-[#D8224F] text-white rounded-xl font-bold uppercase tracking-wider shadow-raspberry cursor-pointer"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
