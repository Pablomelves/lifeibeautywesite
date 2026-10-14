import React, { useState, useMemo } from 'react';
import { ResponsiveProductImage } from './ResponsiveProductImage';
import { Droplets, Sparkles, Shield, Sun, Activity, Star, ShoppingBag, Eye, Heart, Scale, Check, ArrowRight, Filter } from 'lucide-react';
import { Product, isProductSoldOut } from '../types';

export interface SkinConcernCategory {
  id: string;
  name: string;
  koreanName: string;
  tagline: string;
  description: string;
  targetActives: string[];
  clinicalResult: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  bgGradient: string;
  badgeBg: string;
  badgeColor: string;
  keywords: string[];
}

export const CONCERN_CATEGORIES: SkinConcernCategory[] = [
  {
    id: 'hydration',
    name: 'Hydration',
    koreanName: '수분 보습',
    tagline: 'Deep cellular moisture, oligo-hyaluronic acid & hydrogel barrier lock',
    description: 'Quenches parched intracellular dermal matrices and replenishes lasting hydration without heavy weight, leaving skin with a supple, mirror-dewy glass skin finish.',
    targetActives: ['Oligo-Hyaluronic Acid', 'Sea Kelp Extract', 'Deep Hydrolipid Matrix'],
    clinicalResult: '+208% Intracellular Hydration in 24 Hours',
    icon: Droplets,
    accentColor: '#0284c7',
    bgGradient: 'from-sky-50 via-cyan-50/40 to-blue-50/30',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    keywords: ['hydrat', 'hyaluronic', 'dry skin', 'deep sea water', 'dewy', 'oligo-hyaluronic', 'hydrogel', 'water lock', 'moisture', 'lotion', 'cream']
  },
  {
    id: 'firming',
    name: 'Firming',
    koreanName: '탄력 리프팅',
    tagline: 'Bio-active PDRN salmon DNA, NAD+ longevity enzymes & collagen lifting',
    description: 'Reactivates sluggish fibroblast synthesis and firms slack jawline contour with medical-grade Korean Salmon PDRN and pure NAD+ longevity peptides.',
    targetActives: ['Rose PDRN (Salmon DNA)', 'EGF / NAD+ Peptide', 'Low-Molecular Collagen'],
    clinicalResult: '+192% Collagen Synthesis & Visible Dermal Plump',
    icon: Sparkles,
    accentColor: '#db2777',
    bgGradient: 'from-pink-50 via-rose-50/40 to-purple-50/30',
    badgeBg: '#fce7f3',
    badgeColor: '#be185d',
    keywords: ['firming', 'elasticity', 'collagen', 'egf', 'nad', 'peptide', 'lifting', 'wrinkle', 'plumping', 'contour', 'gua sha', 'salmon dna', 'pdrn', 'renewing']
  },
  {
    id: 'barrier',
    name: 'Barrier Repair',
    koreanName: '장벽 강화',
    tagline: 'Triple bio-mimetic ceramides, calm restoration & lipid shield recovery',
    description: 'Repairs compromised, irritated stratum corneum with bio-identical ceramides 1, 3, and 6-II to lock in active treatments and shield against environmental stressors.',
    targetActives: ['Ceramides 1, 3, 6-II', 'Lipid Emulsion Shield', 'Pure Niacinamide'],
    clinicalResult: '-42% Transepidermal Water Loss (TEWL)',
    icon: Shield,
    accentColor: '#059669',
    bgGradient: 'from-emerald-50 via-teal-50/40 to-green-50/30',
    badgeBg: '#d1fae5',
    badgeColor: '#047857',
    keywords: ['barrier', 'ceramide', 'protective skin barrier', 'essential ceramide', 'three essential', 'repair skin', 'strengthen barrier', 'sooth', 'calm', 'restor']
  },
  {
    id: 'brightening',
    name: 'Brightening & Radiance',
    koreanName: '미백 광채',
    tagline: 'High-purity Kojic Acid, fermented Turmeric & Vitamin C for translucent glow',
    description: 'Fades stubborn hyperpigmentation, UV spots, and post-acne erythema while interrupting cellular tyrosinase activity to unveil uniform glass luminosity.',
    targetActives: ['Kojic Acid 1.5%', 'Fermented Turmeric Root', 'Pure Vitamin C (L-Ascorbic)'],
    clinicalResult: '-48% Melanin Density in 21 Days',
    icon: Sun,
    accentColor: '#d97706',
    bgGradient: 'from-amber-50 via-orange-50/40 to-yellow-50/30',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    keywords: ['brightening', 'vitamin c', 'kojic', 'turmeric', 'glow', 'radiance', 'dark circle', 'dark spot', 'uneven tone', 'hyperpigmentation', 'clarifying capsule']
  },
  {
    id: 'clarifying',
    name: 'Pore Care & Acne',
    koreanName: '모공 · 트러블',
    tagline: 'Gentle clarifying AHA/BHA, benzoyl peroxide & pore-tightening bio-actives',
    description: 'Dissolves stubborn sebum plugs, refines enlarged pore diameter, and calms cystic blemishes without disturbing moisture levels or over-drying.',
    targetActives: ['Benzoyl Peroxide 4%', 'Ultra-Low Collagen 50,000ppm', 'Pore-Clarifying Complex'],
    clinicalResult: '-38% Pore Area & Balanced Micro-Biome',
    icon: Activity,
    accentColor: '#7c3aed',
    bgGradient: 'from-violet-50 via-purple-50/40 to-indigo-50/30',
    badgeBg: '#ede9fe',
    badgeColor: '#6d28d9',
    keywords: ['pore', 'acne', 'benzoyl peroxide', 'troubled skin', 'blemish', 'pore minimizing', 'oily skin', 'pore tightening', 'foaming cleanser', 'clarifying']
  }
];

export interface ShopByConcernProps {
  products?: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => boolean | void;
  onBuyNow?: (product: Product) => void;
  wishlistIds?: number[];
  onToggleWishlist?: (productId: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const ShopByConcern: React.FC<ShopByConcernProps> = ({
  products = [],
  onQuickView,
  onAddToCart,
  wishlistIds = [],
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison
}) => {
  const [activeConcernId, setActiveConcernId] = useState<string>('hydration');
  const [sortBy, setSortBy] = useState<'curated' | 'price-asc' | 'price-desc' | 'rating'>('curated');
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Dynamically categorize products for each skin concern
  const concernProductsMap = useMemo(() => {
    const map = new Map<string, Product[]>();

    CONCERN_CATEGORIES.forEach((concern) => {
      const matching = products.filter((p) => {
        const text = [
          p.name,
          p.subtitle,
          p.category,
          p.description,
          p.fullDescription,
          ...(p.benefits || []),
          ...(p.keyIngredients || []),
          ...(p.tags || []),
          p.clinicalClaim || ''
        ]
          .join(' ')
          .toLowerCase();

        return concern.keywords.some((k) => text.includes(k));
      });

      // If no matching product found, fallback to top products so the section never looks empty
      map.set(concern.id, matching.length > 0 ? matching : products.slice(0, 4));
    });

    return map;
  }, [products]);

  const activeConcern = useMemo(() => {
    return CONCERN_CATEGORIES.find((c) => c.id === activeConcernId) || CONCERN_CATEGORIES[0];
  }, [activeConcernId]);

  const currentProducts = useMemo(() => {
    const rawList = concernProductsMap.get(activeConcern.id) || [];
    const list = [...rawList];

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.numericPrice - a.numericPrice);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }
    return list;
  }, [concernProductsMap, activeConcern, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProductSoldOut(product)) return;
    const ok = onAddToCart(product);
    if (ok !== false) {
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1200);
    }
  };

  const getBrandTag = (product: Product) => {
    const nameLower = product.name.toLowerCase();
    const vendorLower = (product.vendor || '').toLowerCase();
    if (nameLower.includes('medicube') || vendorLower.includes('medicube')) return 'MEDICUBE';
    if (nameLower.includes('biodance') || vendorLower.includes('biodance')) return 'BIODANCE';
    if (nameLower.includes('cerave') || vendorLower.includes('cerave')) return 'CERAVE';
    return (product.vendor || 'SEOUL CURATION').toUpperCase();
  };

  const ActiveIcon = activeConcern.icon;

  return (
    <section
      id="concerns"
      data-section="shop-by-concern"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-rose-50/15 to-white font-inter border-b border-rose-100/60"
      aria-label="Shop by Skin Concern"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#EC3460]">
              TARGETED KOREAN FORMULATIONS · SHOP BY CONCERN
            </span>
          </div>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-tight">
            SHOP BY SKIN CONCERN
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Korean clinical skincare targets cellular imbalances rather than masking symptoms. Select your primary skin goal to browse verified bio-active formulas.
          </p>
        </div>

        {/* Concern Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Skin concerns"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10"
        >
          {CONCERN_CATEGORIES.map((concern) => {
            const isSelected = concern.id === activeConcernId;
            const IconComponent = concern.icon;
            const count = (concernProductsMap.get(concern.id) || []).length;

            return (
              <button
                key={concern.id}
                role="tab"
                id={`tab-${concern.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${concern.id}`}
                onClick={() => setActiveConcernId(concern.id)}
                className={`group relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <IconComponent
                  size={16}
                  className={isSelected ? 'text-rose-400' : 'text-slate-500 group-hover:text-rose-500'}
                />
                <span className="font-medium">{concern.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {count}
                </span>
                <span
                  className={`hidden md:inline-block text-[10px] font-normal tracking-normal opacity-70 ml-0.5`}
                >
                  {concern.koreanName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Concern Protocol Banner */}
        <div
          id={`panel-${activeConcern.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeConcern.id}`}
          className={`mb-10 p-5 sm:p-7 rounded-3xl bg-gradient-to-r ${activeConcern.bgGradient} border border-slate-200/70 shadow-xs transition-all`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: activeConcern.badgeBg, color: activeConcern.badgeColor }}
                >
                  {activeConcern.koreanName}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Targeted Protocol
                </span>
              </div>
              <h3 className="font-anton text-xl sm:text-2xl uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <ActiveIcon size={22} style={{ color: activeConcern.accentColor }} />
                <span>{activeConcern.name} Focus</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeConcern.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Key Bio-Actives
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeConcern.targetActives.map((active, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {active}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Clinical Benchmark
                </span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {activeConcern.clinicalResult}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Result count & Sort */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100 text-xs text-slate-600">
          <div className="font-medium">
            Showing <span className="font-bold text-slate-900">{currentProducts.length}</span> formula{currentProducts.length === 1 ? '' : 's'} for <span className="font-bold text-slate-900">{activeConcern.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <label htmlFor="concern-sort-select" className="sr-only">Sort products by</label>
            <select
              id="concern-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
            >
              <option value="curated">Curated Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/60">
            <p className="text-slate-600 text-sm font-medium">
              No formulas currently available for this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {currentProducts.map((product) => {
              const isSoldOut = isProductSoldOut(product);
              const isWishlisted = wishlistIds.includes(product.id);
              const brandTag = getBrandTag(product);
              const destination = `/products/${encodeURIComponent(product.handle || String(product.id))}`;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 sm:p-4 hover:shadow-xl hover:border-rose-200 transition-all duration-300"
                >
                  {/* Top Badges & Actions */}
                  <div>
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-100 flex items-center justify-center">
                      <ResponsiveProductImage
                        src={product.src}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />

                      {/* Brand Label */}
                      <span className="absolute top-2 left-2 z-10 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-2xs border border-slate-200/60 backdrop-blur-xs">
                        {brandTag}
                      </span>

                      {/* Sold Out badge */}
                      {isSoldOut && (
                        <span className="absolute bottom-2 left-2 z-10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/90 text-white shadow-2xs">
                          Sold Out
                        </span>
                      )}

                      {/* Floating Quick Action Buttons */}
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {onToggleWishlist && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(product.id);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-all ${
                              isWishlisted
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/95 text-slate-600 hover:text-rose-500 hover:bg-white'
                            }`}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onQuickView(product)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-slate-600 hover:text-slate-900 hover:bg-white shadow-xs flex items-center justify-center cursor-pointer transition-all"
                          aria-label={`Quick view ${product.name}`}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="uppercase font-semibold tracking-wider text-[10px] text-slate-400 truncate max-w-[120px]">
                        {product.category || 'Treatment'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={11} fill="currentColor" />
                        <span className="font-semibold text-slate-700 text-[10px]">
                          {product.rating > 0 ? product.rating.toFixed(1) : '4.9'}
                        </span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 mb-1.5 group-hover:text-[#EC3460] transition-colors">
                      <a href={destination} onClick={(e) => { e.preventDefault(); onQuickView(product); }}>
                        {product.name}
                      </a>
                    </h4>

                    {/* Volume / Active highlight */}
                    {product.volume && (
                      <span className="text-[10px] text-slate-400 block mb-2 font-mono">
                        {product.volume}
                      </span>
                    )}
                  </div>

                  {/* Price & Add to Bag CTA */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">
                        {product.price}
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {product.originalPrice}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide transition-all cursor-pointer ${
                        isSoldOut
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : addedProductId === product.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-[#EC3460] text-white shadow-xs'
                      }`}
                      aria-label={`Add ${product.name} to bag`}
                    >
                      {addedProductId === product.id ? (
                        <>
                          <Check size={13} className="animate-scale-in" />
                          <span className="hidden xs:inline">Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} />
                          <span className="hidden xs:inline">{isSoldOut ? 'Sold Out' : 'Add'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
