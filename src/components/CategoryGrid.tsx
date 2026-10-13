import React from 'react';
import { ArrowRight } from 'lucide-react';
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
    <section id="shop-by-brand" className="py-20 bg-white font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-1">
              CURATED BRANDS
            </span>
            <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-slate-900">
              SHOP BY BRAND
            </h2>
          </div>
          <button
            type="button"
            onClick={handleExploreAll}
            className="text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EC3460] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All {products.length > 0 ? `${products.length} Formulas` : 'Formulas'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
                className={`group p-6 rounded-3xl bg-gradient-to-br ${brand.bgGradient} border border-[#FFCDF2]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:border-[#EC3460]/40 focus:outline-none focus:ring-2 focus:ring-[#EC3460] focus:ring-offset-2`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${brand.tagColor}`}>
                      {countLabel}
                    </span>
                  </div>

                  <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900 group-hover:text-[#EC3460] transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {brand.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-[#EC3460] group-hover:translate-x-1 transition-all">
                    Shop {brand.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-900 group-hover:bg-[#EC3460] group-hover:text-white transition-colors">
                    <ArrowRight size={14} />
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
