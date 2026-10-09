import React, { useState, useEffect, useRef } from 'react';
import { Star, ShoppingBag, Eye, Sparkles, Check, Heart, Scale } from 'lucide-react';
import { Product } from '../types';

interface BestSellersProps {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  products?: Product[];
  isLoading?: boolean;
  errorMessage?: string | null;
  isShopifyConnected?: boolean;
  onOpenShopifyConnect?: () => void;
  wishlistIds?: number[];
  onToggleWishlist?: (productId: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

const ProductCard: React.FC<{
  product: Product;
  isAdded: boolean;
  wishlistIds: number[];
  onToggleWishlist?: (id: number) => void;
  onQuickView: (p: Product) => void;
  handleAdd: (e: React.MouseEvent, p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
  isComparing: boolean;
  onToggleComparison?: (id: number) => void;
}> = ({
  product,
  isAdded,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  handleAdd,
  onAddToCart,
  onBuyNow,
  isComparing,
  onToggleComparison
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [justWishlisted, setJustWishlisted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isWishlisted = wishlistIds.includes(product.id);

  // Trigger pop animation when this product is wishlisted
  useEffect(() => {
    if (isWishlisted) {
      setJustWishlisted(true);
      const timer = setTimeout(() => setJustWishlisted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el || !product.images || product.images.length <= 1) return;

    let index = 0;
    const count = product.images.length;
    let interval: ReturnType<typeof setInterval>;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          interval = setInterval(() => {
            if (isHovered) return;
            index = (index + 1) % count;
            if (el) {
              el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
            }
          }, 3500);
        } else {
          clearInterval(interval);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(el);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [product.images, isHovered]);

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-3xl overflow-hidden border border-[#FFCDF2]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:border-[#EC3460]/40"
    >
      {/* Image Stage: Horizontal Scrollable Gallery */}
      <div 
        ref={galleryRef}
        className="relative w-full aspect-4/3 sm:aspect-square flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth group/gallery"
        style={{ backgroundColor: product.panel }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 z-20 bg-[#EC3460]/85 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-xs pointer-events-none border border-white/10 backdrop-blur-[1px]">
            {product.badge}
          </span>
        )}

        {/* Action Buttons: Wishlist & Quick View & Compare */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                isWishlisted
                  ? 'bg-white text-[#EC3460] shadow-raspberry opacity-100'
                  : 'bg-white/95 text-slate-400 hover:text-[#EC3460] hover:bg-white sm:opacity-0 sm:group-hover:opacity-100'
              } ${justWishlisted ? 'animate-pop' : ''}`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={15}
                fill={isWishlisted ? '#EC3460' : 'none'}
                className={isWishlisted ? 'text-[#EC3460]' : ''}
              />
            </button>
          )}

          {onToggleComparison && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComparison(product.id);
              }}
              className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                isComparing
                  ? 'bg-[#EC3460] text-white shadow-raspberry opacity-100'
                  : 'bg-white/95 text-slate-400 hover:text-[#EC3460] hover:bg-white sm:opacity-0 sm:group-hover:opacity-100'
              }`}
              title={isComparing ? "Remove from comparison" : "Add to comparison"}
            >
              <Scale size={15} />
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
            <img
              src={img}
              alt={`${product.name} view ${idx + 1}`}
              className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500 ease-out drop-shadow-sm"
            />
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

      {/* Card Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Stars & Reviews */}
          <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star size={isMobile ? 10 : 13} fill="currentColor" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-800">
              {product.rating}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 hidden xs:inline">
              ({product.reviewsCount})
            </span>
            <span className="text-slate-300 mx-1 hidden xs:inline">·</span>
            <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
              {product.volume}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-950 text-xs sm:text-base leading-tight sm:leading-snug group-hover:text-[#EC3460] transition-colors uppercase line-clamp-2">
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5 line-clamp-1">
            {product.subtitle}
          </p>

          {/* Key Actives Chips - Hidden on very small mobile */}
          <div className="hidden xs:flex flex-wrap gap-1 mt-2 sm:mt-3">
            {product.keyIngredients.slice(0, 1).map((ing, i) => (
              <span
                key={i}
                className="text-[9px] sm:text-[10px] bg-[#FFF0F9] text-[#B31940] px-1.5 py-0.5 rounded-md font-medium border border-[#FFCDF2]/50"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action Row: Add to Cart (Left) and Buy Now (Right) */}
        <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className="font-mono text-sm sm:text-lg font-bold text-slate-950 tabular-nums">
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[9px] sm:text-xs text-slate-400 line-through tabular-nums font-mono">
                {product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
            <button
              onClick={(e) => handleAdd(e, product)}
              disabled={product.availableForSale === false}
              className={`flex-1 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 ${
                isAdded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pop'
                  : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
              title="Add to your cart"
            >
              {isAdded ? (
                <>
                  <Check size={isMobile ? 12 : 14} />
                  <span>In Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={isMobile ? 12 : 14} />
                  <span className="xs:inline">Cart</span>
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
              className="flex-1 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 bg-[#EC3460] hover:bg-[#D8224F] text-white shadow-raspberry border border-transparent"
              title="Buy now and checkout"
              disabled={product.availableForSale === false}
            >
              <Sparkles size={isMobile ? 12 : 14} />
              <span className="xs:inline">Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BestSellers: React.FC<BestSellersProps> = ({
  onQuickView,
  onAddToCart,
  onBuyNow,
  selectedCategory,
  onSelectCategory,
  products = [],
  isLoading = false,
  errorMessage = null,
  isShopifyConnected = false,
  onOpenShopifyConnect,
  wishlistIds = [],
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'serums' | 'masks' | 'moisturizers'>('all');
  const [addedId, setAddedId] = useState<number | null>(null);

  const currentProducts = products || [];

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
              {!isShopifyConnected && onOpenShopifyConnect ? (
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
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#FFCDF2]/60 p-8 shadow-xs">
            <div className="inline-block w-8 h-8 border-4 border-[#EC3460] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-800 text-sm font-semibold">Loading live products from Shopify...</p>
            <p className="text-slate-400 text-xs mt-1">Connecting to store catalog and retrieving inventory.</p>
          </div>
        ) : errorMessage && filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#FFCDF2]/60 p-8 shadow-xs">
            <p className="text-slate-800 text-base font-semibold mb-2">Unable to Load Shopify Products</p>
            <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed mb-6">{errorMessage}</p>
            {onOpenShopifyConnect && (
              <button
                type="button"
                onClick={onOpenShopifyConnect}
                className="px-6 py-3 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-raspberry"
              >
                Configure Shopify Connection
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
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
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={addedId === product.id}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  handleAdd={handleAdd}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isComparing={comparisonIds.includes(product.id)}
                  onToggleComparison={onToggleComparison}
                />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
