import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Product } from '../types';

interface MyFavoritesSectionProps {
  products: Product[];
  wishlistIds: number[];
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const MyFavoritesSection: React.FC<MyFavoritesSectionProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onQuickView,
  onNavigateSection,
}) => {
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [addedAll, setAddedAll] = useState(false);

  // Filter products by wishlistIds
  const favoriteProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleAddSingle = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleAddAll = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach((prod) => {
      onAddToCart(prod);
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2400);
  };

  const totalValue = favoriteProducts.reduce((sum, p) => sum + p.numericPrice, 0);

  return (
    <section 
      id="my-favorites" 
      className="py-20 sm:py-28 bg-[#FFF9FC] font-inter border-b border-[#FFCDF2]/60 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460]">
                CURATED FOR YOUR GLOW RITUAL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
              <span className="text-[10px] bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2.5 py-0.5 rounded-full font-bold">
                {favoriteProducts.length} Saved {favoriteProducts.length === 1 ? 'Formula' : 'Formulas'}
              </span>
            </div>

            <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
              MY FAVORITES
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-3 leading-relaxed">
              Your hand-saved Korean skincare treatments, peptide serums, and cryo-sculpting tools. Add items directly to your shopping bag with 1 click for direct Seoul dispatch.
            </p>
          </div>

          {/* Action Row */}
          {favoriteProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-2xl border border-[#FFCDF2] shadow-2xs text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Value</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ${totalValue.toFixed(2)}
                </span>
              </div>

              {favoriteProducts.length > 1 && (
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="px-5 py-3 bg-[#EC3460] hover:bg-[#D8224F] text-white rounded-2xl text-xs font-semibold uppercase tracking-wider shadow-raspberry transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  {addedAll ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      <span>All Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Add All {favoriteProducts.length} to Bag</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-[#FFCDF2] text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F9] border border-[#FFCDF2] text-[#EC3460] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Heart size={28} className="fill-[#EC3460]/20 text-[#EC3460]" />
            </div>
            <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900 mb-2">
              YOUR FAVORITES LIST IS EMPTY
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
              You haven't saved any formulas yet. Tap the heart icon on any serum, ampoule, or cryo roller in our curated collection to build your personalized routine.
            </p>
            {onNavigateSection && (
              <button
                type="button"
                onClick={() => onNavigateSection('bestsellers')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md hover:scale-[1.02]"
              >
                <span>Discover Best Sellers</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {favoriteProducts.map((product) => {
              const isAdded = !!addedIds[product.id];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFCDF2]/80 hover:border-[#EC3460] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between group relative"
                >
                  {/* Image Backdrop & Thumbnail: Horizontal Scrollable Gallery */}
                  <div className="relative mb-4">
                    <div
                      className="w-full aspect-square rounded-2xl flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth group/gallery"
                      style={{ backgroundColor: product.panel }}
                    >
                      {/* Product Visuals / Slides */}
                      {(product.images && product.images.length > 0 ? product.images : [product.src]).map((img, idx) => (
                        <div 
                          key={idx} 
                          className="w-full h-full shrink-0 snap-center flex items-center justify-center relative cursor-pointer"
                          onClick={() => onQuickView(product)}
                        >
                          <img
                            src={img}
                            alt={`${product.name} view ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover/gallery:scale-[1.02]"
                          />
                        </div>
                      ))}

                      {/* Dots Indicator Overlay */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
                          {product.images.map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-slate-900/20" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Unfavorite / Remove Button (Top Right) */}
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#EC3460] shadow-md border border-[#FFCDF2] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Remove from favorites"
                      aria-label={`Remove ${product.name} from favorites`}
                    >
                      <Heart size={16} fill="#EC3460" />
                    </button>

                    {/* Badge or Category (Top Left) */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.badge ? (
                        <span className="bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                          {product.badge}
                        </span>
                      ) : (
                        <span className="bg-[#FFF0F9]/90 backdrop-blur-md text-[#B31940] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#FFCDF2]">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating & Stock */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star size={13} fill="currentColor" />
                          <span className="text-slate-900 font-bold text-xs">{product.rating}</span>
                          <span className="text-slate-400 text-[11px]">({product.reviewsCount})</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          {product.stockStatus}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => onQuickView(product)}
                        className="font-anton text-base sm:text-lg uppercase text-slate-900 tracking-tight leading-snug hover:text-[#EC3460] transition-colors cursor-pointer line-clamp-1"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Subtitle & Volume */}
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {product.subtitle} · {product.volume}
                      </p>

                      {/* Key Benefit Snippet */}
                      {product.benefits && product.benefits.length > 0 && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 leading-relaxed bg-[#FFF5FA] p-2 rounded-xl border border-[#FFCDF2]/50">
                          {product.benefits[0]}
                        </p>
                      )}
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-base font-bold text-slate-900">
                            {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="font-mono text-xs text-slate-400 line-through">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Seoul Dispatch
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Direct Add to Cart Button */}
                        <button
                          type="button"
                          onClick={(e) => handleAddSingle(e, product)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                          }`}
                          title={`Add ${product.name} to bag`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={14} strokeWidth={3} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBuyNow) {
                              onBuyNow(product);
                            } else {
                              onAddToCart(product);
                            }
                          }}
                          className="flex-1 py-2.5 px-3 bg-[#EC3460] hover:bg-[#D8224F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-raspberry flex items-center justify-center gap-1.5"
                        >
                          <Sparkles size={14} />
                          <span>Buy Now</span>
                        </button>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => onQuickView(product)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Quick View Details"
                          aria-label={`Quick View ${product.name}`}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Seoul Authenticity Guarantee Sub-banner */}
        <div className="mt-12 p-4 sm:p-5 bg-white rounded-2xl border border-[#FFCDF2]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Authentic Sealed Guarantee:</strong> Every favorite formula is dispatched in direct cryo-certified packaging with temperature indicators from Seoul HQ.
            </span>
          </div>

          {onNavigateSection && (
            <button
              type="button"
              onClick={() => onNavigateSection('bestsellers')}
              className="text-[#EC3460] hover:text-[#D8224F] font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Explore More Formulas</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
