import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoryTile {
  id: string;
  name: string;
  tagline: string;
  image: string;
  filterId: string;
  destination: string;
}

interface CategoryTilesSectionProps {
  onSelectCategory: (catId: string) => void;
  onNavigateSection: (sectionId: string) => void;
}

export const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'skincare',
    name: 'Skin Care',
    tagline: 'Serums, Toners & Creams',
    image: '/products/medicube-pink.jpg',
    filterId: 'skincare',
    destination: '/collections/skincare',
  },
  {
    id: 'makeup',
    name: 'Makeup',
    tagline: 'Cushions, Tints & Glow',
    image: '/products/medicube-turmeric.jpg',
    filterId: 'makeup',
    destination: '/collections/makeup',
  },
  {
    id: 'haircare',
    name: 'Hair Care',
    tagline: 'Scalp Health & Repair',
    image: '/products/skincare-4.png',
    filterId: 'haircare',
    destination: '/collections/haircare',
  },
  {
    id: 'bathbody',
    name: 'Bath & Body',
    tagline: 'Hydration & Treatments',
    image: '/products/skincare-3.png',
    filterId: 'bathbody',
    destination: '/collections/bath-body',
  },
  {
    id: 'fragrances',
    name: 'Fragrances',
    tagline: 'Seoul Scents & Mist',
    image: '/products/biodance.png',
    filterId: 'fragrances',
    destination: '/collections/fragrances',
  },
  {
    id: 'giftsets',
    name: 'Gift Sets',
    tagline: 'Curated Beauty Rituals',
    image: '/products/facial-roller.jpg',
    filterId: 'giftsets',
    destination: '/collections/gift-sets',
  },
];

export const CategoryTilesSection: React.FC<CategoryTilesSectionProps> = ({
  onSelectCategory,
  onNavigateSection,
}) => {
  const handleTileClick = (tile: CategoryTile) => {
    onSelectCategory(tile.filterId);
    onNavigateSection('bestsellers');
  };

  return (
    <section 
      id="shop-by-category" 
      aria-label="Shop by Category"
      className="site-categories-section py-12 sm:py-16 lg:py-20 bg-white font-inter border-b border-slate-100"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EC3460] block mb-2">
            CURATED BEAUTY RITUALS
          </span>
          <h2 className="font-anton text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#171417] leading-tight">
            SHOP BY CATEGORY
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6870] mt-2.5 max-w-lg mx-auto leading-relaxed">
            Discover specialized formulations crafted for daily restoration, radiance, and barrier protection.
          </p>
        </div>

        {/* 6 Attractive Category Tiles: 6 columns desktop, 3 columns tablet, 3 columns / 2 columns mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {CATEGORY_TILES.map((tile) => (
            <div
              key={tile.id}
              role="button"
              tabIndex={0}
              aria-label={`Shop ${tile.name} — ${tile.tagline}`}
              onClick={() => handleTileClick(tile)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(tile);
                }
              }}
              className="group flex flex-col items-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#FFF8F9] hover:bg-[#FFF1F4] border border-[#FFCDF2]/50 hover:border-[#EC3460]/40 transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#EC3460] focus:ring-offset-2 text-center"
            >
              {/* Circular Product Image Container with Subtle Zoom */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white p-1.5 border border-[#FFCDF2]/70 shadow-2xs overflow-hidden flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={tile.image}
                  alt={tile.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Title & Tagline */}
              <h3 className="font-bold text-xs sm:text-sm text-[#171417] group-hover:text-[#EC3460] transition-colors tracking-tight">
                {tile.name}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-[#6F6870] mt-0.5 line-clamp-1">
                {tile.tagline}
              </span>

              {/* Subtle Pill/Indicator */}
              <div className="mt-2.5 sm:mt-3 pt-2 border-t border-slate-200/50 w-full flex items-center justify-center text-[10px] sm:text-xs font-semibold text-[#EC3460] opacity-90 group-hover:opacity-100">
                <span className="group-hover:underline">Shop Now</span>
                <ArrowRight size={11} className="ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
