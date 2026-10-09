import React, { useState, useEffect } from 'react';
import { Sun, Shield, Sparkles, Droplets, CheckCircle2, ArrowRight, ShoppingBag, Heart, Scale } from 'lucide-react';
import { SKIN_CONCERNS } from '../data/storeData';
import { Product } from '../types';

interface SkinConcernSectionProps {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  products?: Product[];
  wishlistIds?: number[];
  onToggleWishlist?: (productId: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const SkinConcernSection: React.FC<SkinConcernSectionProps> = ({
  onQuickView,
  onAddToCart,
  products,
  wishlistIds = [],
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison,
}) => {
  const [activeConcernId, setActiveConcernId] = useState<string>('dullness');
  const [isAdded, setIsAdded] = useState(false);
  const [justWishlisted, setJustWishlisted] = useState(false);

  const catalog = products || [];
  const activeConcern = SKIN_CONCERNS.find((c) => c.id === activeConcernId) || SKIN_CONCERNS[0];
  const recommendedProduct = catalog.find((p) => p.id === activeConcern.recommendedProductId) || catalog[0];

  const isWishlisted = recommendedProduct ? wishlistIds.includes(recommendedProduct.id) : false;

  // Trigger pop animation when this product is wishlisted
  useEffect(() => {
    if (isWishlisted) {
      setJustWishlisted(true);
      const timer = setTimeout(() => setJustWishlisted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  const handleAddToCartWithAnim = (product: Product) => {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sun': return <Sun size={20} className="text-amber-500" />;
      case 'Shield': return <Shield size={20} className="text-rose-500" />;
      case 'Sparkles': return <Sparkles size={20} className="text-pink-500" />;
      case 'Droplets': return <Droplets size={20} className="text-sky-500" />;
      default: return <Sparkles size={20} className="text-rose-500" />;
    }
  };

  if (!recommendedProduct) {
    return null;
  }

  return (
    <section id="concerns" className="py-20 sm:py-28 bg-white font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-2">
            TARGETED CLINICAL SOLUTIONS
          </span>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
            WHAT SKIN GOAL ARE YOU SOLVING?
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Korean skincare treats root cellular deficiencies rather than masking symptoms. Select your concern to view the exact bio-active protocol.
          </p>
        </div>

        {/* Concern Selection Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {SKIN_CONCERNS.map((c) => {
            const isSelected = c.id === activeConcernId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConcernId(c.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry scale-105'
                    : 'bg-white text-slate-700 border-[#FFCDF2]/70 hover:bg-[#FFF0F9] hover:border-[#EC3460]/40'
                }`}
              >
                {getIcon(c.iconName)}
                <span>{c.title}</span>
              </button>
            );
          })}
        </div>

        {/* Solution Showcase Card */}
        <div className="bg-gradient-to-br from-[#FFF5FA] to-[#FFF0F9] rounded-3xl border border-[#FFCDF2]/60 p-6 sm:p-12 shadow-sm flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
          {/* Left: Product Feature & Visual */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
            <div 
              className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden flex items-center justify-center shadow-md cursor-pointer border border-[#FFCDF2]/60 group"
              style={{ backgroundColor: recommendedProduct.panel }}
              onClick={() => onQuickView(recommendedProduct)}
            >
              <span className="absolute top-4 left-4 z-10 bg-[#EC3460] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                Target Solution
              </span>

              {/* Wishlist Button */}
              {onToggleWishlist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(recommendedProduct.id);
                  }}
                  className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                    isWishlisted
                      ? 'bg-white text-[#EC3460] shadow-raspberry'
                      : 'bg-white/95 text-slate-400 hover:text-[#EC3460] hover:bg-white'
                  } ${justWishlisted ? 'animate-pop' : ''}`}
                >
                  <Heart
                    size={18}
                    fill={isWishlisted ? '#EC3460' : 'none'}
                    className={isWishlisted ? 'text-[#EC3460]' : ''}
                  />
                </button>
              )}

              {onToggleComparison && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComparison(recommendedProduct.id);
                  }}
                  className={`absolute top-16 right-4 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                    comparisonIds.includes(recommendedProduct.id)
                      ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                      : 'bg-white/95 text-slate-400 hover:text-[#EC3460] hover:bg-white'
                  }`}
                  title="Compare Formula"
                >
                  <Scale size={18} />
                </button>
              )}

              <img
                src={recommendedProduct.src}
                alt={recommendedProduct.name}
                className="w-full h-full object-cover object-center drop-shadow-md group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right: Scientific Breakdown & Proof */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EC3460] block">
                {activeConcern.subtitle}
              </span>
              <h3 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-slate-900 mt-1 mb-3">
                {activeConcern.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {activeConcern.description}
              </p>

              {/* Clinical Metric Pill */}
              <div className="bg-white p-4 rounded-2xl border border-[#FFCDF2]/60 shadow-xs mb-6">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Verified Clinical Study
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#EC3460] shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {activeConcern.clinicalResult}
                  </span>
                </div>
              </div>

              {/* Target Bioactive Actives */}
              <div className="space-y-2 mb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Bioactive Formulation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeConcern.targetActives.map((active, i) => (
                    <span 
                      key={i}
                      className="text-xs font-medium bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2]/60 px-3 py-1.5 rounded-xl"
                    >
                      {active}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Add to Cart (Left) and Buy Now (Right) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-200/70">
              <button
                onClick={() => handleAddToCartWithAnim(recommendedProduct)}
                className={`w-full sm:flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-[11px] uppercase tracking-wider py-4 px-6 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${isAdded ? 'animate-pop' : ''}`}
              >
                <ShoppingBag size={16} />
                <span>{isAdded ? 'Added to Bag!' : 'Add To Cart'}</span>
              </button>

              <button
                onClick={() => {
                  handleAddToCartWithAnim(recommendedProduct);
                  // In a real app, this would trigger checkout
                }}
                className={`w-full sm:flex-1 bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold text-[11px] uppercase tracking-wider py-4 px-6 rounded-2xl shadow-raspberry transition-all cursor-pointer flex items-center justify-center gap-2 ${isAdded ? 'animate-pop' : ''}`}
              >
                <Sparkles size={16} />
                <span>Buy Now · {recommendedProduct.price}</span>
              </button>

              <button
                onClick={() => onQuickView(recommendedProduct)}
                className="w-full sm:w-auto p-4 bg-slate-50 hover:bg-[#FFF0F9] text-slate-400 hover:text-[#EC3460] border border-slate-200 rounded-2xl transition-all cursor-pointer"
                title="Read Full Clinical Protocol"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
