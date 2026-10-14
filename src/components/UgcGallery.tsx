import React from 'react';
import { Instagram, Heart, ExternalLink } from 'lucide-react';

interface UgcGalleryProps {
  onExploreProduct?: (id: number) => void;
}

interface UgcPost {
  id: number;
  handle: string;
  image: string;
  caption: string;
  likes: string;
  productName: string;
  productId: number;
}

const GALLERY_POSTS: UgcPost[] = [
  {
    id: 1,
    handle: '@clara_glows',
    image: '/products/medicube-pink.jpg',
    caption: 'My morning Seoul glass skin ritual ✨',
    likes: '1.4k',
    productName: 'PDRN Pink Peptide Serum',
    productId: 1,
  },
  {
    id: 2,
    handle: '@seoul.beauty.diary',
    image: '/products/biodance.png',
    caption: 'Overnight glow with the Bio-Collagen mask 🤍',
    likes: '2.8k',
    productName: 'Bio-Collagen Deep Mask',
    productId: 2,
  },
  {
    id: 3,
    handle: '@hana_skincare',
    image: '/products/medicube-turmeric.jpg',
    caption: 'Turmeric & Kojic pads are a game changer 🍊',
    likes: '950',
    productName: 'Turmeric Radiance Pads',
    productId: 5,
  },
  {
    id: 4,
    handle: '@minji_daily',
    image: '/products/facial-roller.jpg',
    caption: 'Sunday facial sculpting session with cryo contour ❄️',
    likes: '3.1k',
    productName: 'Cryo Contour Roller',
    productId: 3,
  },
  {
    id: 5,
    handle: '@sophia_kbeauty',
    image: '/products/skincare-4.png',
    caption: 'Hydration barrier restored in 7 days 💧',
    likes: '1.9k',
    productName: 'Water Bank Essence',
    productId: 4,
  },
  {
    id: 6,
    handle: '@emma_glow',
    image: '/products/skincare-3.png',
    caption: 'Clean, gentle, and certified authentic @lifeibeauty 🌸',
    likes: '2.3k',
    productName: 'Barrier Cream',
    productId: 6,
  },
];

export const UgcGallery: React.FC<UgcGalleryProps> = ({ onExploreProduct }) => {
  return (
    <section 
      aria-label="Instagram and UGC Social Proof" 
      className="site-ugc-gallery py-16 sm:py-20 lg:py-24 bg-white font-inter border-b border-slate-100"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <a
              href="https://instagram.com/lifeibeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#EC3460] hover:text-[#B31940] transition-colors mb-2 text-[11px] font-bold uppercase tracking-[0.22em]"
            >
              <Instagram size={14} aria-hidden="true" />
              <span>FOLLOW US @LIFEIBEAUTY</span>
            </a>
            <h2 className="font-anton text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#171417] leading-none">
              SHARE YOUR GLOW
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6870] mt-2.5 max-w-xl">
              Tag <span className="font-semibold text-[#171417]">@lifeibeauty</span> and use <span className="font-semibold text-[#EC3460]">#LifeiGlow</span> to be featured in our community showcase.
            </p>
          </div>

          <a
            href="https://instagram.com/lifeibeauty"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#FFCDF2] bg-[#FFF0F9] text-[#EC3460] hover:bg-[#FFE6F6] hover:text-[#B31940] text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-end shadow-2xs"
          >
            <Instagram size={14} aria-hidden="true" />
            <span>Visit Instagram</span>
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>

        {/* 6 Square Lifestyle Photos: 2 columns mobile, 3 columns tablet, 6 columns desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {GALLERY_POSTS.map((post) => (
            <div
              key={post.id}
              role="button"
              tabIndex={0}
              aria-label={`View photo from ${post.handle}: ${post.caption}`}
              onClick={() => onExploreProduct?.(post.productId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onExploreProduct?.(post.productId);
                }
              }}
              className="group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFF0F9] border border-[#FFCDF2]/50 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#EC3460]"
            >
              {/* Product / Lifestyle Image */}
              <img
                src={post.image}
                alt={post.caption}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              />

              {/* Gradient Dark Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 text-white">
                <div className="flex items-center justify-between">
                  <Instagram size={18} className="text-white drop-shadow-sm" aria-hidden="true" />
                  <span className="flex items-center gap-1 text-[11px] font-bold text-white/90">
                    <Heart size={12} fill="currentColor" aria-hidden="true" />
                    {post.likes}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#FFCDF2] block truncate">
                    {post.handle}
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-white/90 line-clamp-2 mt-0.5 leading-snug">
                    {post.caption}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/75 bg-white/20 px-1.5 py-0.5 rounded">
                    Shop Formula →
                  </span>
                </div>
              </div>

              {/* Subtle Instagram Icon Badge when not hovered */}
              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#EC3460] shadow-xs group-hover:opacity-0 transition-opacity">
                <Instagram size={12} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
