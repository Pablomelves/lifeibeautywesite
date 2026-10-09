import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { CartItem } from '../types';
import { createShopifyCheckout } from '../services/shopify';
import { validateCoupon } from '../services/adminService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number, variantId?: string) => void;
  onRemoveItem: (id: number, variantId?: string) => void;
  onClearCart?: () => void;
  onOpenShopifyConnect?: () => void;
  onTrackOrder?: (orderNumber: string, email: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenShopifyConnect,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState<number>(0);
  const [activeDiscountCode, setActiveDiscountCode] = useState<string>('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = items.reduce((sum, item) => sum + item.product.numericPrice * item.quantity, 0);
  const discountAmount = fixedDiscountAmount > 0 
    ? fixedDiscountAmount 
    : rawSubtotal * appliedDiscount;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const freeShippingThreshold = 50;
  const amountNeeded = Math.max(0, freeShippingThreshold - rawSubtotal);
  const progressPercent = Math.min(100, (rawSubtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const result = validateCoupon(promoCode, rawSubtotal);
    if (result.valid) {
      setFixedDiscountAmount(result.discountAmount);
      setActiveDiscountCode(promoCode.trim().toUpperCase());
      setPromoSuccessMsg(result.message);
      setPromoError(null);
    } else {
      setPromoError(result.message);
      setPromoSuccessMsg(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const checkoutUrl = await createShopifyCheckout(items);
      if (!checkoutUrl) {
        throw new Error('Shopify did not return a checkout URL. Please try again.');
      }
      window.location.href = checkoutUrl;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to connect to Shopify Checkout. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 font-inter"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white text-slate-900 h-full flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
              LI FEI BEAUTY
            </span>
            <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900">
              YOUR SHOPPING BAG ({totalCount})
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-[#FFF5FA] p-4 border-b border-[#FFCDF2]/60 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Truck size={14} className="text-[#EC3460]" />
              {amountNeeded > 0 ? (
                <>Add <strong className="text-[#EC3460] font-mono">${amountNeeded.toFixed(2)}</strong> for Free Express</>
              ) : (
                <span className="text-[#B31940] font-bold">🎉 You qualify for Free Seoul Express!</span>
              )}
            </span>
            <span className="font-mono text-[11px] text-[#EC3460] font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-white border border-[#FFCDF2] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#EC3460] rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460]">
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-bold text-slate-900 uppercase">Your bag is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Explore our curated clinical Korean skincare serums, masks, and barrier repair creams.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-xs font-semibold uppercase tracking-wider bg-[#EC3460] text-white px-5 py-3 rounded-xl hover:bg-[#D8224F] shadow-raspberry transition-all cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const itemVariantId = item.variantId || item.product.selectedVariantId;
              const itemKey = `${item.product.id}-${itemVariantId || idx}`;

              return (
                <div key={itemKey} className="py-4 first:pt-0 flex gap-4 items-center">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/50"
                    style={{ backgroundColor: item.product.panel }}
                  >
                    <img 
                      src={item.product.src} 
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.selectedSize || item.product.volume}
                        </p>
                      </div>
                      <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                        ${(item.product.numericPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#FFCDF2] rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1, itemVariantId)}
                          className="p-1 text-slate-500 hover:text-[#EC3460] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1, itemVariantId)}
                          className="p-1 text-slate-500 hover:text-[#EC3460] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id, itemVariantId)}
                        className="text-slate-400 hover:text-[#EC3460] transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Checkout & Promo Section */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#FFCDF2]/60 bg-[#FFF5FA] flex flex-col gap-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Discount Code (e.g. GLOW15)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 bg-white border border-[#FFCDF2] rounded-xl px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#EC3460] font-mono"
              />
              <button
                type="submit"
                className="bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </form>
            {promoError && (
              <span className="text-[11px] text-[#EC3460] font-medium">{promoError}</span>
            )}
            {promoSuccessMsg && (
              <span className="text-[11px] text-emerald-700 font-bold">{promoSuccessMsg}</span>
            )}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-[#B31940] bg-[#FFF0F9] border border-[#FFCDF2] px-3 py-1.5 rounded-lg font-medium">
                <span>Code {activeDiscountCode || 'PROMO'} applied!</span>
                <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs pt-2">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-slate-800">${rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Seoul Direct Shipping</span>
                <span className="font-semibold text-emerald-700">
                  {rawSubtotal >= freeShippingThreshold ? 'Free' : '$4.99'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-200/80">
                <span>Estimated Total</span>
                <span className="font-mono text-base tabular-nums">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="bg-rose-50 border border-rose-200 text-[#B31940] text-xs p-3 rounded-xl font-medium">
                {checkoutError}
              </div>
            )}

            {/* Checkout Button */}
            {checkingOut ? (
              <button
                disabled
                className="w-full bg-[#EC3460] text-white font-semibold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-raspberry flex items-center justify-center gap-2 mt-1 opacity-90 cursor-wait"
              >
                <Loader2 size={18} className="animate-spin" />
                <span>Redirecting to Shopify Checkout...</span>
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-raspberry transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                <ShieldCheck size={18} />
                <span>BUY NOW · ${finalTotal.toFixed(2)}</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck size={12} className="text-[#EC3460]" />
              <span>256-Bit SSL Encrypted Checkout · 30-Day Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
