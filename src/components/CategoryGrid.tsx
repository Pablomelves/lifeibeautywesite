import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/storeData';
import { Product } from '../types';

interface CategoryGridProps {
  onSelectCategory: (catId: string) => void;
  onNavigateSection: (sectionId: string) => void;
  products?: Product[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  onNavigateSection,
  products,
}) => {
  const getCategoryCount = (id: string, defaultText: string) => {
    if (!products || products.length === 0) return defaultText;
    if (id === 'serums') {
      const c = products.filter((p) => p.category === 'Serums').length;
      return `${c} ${c === 1 ? 'Product' : 'Products'}`;
    }
    if (id === 'masks') {
      const c = products.filter((p) => p.category === 'Masks').length;
      return `${c} ${c === 1 ? 'Product' : 'Products'}`;
    }
    if (id === 'cleansers') {
      const c = products.filter((p) => p.category === 'Cleansers').length;
      return `${c} ${c === 1 ? 'Product' : 'Products'}`;
    }
    if (id === 'moisturizers') {
      const c = products.filter((p) => p.category === 'Moisturizers').length;
      return `${c} ${c === 1 ? 'Product' : 'Products'}`;
    }
    return defaultText;
  };

  const visualCategories = [
    {
      id: 'serums',
      title: 'Targeted Serums',
      korean: '세럼 & 앰플',
      desc: 'PDRN salmon DNA, EGF longevity peptides & kojic acid',
      count: getCategoryCount('serums', '3 Products'),
      bgGradient: 'from-[#FFF0F9] to-[#FFE6F6]',
      tagColor: 'text-[#EC3460] bg-white border border-[#FFCDF2]'
    },
    {
      id: 'masks',
      title: 'Bio-Collagen Masks',
      korean: '콜라겐 팩',
      desc: 'Viral low-molecular hydrogel treatments for poreless glass skin',
      count: getCategoryCount('masks', '1 Product'),
      bgGradient: 'from-[#F5F3FF] to-[#EDE9FE]',
      tagColor: 'text-[#8B5CF6] bg-white border border-[#DDD6FE]'
    },
    {
      id: 'cleansers',
      title: 'Pore Cleansers & Toners',
      korean: '클렌징 & 토너 패드',
      desc: 'AHA/BHA dual-textured exfoliating pads and green tea infusions',
      count: getCategoryCount('cleansers', '2 Products'),
      bgGradient: 'from-[#F0FDF4] to-[#DCFCE7]',
      tagColor: 'text-[#16A34A] bg-white border border-[#BBF7D0]'
    },
    {
      id: 'moisturizers',
      title: 'Barrier Cushion Creams',
      korean: '수분 보습 크림',
      desc: '5-Ceramide lipid cushions that seal in active serum nutrients',
      count: getCategoryCount('moisturizers', '2 Products'),
      bgGradient: 'from-[#FFF7ED] to-[#FFEDD5]',
      tagColor: 'text-[#EA580C] bg-white border border-[#FED7AA]'
    }
  ];

  const handleClick = (id: string) => {
    onSelectCategory(id);
    onNavigateSection('bestsellers');
  };

  return (
    <section className="py-20 bg-white font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-1">
              CURATED COLLECTIONS
            </span>
            <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-slate-900">
              SHOP BY K-BEAUTY CATEGORY
            </h2>
          </div>
          <button
            onClick={() => handleClick('all')}
            className="text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#EC3460] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All {products.length > 0 ? `${products.length} Formulas` : 'Formulas'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {visualCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`group p-6 rounded-3xl bg-gradient-to-br ${cat.bgGradient} border border-[#FFCDF2]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:border-[#EC3460]/40`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cat.tagColor}`}>
                    {cat.count}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {cat.korean}
                  </span>
                </div>

                <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900 group-hover:text-[#EC3460] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 group-hover:text-[#EC3460] group-hover:translate-x-1 transition-all">
                  Shop Collection
                </span>
                <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-900 group-hover:bg-[#EC3460] group-hover:text-white transition-colors">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
