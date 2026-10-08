import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { CartItem, Discount } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discounts: Discount[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: (appliedCode?: string, discountVal?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  discounts,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.numericPrice * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (rawSubtotal * appliedDiscount.value) / 100;
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const freeShippingThreshold = 40;
  const shippingCost = rawSubtotal >= freeShippingThreshold || (appliedDiscount?.code === 'FREESHIP') ? 0 : 5;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const found = discounts.find(
      (d) => d.code.toUpperCase() === promoCode.trim().toUpperCase() && d.active
    );
    if (found) {
      if (found.minPurchase && rawSubtotal < found.minPurchase) {
        setPromoError(`Requires minimum order of $${found.minPurchase}`);
        return;
      }
      setAppliedDiscount(found);
      setPromoCode('');
    } else {
      setPromoError('Invalid or expired discount code');
    }
  };

  const handleCompleteOrder = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      onCheckout(appliedDiscount?.code, discountAmount);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h3 className="font-bold text-stone-900 text-lg">Your Bag</h3>
            <span className="text-xs text-stone-500 font-medium">({items.length} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
          {rawSubtotal >= freeShippingThreshold ? (
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              You unlocked Free Express Shipping direct from Seoul!
            </p>
          ) : (
            <div>
              <p className="text-xs text-stone-600 mb-1.5">
                Add <span className="font-bold text-stone-900">${(freeShippingThreshold - rawSubtotal).toFixed(2)}</span> more for Free Shipping
              </p>
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (rawSubtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.product.id} className="py-4 flex gap-4 items-center">
                <div
                  className="w-18 h-18 rounded-xl p-2 flex items-center justify-center shrink-0 border border-stone-200"
                  style={{ backgroundColor: item.product.panel || '#FAF5F7' }}
                >
                  {item.product.src ? (
                    <img
                      src={item.product.src}
                      alt={item.product.name}
                      className="max-h-full w-auto object-contain"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-stone-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-sm truncate">{item.product.name}</h4>
                  <p className="text-xs text-stone-400 mb-2">{item.product.volume}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">
                      ${(item.product.numericPrice * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="px-2 py-1 hover:bg-stone-200 cursor-pointer text-stone-600"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 font-bold text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="px-2 py-1 hover:bg-stone-200 cursor-pointer text-stone-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
              <ShoppingBag className="w-12 h-12 mb-3 text-stone-300 stroke-[1.5]" />
              <p className="font-semibold text-stone-600 text-sm">Your shopping bag is empty</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Explore our curated cellular serums and discover authentic Seoul glass skin formulas.
              </p>
            </div>
          )}
        </div>

        {/* Footer with discount and checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50/50 space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code (e.g. GLOW15)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 uppercase font-semibold bg-white focus:outline-none focus:border-stone-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
            {promoError && <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>}
            {appliedDiscount && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <span>Code {appliedDiscount.code} applied</span>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  className="text-stone-400 hover:text-stone-700 font-bold ml-2 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">${rawSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Courier Dispatch</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCompleteOrder}
              disabled={isCheckingOut}
              className="w-full py-3.5 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCheckingOut ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Checkout Now · ${finalTotal.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
