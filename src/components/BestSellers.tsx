import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Sparkles, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { STORE_PRODUCTS } from '../data/storeData';

interface BestSellersProps {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  products?: Product[];
  isShopifyConnected?: boolean;
  onOpenShopifyConnect?: () => void;
  wishlistIds?: number[];
  onToggleWishlist?: (productId: number) => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({
  onQuickView,
  onAddToCart,
  onBuyNow,
  selectedCategory,
  onSelectCategory,
  products,
  isShopifyConnected,
  onOpenShopifyConnect,
  wishlistIds = [],
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'serums' | 'masks' | 'moisturizers'>('all');
  const [addedId, setAddedId] = useState<number | null>(null);

  const currentProducts = products && products.length > 0 ? products : STORE_PRODUCTS;

  const filteredProducts = currentProducts.filter((product) => {
    // If selectedCategory from menu/category grid is active and not 'all'
    if (selectedCategory && selectedCategory !== 'all') {
      const catLower = (product.category || '').toLowerCase();
      const targetLower = selectedCategory.toLowerCase();
      if (!catLower.includes(targetLower) && !targetLower.includes(catLower)) {
        return false;
      }
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'serums') return product.category === 'Serums';
    if (activeTab === 'masks') return product.category === 'Masks' || product.category === 'Cleansers';
    if (activeTab === 'moisturizers') return product.category === 'Moisturizers';
    return true;
  });

  const handleTabChange = (tab: 'all' | 'serums' | 'masks' | 'moisturizers') => {
    setActiveTab(tab);
    if (selectedCategory && selectedCategory !== 'all') {
      onSelectCategory('all');
    }
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section id="bestsellers" className="py-20 sm:py-28 bg-[#FFF5FA] font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460]">
                SEOUL CURATED RITUALS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
              {isShopifyConnected ? (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Shopify Live Products ({currentProducts.length})
                </span>
              ) : onOpenShopifyConnect ? (
                <button
                  onClick={onOpenShopifyConnect}
                  className="text-[10px] bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2 py-0.5 rounded-full font-bold hover:bg-[#FFE6F6] cursor-pointer"
                >
                  Connect Shopify Storefront API
                </button>
              ) : null}
            </div>
            <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
              FEATURED & BEST SELLERS
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mt-3 leading-relaxed">
              Clinical-grade Korean beauty favorites rigorously tested for real cellular rejuvenation, pore refinement, and lasting glass luminosity.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/80 border border-[#FFCDF2] rounded-2xl overflow-x-auto shadow-xs">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#EC3460] text-white shadow-raspberry'
                  : 'text-slate-600 hover:text-[#EC3460]'
              }`}
            >
              All Best Sellers
            </button>
            <button
              onClick={() => handleTabChange('serums')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'serums'
                  ? 'bg-[#EC3460] text-white shadow-raspberry'
                  : 'text-slate-600 hover:text-[#EC3460]'
              }`}
            >
              Glass Serums
            </button>
            <button
              onClick={() => handleTabChange('masks')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'masks'
                  ? 'bg-[#EC3460] text-white shadow-raspberry'
                  : 'text-slate-600 hover:text-[#EC3460]'
              }`}
            >
              Masks & Prep
            </button>
            <button
              onClick={() => handleTabChange('moisturizers')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'moisturizers'
                  ? 'bg-[#EC3460] text-white shadow-raspberry'
                  : 'text-slate-600 hover:text-[#EC3460]'
              }`}
            >
              Barrier Creams
            </button>
          </div>
        </div>

        {/* Selected Category Filter Pill if set from header or category grid */}
        {selectedCategory && selectedCategory !== 'all' && (
          <div className="mb-8 flex items-center gap-2">
            <span className="text-xs text-slate-500">Filtered by:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-3 py-1 rounded-full">
              <span>{selectedCategory}</span>
              <button
                onClick={() => onSelectCategory('all')}
                className="hover:text-black cursor-pointer font-sans text-sm ml-1"
                aria-label="Clear category filter"
              >
                ✕
              </button>
            </span>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[#FFCDF2]/60 p-8 shadow-xs">
              <p className="text-slate-600 text-sm font-medium">No formulas currently found matching this filter.</p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  onSelectCategory('all');
                }}
                className="mt-4 px-5 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-raspberry"
              >
                View All Formulas
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => {
            const isAdded = addedId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => onQuickView(product)}
                className="group bg-white rounded-3xl overflow-hidden border border-[#FFCDF2]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:border-[#EC3460]/40"
              >
                {/* Image Stage: Horizontal Scrollable Gallery */}
                <div 
                  id={`gallery-${product.id}`}
                  className="relative w-full aspect-4/3 sm:aspect-square flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth group/gallery"
                  style={{ backgroundColor: product.panel }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    (el as any)._isHovered = true;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    (el as any)._isHovered = false;
                  }}
                >
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-4 left-4 z-20 bg-[#EC3460] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs pointer-events-none">
                      {product.badge}
                    </span>
                  )}

                  {/* Action Buttons: Wishlist & Quick View */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    {onToggleWishlist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                          wishlistIds.includes(product.id)
                            ? 'bg-white text-[#EC3460] shadow-raspberry opacity-100'
                            : 'bg-white/95 text-slate-400 hover:text-[#EC3460] hover:bg-white sm:opacity-0 sm:group-hover:opacity-100'
                        }`}
                        title={wishlistIds.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        aria-label={wishlistIds.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          size={15}
                          fill={wishlistIds.includes(product.id) ? '#EC3460' : 'none'}
                          className={wishlistIds.includes(product.id) ? 'text-[#EC3460]' : ''}
                        />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="w-9 h-9 rounded-full bg-white/95 text-slate-700 hover:text-[#EC3460] hover:bg-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Quick View"
                      aria-label="Quick View"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Product Visuals / Slides */}
                  {(product.images && product.images.length > 0 ? product.images : [product.src]).map((img, idx) => (
                    <div 
                      key={idx} 
                      className="w-full h-full shrink-0 snap-center flex items-center justify-center relative"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`${product.name} view ${idx + 1}`}
                          className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500 ease-out drop-shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Sparkles size={24} className="text-slate-200" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Dots Indicator Overlay */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
                      {product.images.map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto-cycle logic script for this card */}
                {product.images && product.images.length > 1 && (
                  <script dangerouslySetInnerHTML={{ __html: `
                    (function() {
                      const el = document.getElementById('gallery-${product.id}');
                      if (!el) return;
                      let index = 0;
                      const count = ${product.images.length};
                      
                      const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                          if (entry.isIntersecting) {
                            el._interval = setInterval(() => {
                              if (el._isHovered) return;
                              index = (index + 1) % count;
                              el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
                            }, 3500);
                          } else {
                            clearInterval(el._interval);
                          }
                        });
                      }, { threshold: 0.5 });
                      observer.observe(el);
                    })();
                  `}} />
                )}

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Stars & Reviews */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center text-amber-400">
                        <Star size={13} fill="currentColor" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {product.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({product.reviewsCount})
                      </span>
                      <span className="text-slate-300 mx-1">·</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {product.volume}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-950 text-base leading-snug group-hover:text-[#EC3460] transition-colors uppercase">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {product.subtitle}
                    </p>

                    {/* Key Actives Chips */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.keyIngredients.slice(0, 2).map((ing, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#FFF0F9] text-[#B31940] px-2 py-0.5 rounded-md font-medium border border-[#FFCDF2]/50"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action Row: Add to Cart (Left) and Buy Now (Right) */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-mono text-lg font-bold text-slate-950 tabular-nums">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through tabular-nums font-mono">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleAdd(e, product)}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Add to your cart"
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>In Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            <span>Add To Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onBuyNow) {
                            onBuyNow(product);
                          } else {
                            onAddToCart(product);
                          }
                        }}
                        className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 bg-[#EC3460] hover:bg-[#D8224F] text-white shadow-raspberry border border-transparent"
                        title="Buy now and checkout"
                      >
                        <Sparkles size={14} />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </section>
  );
};
