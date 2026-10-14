import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveProductImage } from './ResponsiveProductImage';
import { Star, ShoppingBag, Eye, Sparkles, Check, Heart, Scale, ArrowRight } from 'lucide-react';
import { Product, isProductSoldOut } from '../types';
import { belongsToCollection } from '../services/collectionRules';
import { isProductOfBrand, getProductsForBrand, BRANDS, type BrandId, type BrandInfo } from '../services/brandService';
import { STORE_CATEGORIES, isProductInCategory, getCategoryById } from '../services/categoryFilter';

interface BestSellersProps {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => boolean | void;
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
  onAddToCart: (p: Product) => boolean | void;
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [isBuying, setIsBuying] = useState(false);
  const isSoldOut = isProductSoldOut(product);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  // Manual gallery only — automatic slideshows disabled per storefront specifications
  const handleScrollPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = galleryRef.current;
    if (el) el.scrollBy({ left: -el.offsetWidth, behavior: 'smooth' });
  };

  const handleScrollNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = galleryRef.current;
    if (el) el.scrollBy({ left: el.offsetWidth, behavior: 'smooth' });
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-3xl overflow-hidden border border-[#FFCDF2]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:border-[#EC3460]/40"
    >
      {/* Image Stage: Horizontal Scrollable Gallery */}
      <div 
        ref={galleryRef}
        className="relative w-full aspect-square flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth group/gallery"
        style={{ backgroundColor: product.panel }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge */}
        {isSoldOut ? (
          <span className="absolute top-2.5 left-2.5 z-20 bg-slate-900/85 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs pointer-events-none backdrop-blur-xs">
            Sold Out
          </span>
        ) : product.badge ? (
          <span className="absolute top-2.5 left-2.5 z-20 bg-[#EC3460]/85 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-xs pointer-events-none border border-white/10 backdrop-blur-[1px]">
            {product.badge}
          </span>
        ) : null}

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
        {(product.images && product.images.length > 0 ? product.images : [product.src])
          .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
          .map((img, idx) => (
          <div 
            key={idx} 
            className="w-full h-full shrink-0 snap-center flex items-center justify-center relative overflow-hidden"
          >
            <ResponsiveProductImage
              src={img}
              alt={`${product.name} view ${idx + 1}`}
              className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out drop-shadow-sm group-hover:scale-105"
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
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-1.5">
            <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
              {product.volume}
            </span>
            {isSoldOut ? (
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                Sold Out
              </span>
            ) : (
              <span className="text-[8px] sm:text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                In Stock
              </span>
            )}
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
            {(product.keyIngredients || []).slice(0, 1).map((ing, i) => (
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
              disabled={isSoldOut || isAdded}
              className={`flex-1 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${
                isAdded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pop cursor-pointer'
                  : isSoldOut
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 cursor-pointer'
              }`}
              title={isSoldOut ? 'Currently Sold Out' : 'Add to your cart'}
            >
              {isAdded ? (
                <>
                  <Check size={isMobile ? 12 : 14} />
                  <span>In Bag</span>
                </>
              ) : isSoldOut ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag size={isMobile ? 12 : 14} />
                  <span className="xs:inline">Cart</span>
                </>
              )}
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (isSoldOut || isBuying) return;
                setIsBuying(true);
                try {
                  if (onBuyNow) {
                    await onBuyNow(product);
                  } else {
                    if (onAddToCart(product) === false) return;
                  }
                } finally {
                  setIsBuying(false);
                }
              }}
              className={`flex-1 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${
                isSoldOut
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : isBuying
                  ? 'bg-[#EC3460]/80 text-white cursor-wait opacity-80'
                  : 'bg-[#EC3460] hover:bg-[#D8224F] text-white shadow-raspberry border border-transparent cursor-pointer'
              }`}
              title={isSoldOut ? 'Currently Sold Out' : 'Buy now and checkout'}
              disabled={isSoldOut || isBuying}
            >
              {isSoldOut ? (
                <span>Sold Out</span>
              ) : isBuying ? (
                <span>Wait...</span>
              ) : (
                <>
                  <Sparkles size={isMobile ? 12 : 14} />
                  <span className="xs:inline">Buy</span>
                </>
              )}
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
  const [activeTab, setActiveTab] = useState<BrandId>('all');
  const [addedId, setAddedId] = useState<number | null>(null);

  const currentProducts = products || [];

  // Synchronize activeTab if selectedCategory changes externally
  useEffect(() => {
    if (selectedCategory) {
      const lower = selectedCategory.toLowerCase();
      if (['medicube', 'biodance', 'cerave', 'all'].includes(lower)) {
        setActiveTab(lower as BrandId);
      }
    }
  }, [selectedCategory]);

  const handleTabChange = (tab: BrandId) => {
    setActiveTab(tab);
    onSelectCategory(tab);
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart(product) === false) return;
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  // Check if an external collection/category filter is active that isn't a brand
  const isExternalCategoryFilter = Boolean(
    selectedCategory &&
    selectedCategory !== 'all' &&
    !['medicube', 'biodance', 'cerave', 'laneige', 'beauty-of-joseon', 'anua'].includes(selectedCategory.toLowerCase())
  );

  const activeCategoryInfo = getCategoryById(selectedCategory);

  const categoryFilteredProducts = isExternalCategoryFilter
    ? currentProducts.filter((product) => isProductInCategory(product, selectedCategory))
    : currentProducts;

  // Selected brand info if a single brand is active
  const selectedBrandInfo = activeTab !== 'all' ? BRANDS.find((b) => b.id === activeTab) : null;
  const selectedBrandProducts = activeTab !== 'all' ? getProductsForBrand(currentProducts, activeTab) : [];

  // Other products not associated with the 3 main brands
  const otherCuratedProducts = currentProducts.filter(
    (p) => !isProductOfBrand(p, 'medicube') && !isProductOfBrand(p, 'biodance') && !isProductOfBrand(p, 'cerave')
  );

  return (
    <section id="bestsellers" className="py-20 sm:py-28 bg-[#FFF5FA] font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-6">
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
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
                BRANDS AND BEST SELLERS
              </h2>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  onSelectCategory('all');
                }}
                className="text-xs font-bold uppercase tracking-wider text-[#EC3460] hover:text-[#B31940] underline underline-offset-4 flex items-center gap-1 cursor-pointer py-1 ml-auto md:ml-0"
              >
                <span>VIEW ALL PRODUCTS</span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-slate-600 max-w-xl mt-3 leading-relaxed">
              Explore authentic Seoul clinical formulations, organized by Korea&apos;s leading skincare brands with each product curated for your skin ritual.
            </p>
          </div>

          {/* Filter Tabs: Replaced category tabs with Brands */}
          <div className="flex items-center gap-1.5 p-1 bg-white/80 border border-[#FFCDF2] rounded-2xl overflow-x-auto shadow-xs">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all' && !isExternalCategoryFilter
                  ? 'bg-[#EC3460] text-white shadow-raspberry'
                  : 'text-slate-600 hover:text-[#EC3460]'
              }`}
            >
              <span>All Brands</span>
              {currentProducts.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'all' && !isExternalCategoryFilter
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {currentProducts.length}
                </span>
              )}
            </button>

            {BRANDS.map((brand) => {
              const count = getProductsForBrand(currentProducts, brand.id).length;
              const isActive = activeTab === brand.id && !isExternalCategoryFilter;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleTabChange(brand.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#EC3460] text-white shadow-raspberry'
                      : 'text-slate-600 hover:text-[#EC3460]'
                  }`}
                >
                  <span>{brand.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shop by Category Navigation Bar */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 shrink-0">
            Shop by Category:
          </span>
          {STORE_CATEGORIES.map((cat) => {
            const isCatActive = isExternalCategoryFilter
              ? (selectedCategory || '').toLowerCase() === cat.id
              : cat.id === 'all';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (cat.id === 'all') {
                    onSelectCategory('all');
                    setActiveTab('all');
                  } else {
                    onSelectCategory(cat.id);
                  }
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isCatActive
                    ? 'bg-[#EC3460] text-white shadow-raspberry'
                    : 'bg-white text-slate-700 border border-[#FFCDF2]/70 hover:border-[#EC3460]/40 hover:text-[#EC3460]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Header Banner when filtered */}
        {isExternalCategoryFilter && (
          <div className="mb-8 pb-4 border-b border-[#FFCDF2]/70 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#FFCDF2] bg-[#FFF0F9] text-[#EC3460] shadow-2xs">
                  {activeCategoryInfo.koreanTag} · {activeCategoryInfo.name}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {categoryFilteredProducts.length} {categoryFilteredProducts.length === 1 ? 'Curated Formula' : 'Curated Formulas'}
                </span>
              </div>
              <h3 className="font-anton text-2xl sm:text-4xl uppercase tracking-tight text-slate-900 leading-none">
                {activeCategoryInfo.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
                {activeCategoryInfo.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                setActiveTab('all');
              }}
              className="self-start md:self-end text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#EC3460] transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#EC3460]/40 cursor-pointer"
            >
              <span>← View All Products</span>
            </button>
          </div>
        )}

        {/* Product Showcase */}
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#FFCDF2]/60 p-8 shadow-xs">
            <div className="inline-block w-8 h-8 border-4 border-[#EC3460] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-800 text-sm font-semibold">Loading live products from Shopify...</p>
            <p className="text-slate-400 text-xs mt-1">Connecting to store catalog and retrieving inventory.</p>
          </div>
        ) : errorMessage && currentProducts.length === 0 ? (
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
        ) : isExternalCategoryFilter ? (
          /* When filtered by an external category */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
            {categoryFilteredProducts.length === 0 ? (
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
              categoryFilteredProducts.map((product, idx) => (
                <ProductCard
                  key={`${product.id}-${idx}`}
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
        ) : activeTab !== 'all' && selectedBrandInfo ? (
          /* Single Brand Showcase */
          <div>
            {/* Brand Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-[#FFCDF2]/70 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs"
                    style={{
                      borderColor: `${selectedBrandInfo.accentColor}40`,
                      backgroundColor: `${selectedBrandInfo.accentColor}12`,
                      color: selectedBrandInfo.accentColor || '#EC3460',
                    }}
                  >
                    {selectedBrandInfo.koreanTag} · {selectedBrandInfo.tag}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {selectedBrandProducts.length} {selectedBrandProducts.length === 1 ? 'Curated Formula' : 'Curated Formulas'}
                  </span>
                </div>
                <h3 className="font-anton text-2xl sm:text-4xl uppercase tracking-tight text-slate-900 leading-none">
                  {selectedBrandInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
                  {selectedBrandInfo.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className="self-start md:self-end text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#EC3460] transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#EC3460]/40 cursor-pointer"
              >
                <span>← All Brands & Best Sellers</span>
              </button>
            </div>

            {selectedBrandProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#FFCDF2]/60 p-8 shadow-xs">
                <p className="text-slate-600 text-sm font-medium">No formulas currently found for {selectedBrandInfo.name}.</p>
                <button
                  onClick={() => handleTabChange('all')}
                  className="mt-4 px-5 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-raspberry"
                >
                  View All Brands
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
                {selectedBrandProducts.map((product, idx) => (
                  <ProductCard
                    key={`${product.id}-${activeTab}-${idx}`}
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
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Divide each brand with its curated products */
          <div>
            {currentProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#FFCDF2]/60 p-8 shadow-xs">
                <p className="text-slate-600 text-sm font-medium">No formulas currently found in the catalog.</p>
              </div>
            ) : (
              <>
                {BRANDS.map((brand) => {
                  const brandProducts = getProductsForBrand(currentProducts, brand.id);
                  if (brandProducts.length === 0) return null;

                  return (
                    <div key={brand.id} className="mb-14 sm:mb-20 last:mb-0">
                      {/* Brand Divider / Curate Header */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-[#FFCDF2]/70 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs"
                              style={{
                                borderColor: `${brand.accentColor}40`,
                                backgroundColor: `${brand.accentColor}12`,
                                color: brand.accentColor || '#EC3460',
                              }}
                            >
                              {brand.koreanTag} · {brand.tag}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              {brandProducts.length} {brandProducts.length === 1 ? 'Curated Formula' : 'Curated Formulas'}
                            </span>
                          </div>
                          <h3 className="font-anton text-2xl sm:text-4xl uppercase tracking-tight text-slate-900 leading-none">
                            {brand.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
                            {brand.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTabChange(brand.id)}
                          className="self-start md:self-end text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#EC3460] transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#EC3460]/40 cursor-pointer"
                        >
                          <span>View {brand.name} Only</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      {/* Brand Product Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
                        {brandProducts.map((product, idx) => (
                          <ProductCard
                            key={`${product.id}-${brand.id}-${idx}`}
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
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Additional Curated Essentials if any non-brand products exist */}
                {otherCuratedProducts.length > 0 && (
                  <div className="mb-14 sm:mb-20 last:mb-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-[#FFCDF2]/70 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200 bg-white text-slate-800 shadow-2xs">
                            엄선된 에센셜 · Seoul Best Sellers
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {otherCuratedProducts.length} {otherCuratedProducts.length === 1 ? 'Curated Formula' : 'Curated Formulas'}
                          </span>
                        </div>
                        <h3 className="font-anton text-2xl sm:text-4xl uppercase tracking-tight text-slate-900 leading-none">
                          MORE CURATED ESSENTIALS
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
                          Authorized authentic skincare essentials and best-selling daily ritual treatments.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
                      {otherCuratedProducts.map((product, idx) => (
                        <ProductCard
                          key={`${product.id}-other-${idx}`}
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
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
