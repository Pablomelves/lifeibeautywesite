import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  X, 
  Star, 
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
  Scale
} from 'lucide-react';
import { Product } from '../types';
import { STORE_PRODUCTS, STORE_REVIEWS } from '../data/storeData';
import { createShopifyCheckout, getShopifyConfig } from '../services/shopify';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onSelectRecommended: (product: Product) => void;
  onBuyNowDirect?: (product: Product, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
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
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'howTo' | 'results'>('benefits');
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
  const [activeImage, setActiveImage] = useState<string>(product?.src || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (product) {
      setActiveImage(product.src);
      setActiveImageIndex(0);
      setIsAutoPlaying(true);
    }
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoPlaying || !product?.images || product.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % product.images!.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, product?.images, product]);

  // Sync activeImage with activeImageIndex
  useEffect(() => {
    if (product?.images && product.images[activeImageIndex]) {
      setActiveImage(product.images[activeImageIndex]);
    }
  }, [activeImageIndex, product?.images]);

  if (!product) return null;

  const isRollerProduct = product.name.toLowerCase().includes('roller');

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images.map((url, i) => ({
        label: i === 0 ? 'Main' : `View ${i + 1}`,
        url,
        tag: i === 0 ? 'Main' : 'Detail'
      }))
    : [{ label: 'Product', url: product.src, tag: 'Main' }];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentNumericPrice = selectedVariant ? selectedVariant.numericPrice : product.numericPrice;

  const productReviews = STORE_REVIEWS.filter((r) => r.productId === product.id);
  const recommended = (allProducts && allProducts.length > 0 ? allProducts : STORE_PRODUCTS)
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    const itemToAdd = {
      ...product,
      price: currentPrice,
      numericPrice: currentNumericPrice,
      selectedVariantId: selectedVariant?.id,
      volume: selectedVariant && selectedVariant.title !== 'Default Title' ? selectedVariant.title : product.volume,
    };
    onAddToCart(itemToAdd, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
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
      setIsBuyingNow(true);
      try {
        const checkoutUrl = await createShopifyCheckout([
          { product: itemToAdd, quantity, variantId: selectedVariant?.id }
        ]);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
      } catch (err) {
        console.warn('Instant checkout error:', err);
      } finally {
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
            "description": product.subtitle || product.benefits.join(', '),
            "brand": {
              "@type": "Brand",
              "name": "LI FEI BEAUTY"
            },
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "USD",
              "price": product.numericPrice,
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating,
              "reviewCount": product.reviewsCount
            }
          })
        }]}
      >
        <title>{`${product.name} | LI FEI BEAUTY`}</title>
        <meta name="description" content={product.subtitle || product.benefits.join('. ')} />
        
        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} | LI FEI BEAUTY`} />
        <meta property="og:description" content={product.subtitle || product.benefits.join('. ')} />
        <meta property="og:image" content={product.src} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | LI FEI BEAUTY`} />
        <meta name="twitter:description" content={product.subtitle || product.benefits.join('. ')} />
        <meta name="twitter:image" content={product.src} />
      </Helmet>

      <div 
        className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
      <div 
        className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              SEOUL VERIFIED FORMULA · {product.category}
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
              100% Authentic
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

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-10 divide-y divide-slate-100">
          {/* Main Hero & Purchase Module */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-10">
            {/* Gallery / Product Photo */}
            <div 
              className="lg:w-1/2 flex flex-col items-center"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div 
                className="w-full aspect-square sm:aspect-4/3 rounded-3xl p-3 sm:p-5 flex items-center justify-center relative shadow-sm overflow-hidden bg-slate-50 border border-slate-100 group"
                style={{ backgroundColor: activeImage === product.src ? product.panel : '#F8FAFC' }}
              >
                {product.badge && (
                  <span className="absolute top-2.5 left-2.5 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-white/10">
                    {product.badge}
                  </span>
                )}
                
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

                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full drop-shadow-xl transition-all duration-300 ${
                    activeImage === product.src ? 'object-contain sm:scale-105' : 'object-cover rounded-2xl'
                  }`}
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
                        setIsAutoPlaying(false);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                        activeImageIndex === idx
                          ? 'border-[#EC3460] shadow-sm scale-105'
                          : 'border-slate-100 hover:border-[#FFCDF2]'
                      }`}
                    >
                      <img
                        src={imgItem.url}
                        alt={imgItem.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Sourcing Tag */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl w-full justify-center">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Authentic Sealed Batch · Direct Seoul Headquarters</span>
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
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-emerald-700 font-semibold">{product.stockStatus}</span>
                </div>

                {/* 3. Price */}
                <div className="flex items-baseline gap-3 my-4">
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums">
                    {currentPrice}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through tabular-nums font-mono">
                      {product.originalPrice}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[#B31940] bg-[#FFF0F9] border border-[#FFCDF2] px-2 py-0.5 rounded">
                    Free Seoul Express Available
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-xs'
                                : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9]'
                            }`}
                          >
                            <span>{v.title}</span>
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
                    Key Clinical Benefits:
                  </span>
                  <ul className="space-y-2">
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
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-slate-500 hover:text-[#EC3460] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    className={`flex-1 font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-raspberry flex items-center justify-center gap-2 ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#EC3460] hover:bg-[#D8224F] text-white'
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
                        <span>Add to Bag · ${(currentNumericPrice * quantity).toFixed(2)}</span>
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
                  disabled={isBuyingNow}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isBuyingNow ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Shopify Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Instant Buy with Free Express Shipping</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Ingredients, How to Use, Clinical Results tabs */}
          <div className="py-10">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'benefits' ? 'bg-[#EC3460] text-white shadow-xs' : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                Key Bio-Actives
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'ingredients' ? 'bg-[#EC3460] text-white shadow-xs' : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                Full Ingredients
              </button>
              <button
                onClick={() => setActiveTab('howTo')}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'howTo' ? 'bg-[#EC3460] text-white shadow-xs' : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                How to Use
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'results' ? 'bg-[#EC3460] text-white shadow-xs' : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                Clinical Results
              </button>
            </div>

            {/* Tab: Key Actives */}
            {activeTab === 'benefits' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.keyIngredients.map((ing, i) => (
                  <div key={i} className="p-4 bg-[#FFF5FA] rounded-2xl border border-[#FFCDF2]/60">
                    <span className="text-xs font-bold text-slate-900 block mb-1">
                      {ing}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      High-potency Korean formulation engineered for immediate cellular bioavailability.
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Full Ingredients */}
            {activeTab === 'ingredients' && (
              <div className="p-4 bg-[#FFF5FA] rounded-2xl border border-[#FFCDF2]/60">
                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                  {product.allIngredients}
                </p>
                <span className="text-[10px] text-slate-400 block mt-2">
                  *Free from parabens, phthalates, synthetic mineral oils, and artificial colorants.
                </span>
              </div>
            )}

            {/* Tab: How to Use */}
            {activeTab === 'howTo' && (
              <div className="space-y-3">
                {product.howToUse.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#FFF5FA] rounded-xl border border-[#FFCDF2]/40">
                    <span className="w-5 h-5 rounded-full bg-[#EC3460] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Results / Before & After */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="p-6 bg-[#FFF5FA] rounded-2xl border border-[#FFCDF2]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EC3460] block mb-2">
                    Clinical Trial Highlights
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    {product.clinicalClaim}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {product.beforeAfterSummary || 'Over 94% of trial participants reported a visible improvement in skin luminosity and hydration.'}
                  </p>
                </div>

                {/* Clear Before & After Face Picture Showcase for Roller */}
                {isRollerProduct && (
                  <div className="bg-white p-5 rounded-3xl border border-[#FFCDF2] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block">
                          SEOUL DERMATOLOGY CLINICAL PHOTOGRAPHY
                        </span>
                        <h4 className="font-anton text-lg uppercase text-slate-900">
                          CLEAR BEFORE &amp; AFTER FACE PICTURE (10-MIN ROLLING TRIAL)
                        </h4>
                      </div>
                      <span className="text-[10px] bg-[#FFF0F9] text-[#B31940] px-2.5 py-1 rounded-full font-bold border border-[#FFCDF2]">
                        n=64 Trial Participants
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Before Picture */}
                      <div className="space-y-2">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src="/rolling/before.jpg"
                            alt="Clear Before Face Picture for facial roller: baseline morning puffiness"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                          <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20">
                            BEFORE · 0 MIN
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          <strong>Baseline:</strong> Sluggish lymphatic drainage, orbital morning puffiness, soft cheekbone contour.
                        </p>
                      </div>

                      {/* After Picture */}
                      <div className="space-y-2">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-[#EC3460]/40">
                          <img
                            src="/rolling/after.jpg"
                            alt="Clear After Face Picture for facial roller: sculpted jawline, elevated cheekbones, and glass skin glow"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                          <span className="absolute top-3 left-3 bg-[#EC3460] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/30 shadow-xs">
                            AFTER · 10 MIN
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          <strong>After 10 Min:</strong> -38% puffiness drained, high-tension jawline elevation, radiant dewy glass glow.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Verified Customer Reviews */}
          <div className="py-10">
            <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900 mb-4">
              CUSTOMER REVIEWS ({productReviews.length || '380+'})
            </h3>
            <div className="space-y-4">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">"{rev.title}"</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      — {rev.author} ({rev.location}) · Verified Purchase
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600">
                  Rated 4.9/5 by 380+ verified Korean beauty enthusiasts worldwide.
                </div>
              )}
            </div>
          </div>

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
                    className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-3 border border-slate-200/50"
                    style={{ backgroundColor: rec.panel }}
                  >
                    <img src={rec.src} alt={rec.name} className="w-full h-full object-cover object-center" />
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
