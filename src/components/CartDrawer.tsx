import React, { useState, useRef } from 'react';
import { ResponsiveProductImage } from './ResponsiveProductImage';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Check, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { CartItem } from '../types';
import { createShopifyCheckout, getShopifyConfig, validateShopifyDiscount } from '../services/shopify';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { trackShoppingEvent } from '../services/analytics';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number, variantId?: string) => void;
  onRemoveItem: (id: number, variantId?: string) => void;
  onClearCart?: () => void;
  onOpenShopifyConnect?: () => void;
  onTrackOrder?: (orderNumber: string, email: string) => void;
  isLoading?: boolean;
  persistenceError?: string | null;
  onRetryPersistence?: () => void;
  onBeforeCheckout?: () => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenShopifyConnect,
  onTrackOrder,
  isLoading = false,
  persistenceError,
  onRetryPersistence,
  onBeforeCheckout,
}) => {
  const modal = useModalAccessibility(isOpen, onClose);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState<number>(0);
  const [activeDiscountCode, setActiveDiscountCode] = useState<string>('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const checkoutPending = useRef(false);
  const promoPending = useRef(false);
  const [checkingPromo, setCheckingPromo] = useState(false);

  if (!isOpen) return null;

  const shopifyConfig = getShopifyConfig();

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = items.reduce((sum, item) => sum + item.product.numericPrice * item.quantity, 0);
  const discountAmount = fixedDiscountAmount > 0 
    ? fixedDiscountAmount 
    : rawSubtotal * appliedDiscount;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || promoPending.current) return;
    promoPending.current = true;
    setCheckingPromo(true);
    setPromoError(null);
    try {
      await validateShopifyDiscount(items, promoCode.trim());
      setActiveDiscountCode(promoCode.trim());
      setPromoSuccessMsg('Shopify accepted this code. Its final discount is confirmed at checkout.');
      setPromoError(null);
    } catch (error) {
      setActiveDiscountCode('');
      setPromoError(error instanceof Error ? error.message : 'Unable to check this discount code. Please try again.');
      setPromoSuccessMsg(null);
    } finally { promoPending.current = false; setCheckingPromo(false); }
  };

  const handleCheckout = async () => {
    if (checkoutPending.current || isLoading) return;
    checkoutPending.current = true;
    setCheckingOut(true);
    setCheckoutError(null);

    // If Shopify is connected, initiate real Shopify Checkout
    if (shopifyConfig.isConnected) {
      try {
        await onBeforeCheckout?.();
        const checkoutUrl = await createShopifyCheckout(items, activeDiscountCode || undefined);
        if (checkoutUrl) {
          trackShoppingEvent('begin_checkout', items);
          window.location.href = checkoutUrl;
          return;
        } else {
          setCheckoutError('Could not reach Shopify Checkout. Please verify your Storefront API credentials.');
          setCheckingOut(false);
          checkoutPending.current = false;
          return;
        }
      } catch (err) {
        trackShoppingEvent('shopping_error');
        setCheckoutError(err instanceof Error ? err.message : 'Network error connecting to Shopify Checkout.');
        setCheckingOut(false);
        checkoutPending.current = false;
        return;
      }
    }

    setCheckingOut(false);
    checkoutPending.current = false;
    setCheckoutError('Shopify checkout is unavailable. Your shopping bag has not been cleared.');
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 font-inter"
      onClick={onClose}
    >
      <div 
        ref={modal}
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

        <div className="bg-[#FFF5FA] p-4 border-b border-[#FFCDF2]/60 text-xs text-slate-700 flex items-center gap-2">
          <Truck size={14} className="text-[#EC3460] shrink-0" />
          Shipping is calculated at checkout after you enter your delivery details.
        </div>

        {/* Cart Item List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 divide-y divide-slate-100">
          {persistenceError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-[#B31940]"><p>{persistenceError}</p><button type="button" onClick={onRetryPersistence} className="mt-2 underline cursor-pointer">Retry saving bag</button></div>}
          {isLoading ? <p role="status" className="py-8 text-center text-xs text-slate-600">Loading your saved shopping bag…</p> : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460]">
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-bold text-slate-900 uppercase">{persistenceError ? 'Your saved bag is unavailable' : 'Your bag is empty'}</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Explore the current Li Fei Beauty catalog and product descriptions.
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
                    <ResponsiveProductImage 
                      src={item.product.src} 
                      alt={item.product.name}
                      className="w-full h-full object-contain object-center"
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
                        {item.product.availableForSale === false && <p className="text-[11px] text-[#B31940] font-semibold">Sold out — remove this item before checkout.</p>}
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
                          disabled={item.product.availableForSale === false || item.quantity >= 999}
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
                placeholder="Discount code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 min-w-0 bg-white border border-[#FFCDF2] rounded-xl px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#EC3460] font-mono"
              />
              <button
                type="submit"
                disabled={checkingPromo}
                className="bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {checkingPromo ? 'Checking…' : 'Apply'}
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
              <div className="flex items-center justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-200/80">
                <span>Item Total</span>
                <span className="font-mono text-base tabular-nums">${finalTotal.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-slate-500">Shipping and taxes are calculated at checkout after you enter your delivery details.</p>
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
                <span>Redirecting to Checkout...</span>
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isLoading || items.some(item => item.product.availableForSale === false)}
                className="w-full bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-raspberry transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                <ShieldCheck size={18} />
                <span>BUY NOW · ${finalTotal.toFixed(2)}</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck size={12} className="text-[#EC3460]" />
              <span>Final payment options and totals are shown in Shopify checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
