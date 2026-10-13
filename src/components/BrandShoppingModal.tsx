import React, { useState, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, ShoppingBag, Heart, Check, Sparkles, ChevronRight, ChevronLeft, LayoutGrid, Grid, Eye } from 'lucide-react';
import { ResponsiveProductImage } from './ResponsiveProductImage';
import { Product, ShopifyVariant } from '../types';
import { getBrandById, getProductsForBrand, BRANDS, ALL_BRANDS_INFO, type BrandId, type BrandInfo } from '../services/brandService';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface BrandShoppingModalProps {
  brandId: BrandId | null;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => boolean | void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  wishlistIds?: number[];
  onToggleWishlist?: (productId: number) => void;
  header?: React.ReactNode;
  headerProps?: any;
  onOpenProduct?: (handle: string) => void;
  onSelectBrand?: (brandId: BrandId) => void;
}

interface BrandProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => boolean | void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  isWishlisted: boolean;
  onToggleWishlist?: (productId: number) => void;
}

const BrandProductCard: React.FC<BrandProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    return product.selectedVariantId || product.variants?.find(v => v.availableForSale)?.id || product.variants?.[0]?.id || '';
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const selectedVariant: ShopifyVariant | undefined = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
  const isAvailable = selectedVariant ? selectedVariant.availableForSale : product.availableForSale;
  const currentPrice = selectedVariant?.price || product.price;
  const currentNumericPrice = selectedVariant?.numericPrice ?? product.numericPrice;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice || product.originalPrice;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const itemToAdd: Product = {
      ...product,
      selectedVariantId: selectedVariant?.id,
      price: currentPrice,
      numericPrice: currentNumericPrice,
      volume: selectedVariant && selectedVariant.title !== 'Default Title' ? selectedVariant.title : product.volume,
    };
    if (onAddToCart(itemToAdd, quantity) === false) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const itemToAdd: Product = {
      ...product,
      selectedVariantId: selectedVariant?.id,
      price: currentPrice,
      numericPrice: currentNumericPrice,
      volume: selectedVariant && selectedVariant.title !== 'Default Title' ? selectedVariant.title : product.volume,
    };
    if (onBuyNow) {
      onBuyNow(itemToAdd, quantity);
    } else {
      onAddToCart(itemToAdd, quantity);
    }
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-[#FFCDF2]/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-[#EC3460]/50"
    >
      <div>
        {/* Edge-to-Edge Product Image Container */}
        <div
          className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: product.panel || '#FFF9FC' }}
        >
          {/* Actions: Quick View & Wishlist */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:text-[#EC3460] hover:bg-white transition-all hover:scale-110 cursor-pointer"
              title="Quick Look & Details"
              aria-label={`View ${product.name} details and pictures`}
            >
              <Eye size={14} />
            </button>
            {onToggleWishlist && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-400 hover:text-[#EC3460] hover:bg-white transition-all hover:scale-110 cursor-pointer"
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  size={14}
                  className={isWishlisted ? 'text-[#EC3460]' : ''}
                  fill={isWishlisted ? '#EC3460' : 'none'}
                />
              </button>
            )}
          </div>

          {/* Stock / Sale Badge */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex flex-col gap-1">
            {!isAvailable ? (
              <span className="bg-slate-900/85 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-xs">
                Sold Out
              </span>
            ) : product.badge ? (
              <span className="bg-[#EC3460] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                {product.badge}
              </span>
            ) : null}
          </div>

          {/* Hover Quick Look Pill */}
          <div className="absolute inset-x-0 bottom-2.5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 px-2 pointer-events-none">
            <span className="bg-white/95 text-slate-900 shadow-md text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
              <Eye size={12} className="text-[#EC3460]" />
              <span>Quick Look</span>
            </span>
          </div>

          {/* Edge-to-edge flush image */}
          <ResponsiveProductImage
            src={product.src}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-md"
            loading="lazy"
          />
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-5">
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>{product.volume || 'Full Size'}</span>
            {!isAvailable && (
              <span className="text-slate-400">
                Out of Stock
              </span>
            )}
          </div>

          <h4 className="font-anton text-xs sm:text-base uppercase tracking-tight text-slate-900 line-clamp-2 group-hover:text-[#EC3460] transition-colors leading-tight min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h4>

          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed hidden xs:block">
            {product.description || product.fullDescription}
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            <span className="font-mono font-bold text-sm sm:text-lg text-slate-950">
              {currentPrice}
            </span>
            {currentCompareAtPrice && (
              <span className="font-mono text-[10px] sm:text-xs text-slate-400 line-through">
                {currentCompareAtPrice}
              </span>
            )}
          </div>

          {/* Variant Selector (if more than 1 variant) */}
          {product.variants && product.variants.length > 1 && (
            <div className="mt-2 sm:mt-3" onClick={(e) => e.stopPropagation()}>
              <label htmlFor={`variant-${product.id}`} className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Option:
              </label>
              <select
                id={`variant-${product.id}`}
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-[#EC3460]"
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title} {v.price ? `(${v.price})` : ''} {!v.availableForSale ? '— Sold Out' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 sm:p-5 pt-0 flex flex-col gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
          {/* Quantity selector */}
          <div className="flex items-center justify-between sm:justify-start border border-slate-200 rounded-xl bg-slate-50 px-2 py-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1 || !isAvailable}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-1 disabled:opacity-30 cursor-pointer"
            >
              −
            </button>
            <span className="text-xs font-mono font-bold text-slate-900 px-1.5 sm:px-2 min-w-4 sm:min-w-5 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(q => Math.min(10, q + 1))}
              disabled={quantity >= 10 || !isAvailable}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-1 disabled:opacity-30 cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
              added
                ? 'bg-emerald-600 text-white'
                : !isAvailable
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-white hover:bg-[#FFF0F9] text-slate-900 hover:text-[#EC3460] border border-slate-300 hover:border-[#EC3460]'
            }`}
          >
            {added ? (
              <>
                <Check size={13} strokeWidth={3} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>

        {isAvailable && (
          <button
            type="button"
            onClick={handleBuy}
            className="w-full py-2 sm:py-2.5 px-3 bg-[#EC3460] hover:bg-[#D8224F] text-white rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-raspberry hover:scale-[1.01] cursor-pointer"
          >
            <span>Buy Now</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export const BrandShoppingModal: React.FC<BrandShoppingModalProps> = ({
  brandId,
  isOpen,
  onClose,
  products,
  onQuickView,
  onAddToCart,
  onBuyNow,
  wishlistIds = [],
  onToggleWishlist,
  header,
  onSelectBrand,
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  const stripScrollRef = useRef<HTMLDivElement>(null);
  const [gridView, setGridView] = useState<'standard' | 'compact'>('standard');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  if (!isOpen || !brandId) return null;

  const brand = getBrandById(brandId);
  const rawMatchingProducts = getProductsForBrand(products, brandId);
  const matchingProducts = [...rawMatchingProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.numericPrice ?? 0) - (b.numericPrice ?? 0);
    if (sortBy === 'price-desc') return (b.numericPrice ?? 0) - (a.numericPrice ?? 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleScrollStrip = (direction: 'left' | 'right') => {
    if (stripScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      stripScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleBrandSelect = (targetBrandId: BrandId) => {
    if (onSelectBrand) {
      onSelectBrand(targetBrandId);
    }
  };

  const brandFilterItems: BrandInfo[] = [
    ...BRANDS,
    ALL_BRANDS_INFO,
  ];

  const allCuratedCount = getProductsForBrand(products, 'all').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${brand?.name || 'Brand'} Storefront`}
      className="fixed inset-0 z-[110] bg-white overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full min-h-screen bg-white text-slate-900 flex flex-col font-inter"
      >
        {/* Sticky Header at the top of the viewport */}
        {header && (
          <div className="sticky top-0 z-40 w-full bg-white shadow-xs">
            {header}
          </div>
        )}

        {/* Collection Sub-bar with Back Button & Breadcrumbs */}
        <div className={`border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky ${header ? 'top-[72px] sm:top-[80px]' : 'top-0'} z-30`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={onClose}
                className="hover:text-[#EC3460] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 mr-1"
                aria-label="Back"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <ChevronRight size={12} />
              <span>Shop by Brand</span>
              <ChevronRight size={12} />
              <span className="text-[#EC3460] font-bold">{brand?.name}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close brand page"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Medicube Official Brand Lineup Banner (Only displayed on Medicube collection) */}
        {brandId === 'medicube' && (
          <section
            aria-label="Medicube Official Brand Lineup Banner"
            className="w-full bg-white border-b border-slate-200/80 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
              <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs flex items-center justify-center p-2 sm:p-4 bg-radial from-slate-50/50 to-white">
                <picture className="w-full flex items-center justify-center">
                  {/* Modern WebP tailored for smaller screen widths (<= 768px) to optimize loading performance */}
                  <source
                    type="image/webp"
                    media="(max-width: 768px)"
                    srcSet="/5931077C-048F-40AA-B867-AEFF21A819B7-mobile.webp"
                  />
                  {/* PNG tailored for smaller screen widths (<= 768px) */}
                  <source
                    type="image/png"
                    media="(max-width: 768px)"
                    srcSet="/5931077C-048F-40AA-B867-AEFF21A819B7-mobile.png"
                  />
                  {/* Desktop / tablet displays use the full-resolution master asset */}
                  <source
                    media="(min-width: 769px)"
                    srcSet="/5931077C-048F-40AA-B867-AEFF21A819B7.png"
                  />
                  <img
                    src="/5931077C-048F-40AA-B867-AEFF21A819B7.png"
                    srcSet="/5931077C-048F-40AA-B867-AEFF21A819B7-mobile.webp 768w, /5931077C-048F-40AA-B867-AEFF21A819B7-mobile.png 768w, /5931077C-048F-40AA-B867-AEFF21A819B7.png 1920w"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                    alt="Medicube Official Skincare Lineup — Zero Pore, Exosome Shot, Age-R Booster Pro, PDRN Pink Peptide, Collagen & Deep Vita C"
                    className="w-full h-auto object-contain object-center max-h-[260px] sm:max-h-[380px] md:max-h-[460px] lg:max-h-[520px]"
                    loading="eager"
                    fetchPriority="high"
                    referrerPolicy="no-referrer"
                  />
                </picture>
              </div>
            </div>
          </section>
        )}

        {/* Horizontal Brand Filter Strip (Positioned directly below the Medicube collection banner) */}
        <section
          aria-label="Curated Brands Quick Switch Strip"
          className="w-full bg-slate-50/95 border-b border-slate-200/90 py-3 sm:py-3.5 px-4 sm:px-6 lg:px-8 transition-colors"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header row with metadata & quick scroll controls */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#EC3460] shrink-0" />
                <span className="font-bold uppercase tracking-[0.16em] text-[10px] sm:text-[11px] text-slate-900 whitespace-nowrap">
                  Curated Brand Filter
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline whitespace-nowrap">
                  Toggle between Medicube, Biodance & authorized brands without leaving collection view
                </span>
                <span className="text-[11px] text-slate-500 sm:hidden whitespace-nowrap">
                  Quick Brand Toggle
                </span>
              </div>

              {/* Scroll buttons for desktop */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScrollStrip('left')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  title="Scroll brand strip left"
                  aria-label="Scroll brand strip left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollStrip('right')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  title="Scroll brand strip right"
                  aria-label="Scroll brand strip right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable button strip */}
            <div className="relative">
              <div
                ref={stripScrollRef}
                role="tablist"
                aria-label="Curated Brands Navigation Strip"
                className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full"
              >
                {brandFilterItems.map((item) => {
                  const isActive = brandId === item.id;
                  const count = item.id === 'all'
                    ? allCuratedCount
                    : getProductsForBrand(products, item.id).length;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleBrandSelect(item.id)}
                      className={`group shrink-0 min-w-[210px] sm:min-w-[240px] p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC3460] ${
                        isActive
                          ? 'bg-white shadow-sm ring-2'
                          : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: item.accentColor || '#EC3460',
                              borderWidth: '2px',
                              boxShadow: `0 4px 14px -3px ${item.accentColor ? item.accentColor + '25' : 'rgba(236,52,96,0.18)'}`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Brand Product/Logo Thumbnail */}
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Sparkles size={16} className="text-slate-400" />
                          )}
                        </div>

                        {/* Brand Names & Tagline */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 leading-tight">
                            <span className="font-anton uppercase tracking-wide text-xs sm:text-sm text-slate-900 truncate">
                              {item.name}
                            </span>
                            {item.koreanTag && (
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {item.koreanTag}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                            {item.tag}
                          </p>
                        </div>
                      </div>

                      {/* Right indicator: Active badge or product count */}
                      <div className="shrink-0 flex items-center pl-1">
                        {isActive ? (
                          <span
                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap"
                            style={{ backgroundColor: item.accentColor || '#EC3460' }}
                          >
                            <Check size={10} strokeWidth={3} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono tabular-nums text-slate-500 bg-slate-100 group-hover:bg-slate-200/70 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap">
                            {count} {count === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Brand Banner Header */}
        <div className={`p-6 sm:p-10 bg-gradient-to-br ${brand?.bgGradient || 'from-rose-50 to-pink-50'} border-b border-slate-200/80`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${brand?.tagColor || 'text-[#EC3460] bg-white'}`}>
                {brand?.tag}
              </span>
            </div>

            <h1 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none mt-1">
              {brand?.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mt-3 leading-relaxed">
              {brand?.description}
            </p>
          </div>
        </div>

        {/* Gridview Controls Bar */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-5 pb-2 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="uppercase tracking-wider font-bold text-[11px] text-slate-900">
              {brand?.name} Products
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">
              {matchingProducts.length} {matchingProducts.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label htmlFor="brand-sort-select" className="text-xs text-slate-500 font-medium">Sort:</label>
              <select
                id="brand-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-[#EC3460] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Grid:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setGridView('compact')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    gridView === 'compact'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="2-Column Grid View"
                  aria-label="2-Column Grid View"
                >
                  <Grid size={13} />
                  <span>2 Col</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGridView('standard')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    gridView === 'standard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="4-Column Grid View"
                  aria-label="4-Column Grid View"
                >
                  <LayoutGrid size={13} />
                  <span>4 Col</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Products Grid */}
        <div className="max-w-7xl mx-auto w-full p-4 sm:px-8 sm:pb-8 sm:pt-2 flex-1">
          {matchingProducts.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
              <Sparkles size={32} className="mx-auto text-slate-400 mb-3" />
              <h3 className="font-anton text-lg uppercase text-slate-800">
                No Published {brand?.name} Products Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                We couldn’t find active published items in the store catalog for {brand?.name}. Check Shopify product publication or explore all products.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-5 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer"
              >
                Return to Store Catalog
              </button>
            </div>
          ) : (
            <div className={
              gridView === 'compact'
                ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
                : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
            }>
              {matchingProducts.map((product, idx) => (
                <BrandProductCard
                  key={`${product.id}-${idx}`}
                  product={product}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Official authentic formulas sourced directly from authorized Korean distribution.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
            >
              Close Brand Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
