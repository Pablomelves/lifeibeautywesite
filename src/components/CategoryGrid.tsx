import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { BRANDS, getProductsForBrand, BrandInfo, BrandId } from '../services/brandService';

interface CategoryGridProps {
  onSelectBrand?: (brandId: BrandId) => void;
  onSelectCategory: (catId: string) => void;
  onNavigateSection: (sectionId: string) => void;
  products?: Product[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectBrand,
  onSelectCategory,
  onNavigateSection,
  products = [],
}) => {
  const getBrandCount = (id: string) => {
    const count = getProductsForBrand(products, id).length;
    return `${count} ${count === 1 ? 'Product' : 'Products'}`;
  };

  const handleClick = (brand: BrandInfo) => {
    if (onSelectBrand) {
      onSelectBrand(brand.id);
    } else {
      onSelectCategory(brand.id);
      onNavigateSection('bestsellers');
    }
  };

  const handleExploreAll = () => {
    onSelectCategory('all');
    onNavigateSection('bestsellers');
  };

  return (
    <section 
      id="shop-by-brand" 
      aria-label="Shop by Brand" 
      className="site-brands-section py-14 sm:py-20 lg:py-24 bg-white font-inter border-b border-slate-100"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EC3460] block mb-1">
              CURATED GLOBAL &amp; SEOUL BRANDS
            </span>
            <h2 className="font-anton text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#171417] leading-none">
              SHOP BY BRAND
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6870] mt-2 max-w-xl">
              Authentic formulations from recognized skincare houses with direct sourcing transparency.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExploreAll}
            className="text-xs font-bold uppercase tracking-wider text-[#171417] hover:text-[#EC3460] transition-colors flex items-center gap-1.5 cursor-pointer py-1 self-start sm:self-end"
          >
            <span>Explore All {products.length > 0 ? `${products.length} Products` : 'Formulas'}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Brand Tiles: 5-6 desktop, 2-3 tablet, 2 mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {BRANDS.map((brand) => {
            const countLabel = getBrandCount(brand.id);

            return (
              <div
                key={brand.id}
                role="button"
                tabIndex={0}
                aria-label={`Shop ${brand.name} collection`}
                onClick={() => handleClick(brand)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(brand);
                  }
                }}
                className={`group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${brand.bgGradient} border border-[#FFCDF2]/50 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:border-[#EC3460]/40 focus:outline-none focus:ring-2 focus:ring-[#EC3460] focus:ring-offset-2`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-[#EC3460] border border-[#FFCDF2]/70 shadow-2xs">
                      {brand.koreanTag}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-medium text-slate-500">
                      {countLabel}
                    </span>
                  </div>

                  {brand.image && (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto my-2 rounded-xl bg-white p-1 border border-white/60 shadow-2xs overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img
                        src={brand.image}
                        alt={`${brand.name} product`}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <h3 className="font-anton text-lg sm:text-xl uppercase tracking-tight text-[#171417] group-hover:text-[#EC3460] transition-colors text-center mt-1">
                    {brand.name}
                  </h3>
                  <p className="text-[11px] text-[#6F6870] mt-1 line-clamp-2 text-center leading-snug">
                    {brand.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-semibold text-[#171417] group-hover:text-[#EC3460] transition-colors">
                    Shop Collection
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#171417] group-hover:bg-[#EC3460] group-hover:text-white transition-colors">
                    <ArrowRight size={12} aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
