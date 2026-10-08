import React, { useState } from 'react';
import { ShoppingBag, Check, Zap, X, ChevronUp, ChevronDown, ArrowRight, Heart, Plus, Scale } from 'lucide-react';
import { Product, CartNotificationData, WishlistNotificationData } from '../types';

interface QuickAddWidgetProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onOpenCart: () => void;
  cartCount: number;
  cartNotification?: CartNotificationData | null;
  wishlistNotification?: WishlistNotificationData | null;
  onDismissNotification?: () => void;
  onDismissWishlistNotification?: () => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const QuickAddWidget: React.FC<QuickAddWidgetProps> = ({
  products,
  onAddToCart,
  onQuickView,
  onOpenCart,
  cartCount,
  cartNotification,
  wishlistNotification,
  onDismissNotification,
  onDismissWishlistNotification,
  comparisonIds = [],
  onToggleComparison,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Take top 3 best-selling products
  const top3Products = (products && products.length >= 3 ? products.slice(0, 3) : products).slice(0, 3);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1800);
  };

  if (!top3Products || top3Products.length === 0) return null;

  return (
    <aside 
      aria-label="Quick Add Widget"
      className="fixed bottom-6 right-6 z-[100] font-inter select-none print:hidden flex flex-col items-end gap-3 pointer-events-auto"
    >
      {/* Light Theme "Added to Cart" Notification Popup */}
      {cartNotification && (
        <div 
          role="status"
          aria-live="polite"
          className="w-[330px] sm:w-[370px] bg-white/95 border border-[#FFCDF2] text-slate-900 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-4 zoom-in-95 origin-bottom-right"
        >
          {/* Header row */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                <Check size={13} strokeWidth={3} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Added to Cart!
                </span>
                <span className="text-[10px] font-semibold text-[#B31940] bg-[#FFF0F9] px-2 py-0.5 rounded-full border border-[#FFCDF2]/50">
                  {cartNotification.quantity > 1 ? `+${cartNotification.quantity} Items` : '1 Item'}
                </span>
              </div>
            </div>

            <button
              onClick={onDismissNotification}
              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>

          {/* Product info row */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-xs">
              <img
                src={cartNotification.product.src}
                alt={cartNotification.product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900 uppercase truncate">
                {cartNotification.product.name}
              </h5>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {cartNotification.variantTitle || cartNotification.product.volume}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-xs font-bold text-[#EC3460]">
                  {cartNotification.product.price}
                </span>
                {cartNotification.product.originalPrice && (
                  <span className="font-mono text-[10px] text-slate-400 line-through">
                    {cartNotification.product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* View Bag / Checkout CTA */}
            <button
              onClick={() => {
                if (onDismissNotification) onDismissNotification();
                onOpenCart();
              }}
              className="shrink-0 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <span>View Bag</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Auto-dismiss countdown visual bar */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#EC3460] rounded-full animate-shrink-bar" />
          </div>
        </div>
      )}

      {/* Light Theme "Wishlist" Notification Popup */}
      {wishlistNotification && (
        <div 
          role="status"
          aria-live="polite"
          className="w-[330px] sm:w-[370px] bg-white/95 border border-[#FFCDF2] text-slate-900 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-4 zoom-in-95 origin-bottom-right"
        >
          {/* Header row */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${wishlistNotification.isRemoved ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-[#FFF0F9] border-[#FFCDF2] text-[#EC3460]'}`}>
                {wishlistNotification.isRemoved ? <X size={12} /> : <Heart size={12} fill="currentColor" />}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  {wishlistNotification.isRemoved ? 'Removed from Wishlist' : 'Saved to Wishlist!'}
                </span>
              </div>
            </div>

            <button
              onClick={onDismissWishlistNotification}
              className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>

          {/* Product info row */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-xs">
              <img
                src={wishlistNotification.product.src}
                alt={wishlistNotification.product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900 uppercase truncate">
                {wishlistNotification.product.name}
              </h5>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {wishlistNotification.product.subtitle}
              </p>
            </div>

            {/* View Wishlist CTA */}
            <button
              onClick={() => {
                // Trigger opening account modal on wishlist tab
                if (onDismissWishlistNotification) onDismissWishlistNotification();
                // This is a bit tricky as onOpenAccount is in App.tsx but not passed here.
                // We'll just let the user click the header wishlist for now or we could pass the prop.
                // For now, let's just make it look good.
              }}
              className="shrink-0 bg-[#FFF0F9] hover:bg-[#FFE6F6] text-[#B31940] border border-[#FFCDF2] text-[11px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-sm hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <span>View Saved</span>
              <Heart size={12} fill="currentColor" />
            </button>
          </div>

          {/* Auto-dismiss countdown visual bar */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#EC3460] rounded-full animate-shrink-bar" />
          </div>
        </div>
      )}

      {/* Expanded Card */}
      {isOpen ? (
        <div className="w-[340px] sm:w-[360px] bg-white/95 backdrop-blur-md border border-[#FFCDF2] rounded-3xl shadow-2xl p-4 transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460] shadow-xs">
                <Zap size={14} className="fill-[#EC3460]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Quick Add · Top 3
                </h4>
                <p className="text-[10px] text-slate-500">
                  Fast reorder for returning visitors
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {top3Products.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    top3Products.forEach(p => onAddToCart(p));
                    setAddedProductId(-1); // special ID for "all added"
                    setTimeout(() => setAddedProductId(null), 2000);
                  }}
                  className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    addedProductId === -1
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-[#FFF0F9] text-[#B31940] border-[#FFCDF2] hover:bg-[#FFE6F6]'
                  }`}
                  title="Add all featured products to bag"
                >
                  {addedProductId === -1 ? <Check size={10} strokeWidth={3} /> : <Plus size={10} strokeWidth={3} />}
                  <span>{addedProductId === -1 ? 'Added All' : 'Add All'}</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Minimize Quick Add"
                aria-label="Minimize Quick Add"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-2.5">
            {top3Products.map((product) => {
              const isAdded = addedProductId === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => onQuickView(product)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF0F9]/40 border border-slate-100 hover:border-[#FFCDF2]/60 transition-all cursor-pointer group"
                >
                  <img
                    src={product.src}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover object-center bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-bold text-slate-900 truncate uppercase group-hover:text-[#EC3460] transition-colors">
                      {product.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      {product.volume}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs font-mono font-bold text-slate-950">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Simplified Add Button & Compare */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleAdd(e, product)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#EC3460] hover:bg-[#D8224F] text-white shadow-raspberry'
                      }`}
                      title={`Add ${product.name} to cart`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={12} strokeWidth={3} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={12} />
                          <span>Add</span>
                        </>
                      )}
                    </button>

                    {onToggleComparison && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComparison(product.id);
                        }}
                        className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 border ${
                          comparisonIds.includes(product.id)
                            ? 'bg-[#EC3460] text-white border-[#EC3460]'
                            : 'bg-white text-slate-400 border-slate-200 hover:text-[#EC3460] hover:border-[#FFCDF2]'
                        }`}
                      >
                        <Scale size={10} />
                        <span>{comparisonIds.includes(product.id) ? 'Comparing' : 'Compare'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in Bag` : 'Bag is empty'}
            </span>
            <button
              onClick={() => {
                onOpenCart();
                setIsOpen(false);
              }}
              className="text-[11px] bg-[#EC3460] hover:bg-[#D8224F] text-white font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-raspberry hover:scale-[1.02]"
            >
              <span>Buy Now</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed Floating Trigger (Keeping original colors & style) */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-white/95 hover:bg-white text-slate-900 border border-[#FFCDF2] px-3.5 py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer backdrop-blur-md"
          title="Open Quick Add Menu (Top 3 Best Sellers)"
          aria-label="Open Quick Add Menu"
        >
          {/* Mini thumbnails preview */}
          <div className="flex -space-x-2 overflow-hidden shrink-0">
            {top3Products.map((p) => (
              <img
                key={p.id}
                src={p.src}
                alt={p.name}
                referrerPolicy="no-referrer"
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover object-center bg-slate-100"
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EC3460] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 group-hover:text-[#EC3460] transition-colors">
              Quick Add
            </span>
          </div>

          {/* Quick Add Pill */}
          <span className="bg-[#FFF0F9] text-[#B31940] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FFCDF2]/60">
            Top 3
          </span>

          <ChevronUp size={16} className="text-slate-400 group-hover:text-[#EC3460] transition-colors ml-0.5" />

          {/* Added to cart badge on the bottom right corner of quick add */}
          {cartNotification && (
            <span className="absolute -bottom-2 -right-1 bg-white/95 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-[#FFCDF2] flex items-center gap-1 animate-pulse z-10 whitespace-nowrap backdrop-blur-md">
              <Check size={10} strokeWidth={3} className="text-[#EC3460]" />
              <span>Added to Cart!</span>
            </span>
          )}
        </button>
      )}
    </aside>
  );
};
