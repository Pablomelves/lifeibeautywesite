import React, { useState, useEffect } from 'react';
import { ResponsiveProductImage } from './ResponsiveProductImage';
import { Helmet } from 'react-helmet-async';
import { 
  X, 
  ShoppingBag, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Droplets, 
  Clock, 
  ChevronDown, 
  Plus, 
  Minus,
  CheckCircle2,
  Share2,
  Loader2,
  Heart,
  Scale,
  ArrowLeft
} from 'lucide-react';
import { Product, isProductSoldOut } from '../types';
import { ProductReviews } from './ProductReviews';
import { ProductInformationSection } from './ProductInformationSection';
import { StorefrontHtml } from './StorefrontHtml';
import { createShopifyCheckout, getShopifyConfig } from '../services/shopify';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { trackShoppingEvent } from '../services/analytics';

interface ProductDetailModalProps {
  brandHeader?: React.ReactNode;
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => boolean | void;
  onOpenPolicy?: (type: 'shipping' | 'returns') => void;
  onOpenContact?: () => void;
  onSelectRecommended: (product: Product) => void;
  onBuyNowDirect?: (product: Product, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  brandHeader,
  product,
  allProducts,
  onClose,
  onAddToCart,
  onSelectRecommended,
  onBuyNowDirect,
  isWishlisted = false,
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison,
  onOpenPolicy,
  onOpenContact,
}) => {
  const modal = useModalAccessibility(!!product, onClose);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [justWishlisted, setJustWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Trigger pop animation when this product is wishlisted
  useEffect(() => {
    if (isWishlisted) {
      setJustWishlisted(true);
      const timer = setTimeout(() => setJustWishlisted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const checkoutPending = React.useRef(false);
  const [activeImage, setActiveImage] = useState<string>(product?.src || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => { setQuantity(1); setAdded(false); }, [product?.id]);
  useEffect(() => { if (product) trackShoppingEvent('view_item', [{ product, quantity: 1 }]); }, [product?.id]);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.src || product.images?.[0] || '');
      setActiveImageIndex(0);
    }
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(previous => product.variants.find(variant => variant.id === previous?.id) || product.variants.find(variant => variant.id === product.selectedVariantId) || product.variants.find(variant => variant.availableForSale) || product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Sync activeImage with activeImageIndex (manual selection only - autoplay disabled)
  useEffect(() => {
    if (product?.images && product.images[activeImageIndex]) {
      setActiveImage(product.images[activeImageIndex]);
    }
  }, [activeImageIndex, product?.images]);

  if (!product) return null;

  const isRollerProduct = product.name.toLowerCase().includes('roller');

  const rawImages = (product.images && product.images.length > 0
    ? product.images
    : [product.src]).filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
  const galleryImages = rawImages.map((url, i) => ({
    label: i === 0 ? 'Main' : `View ${i + 1}`,
    url,
    tag: i === 0 ? 'Main' : 'Detail'
  }));

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentNumericPrice = selectedVariant ? selectedVariant.numericPrice : product.numericPrice;
  const currentOriginalPrice = selectedVariant ? selectedVariant.compareAtPrice : product.originalPrice;
  const currentAvailable = (selectedVariant ? selectedVariant.availableForSale : product.availableForSale !== false) && product.stockStatus !== 'Out of Stock' && (product.stockQuantity === undefined || product.stockQuantity > 0);

  const recommended = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    if (added || !currentAvailable) return;
    const itemToAdd = {
      ...product,
      price: currentPrice,
      numericPrice: currentNumericPrice,
      selectedVariantId: selectedVariant?.id,
      volume: selectedVariant && selectedVariant.title !== 'Default Title' ? selectedVariant.title : product.volume,
    };
    if (onAddToCart(itemToAdd, quantity) === false) return;
    setAdded(true);
  };

  const handleBuyNow = async () => {
    if (checkoutPending.current || !currentAvailable) return;
    const itemToAdd = {
      ...product,
      price: currentPrice,
      numericPrice: currentNumericPrice,
      selectedVariantId: selectedVariant?.id,
      volume: selectedVariant && selectedVariant.title !== 'Default Title' ? selectedVariant.title : product.volume,
    };

    if (onBuyNowDirect) {
      onBuyNowDirect(itemToAdd, quantity);
      return;
    }

    const config = getShopifyConfig();
    if (config.isConnected) {
      checkoutPending.current = true;
      setPurchaseError(null);
      setIsBuyingNow(true);
      try {
        const checkoutUrl = await createShopifyCheckout([
          { product: itemToAdd, quantity, variantId: selectedVariant?.id }
        ]);
        if (checkoutUrl) {
          trackShoppingEvent('begin_checkout', [{ product: itemToAdd, quantity }]);
          window.location.href = checkoutUrl;
          return;
        }
      } catch (err) {
        trackShoppingEvent('shopping_error');
        setPurchaseError(err instanceof Error ? err.message : 'Shopify checkout is temporarily unavailable. Please try again.');
        return;
      } finally {
        checkoutPending.current = false;
        setIsBuyingNow(false);
      }
    }

    onAddToCart(itemToAdd, quantity);
    onClose();
  };

  return (
    <>
      <Helmet
        script={[{
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.src,
            "description": product.description || product.fullDescription,
            "offers": {
              "@type": "Offer",
              "url": window.location.origin + '/products/' + product.handle,
              "priceCurrency": product.currencyCode || 'USD',
              "price": currentNumericPrice,
              "availability": currentAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              "itemCondition": "https://schema.org/NewCondition"
            },
            ...(product.reviewsCount > 0 ? { "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating,
              "reviewCount": product.reviewsCount
            } } : {})
          })
        }]}
      >
        <title>{`${product.name} | LI FEI BEAUTY`}</title>
        <meta name="description" content={product.description || product.fullDescription} />
        
        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} | LI FEI BEAUTY`} />
        <meta property="og:description" content={product.description || product.fullDescription} />
        <meta property="og:image" content={product.src} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | LI FEI BEAUTY`} />
        <meta name="twitter:description" content={product.description || product.fullDescription} />
        <meta name="twitter:image" content={product.src} />
      </Helmet>

      <div 
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} Details`}
        className="fixed inset-0 z-[140] bg-white overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          ref={modal}
          className="w-full min-h-screen bg-white text-slate-900 flex flex-col font-inter"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header at the top of the viewport */}
          {brandHeader && (
            <div className="sticky top-0 z-40 w-full bg-white shadow-xs">
              {brandHeader}
            </div>
          )}

          {/* Product Details Sub-bar */}
          <div className={`border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky ${brandHeader ? 'top-[72px] sm:top-[80px]' : 'top-0'} z-30`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="hover:text-[#EC3460] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 mr-2"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hidden xs:inline">
                  LI FEI BEAUTY PRODUCT DETAILS
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onToggleWishlist && (
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border ${
                      isWishlisted
                        ? 'bg-[#FFF0F9] text-[#B31940] border-[#FFCDF2] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-[#EC3460] hover:border-[#FFCDF2]'
                    } ${justWishlisted ? 'animate-pop' : ''}`}
                    title={isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                    aria-label={isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart
                      size={15}
                      fill={isWishlisted ? '#EC3460' : 'none'}
                      className={isWishlisted ? 'text-[#EC3460]' : ''}
                    />
                    <span>{isWishlisted ? 'Wishlisted' : 'Save'}</span>
                  </button>
                )}

                {onToggleComparison && (
                  <button
                    type="button"
                    onClick={() => onToggleComparison(product.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border ${
                      comparisonIds.includes(product.id)
                        ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-[#EC3460] hover:border-[#FFCDF2]'
                    }`}
                    title="Add to comparison"
                  >
                    <Scale size={15} />
                    <span>{comparisonIds.includes(product.id) ? 'Comparing' : 'Compare'}</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="max-w-6xl mx-auto w-full p-6 sm:p-10 divide-y divide-slate-100 flex-1">
          {/* Main Hero & Purchase Module */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-10">
            {/* Gallery / Product Photo */}
            <div className="lg:w-1/2 flex flex-col items-center">
              <div 
                className="w-full aspect-square rounded-3xl flex items-center justify-center relative shadow-sm overflow-hidden group"
                style={{ backgroundColor: activeImage === product.src ? product.panel : '#F8FAFC' }}
              >
                {!currentAvailable ? (
                  <span className="absolute top-2.5 left-2.5 z-10 bg-slate-900/85 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                    Sold Out
                  </span>
                ) : product.badge ? (
                  <span className="absolute top-2.5 left-2.5 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-white/10">
                    {product.badge}
                  </span>
                ) : null}
                
                {/* Manual Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-slate-200"
                    >
                      <ChevronDown size={20} className="rotate-90" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-slate-200"
                    >
                      <ChevronDown size={20} className="-rotate-90" />
                    </button>
                  </>
                )}

                <ResponsiveProductImage loading="eager" sizes="(max-width: 1024px) 90vw, 448px"
                  src={activeImage || product.src || null}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center drop-shadow-xl transition-all duration-300"
                />

                {/* Dots Indicator */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {galleryImages.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === activeImageIndex ? 'w-4 bg-slate-900' : 'w-1 bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 mt-4 w-full overflow-x-auto pb-2 no-scrollbar px-1">
                  {galleryImages.map((imgItem, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                        activeImageIndex === idx
                          ? 'border-[#EC3460] shadow-sm scale-105'
                          : 'border-slate-100 hover:border-[#FFCDF2]'
                      }`}
                    >
                      {imgItem.url && imgItem.url.trim() ? (
                        <img
                          src={imgItem.url}
                          alt={imgItem.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Sourcing Tag */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl w-full justify-center">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Product information from the current store catalog</span>
              </div>
            </div>

            {/* Structure: Product → Rating → Price → Benefits → Add to Cart → Buy Now */}
            <div className="lg:w-1/2 flex flex-col justify-between">
              <div>
                {/* 1. Product Name & Subtitle */}
                <h1 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-slate-950 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {product.subtitle} · {product.volume}
                </p>

                {/* 2. Rating */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`text-xs font-semibold ${currentAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>{currentAvailable ? 'In Stock' : 'Sold Out'}</span>
                </div>

                {/* 3. Price */}
                <div className="flex flex-wrap items-baseline gap-3 my-4">
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums">
                    {currentPrice}
                  </span>
                  {currentOriginalPrice && (
                    <span className="text-sm text-slate-400 line-through tabular-nums font-mono">
                      {currentOriginalPrice}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[#B31940] bg-[#FFF0F9] border border-[#FFCDF2] px-2 py-0.5 rounded">
                    Shipping calculated at checkout
                  </span>
                </div>

                {/* Shopify Variants Selection */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mb-5 pb-4 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Select Size / Option:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-xs'
                                : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9]'
                            }`}
                          >
                            <span>{v.title}{!v.availableForSale ? ' · Sold out' : ''}</span>
                            <span className="ml-1.5 opacity-80 font-mono">({v.price})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Benefits (Key Bullet Points) */}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Product description:
                  </span>
                  <ul className="space-y-2">
                    {product.fullDescription && <li className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{product.descriptionHtml ? <StorefrontHtml html={product.descriptionHtml} /> : product.fullDescription}</li>}
                    {product.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                        <CheckCircle2 size={14} className="text-[#EC3460] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. Add to Cart & Buy Now Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#FFCDF2] rounded-xl px-2 py-1.5 shrink-0 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-slate-500 hover:text-[#EC3460] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-bold font-mono tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(previous => Math.min(999, previous + 1))}
                      className="p-1 text-slate-500 hover:text-[#EC3460] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    disabled={!currentAvailable || added}
                    className={`flex-1 font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      !currentAvailable
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : added
                        ? 'bg-emerald-600 text-white cursor-pointer shadow-raspberry'
                        : 'bg-[#EC3460] hover:bg-[#D8224F] text-white cursor-pointer shadow-raspberry'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={16} />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>{currentAvailable ? 'Add to Bag · ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currencyCode || 'USD' }).format(currentNumericPrice * quantity) : 'Sold out'}</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Heart Icon Button */}
                  {onToggleWishlist && (
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        isWishlisted
                          ? 'bg-[#FFF0F9] text-[#EC3460] border-[#FFCDF2] shadow-xs'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-[#EC3460] hover:border-[#FFCDF2]'
                      } ${justWishlisted ? 'animate-pop' : ''}`}
                      title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      aria-label={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted ? '#EC3460' : 'none'}
                        className={isWishlisted ? 'text-[#EC3460]' : ''}
                      />
                    </button>
                  )}
                </div>

                {/* Buy Now (Direct Checkout Flow) */}
                <button
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || !currentAvailable}
                  className={`w-full font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    !currentAvailable
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                      : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {isBuyingNow ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Shopify Checkout...</span>
                    </>
                  ) : !currentAvailable ? (
                    <span>Sold out</span>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Buy Now</span>
                    </>
                  )}
                </button>
                <div className="flex flex-wrap gap-3 text-xs text-[#B31940]">
                  <button type="button" onClick={() => onOpenPolicy?.('shipping')} className="py-2 underline cursor-pointer">Shipping policy</button>
                  <button type="button" onClick={() => onOpenPolicy?.('returns')} className="py-2 underline cursor-pointer">Returns and refunds</button>
                  <button type="button" onClick={onOpenContact} className="py-2 underline cursor-pointer">Contact support</button>
                </div>
                {purchaseError && <p role="alert" className="text-xs text-[#B31940]">{purchaseError}</p>}
              </div>
            </div>
          </div>

          <ProductInformationSection key={`product-info-${product.id}`} product={product} />

          <ProductReviews key={`product-reviews-${product.id}`} product={product} />

          {/* Section: Recommended Products */}
          <div className="pt-10">
            <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900 mb-6">
              COMPLETE YOUR KOREAN RITUAL
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommended.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecommended(rec)}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div 
                    className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-3 border border-slate-200/50 relative"
                    style={{ backgroundColor: rec.panel }}
                  >
                    {isProductSoldOut(rec) && (
                      <span className="absolute top-2 left-2 z-10 bg-slate-900/85 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-xs">
                        Sold Out
                      </span>
                    )}
                    <ResponsiveProductImage src={rec.src} alt={rec.name} className="w-full h-full object-cover object-center" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase truncate text-slate-900">{rec.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono font-bold text-slate-900">{rec.price}</span>
                      {onToggleComparison && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComparison(rec.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                            comparisonIds.includes(rec.id)
                              ? 'bg-[#EC3460] text-white border-[#EC3460]'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-[#EC3460]'
                          }`}
                        >
                          <Scale size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};
