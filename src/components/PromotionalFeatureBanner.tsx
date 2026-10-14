import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Heart } from 'lucide-react';

interface PromotionalFeatureBannerProps {
  onDiscoverMore: () => void;
}

export const PromotionalFeatureBanner: React.FC<PromotionalFeatureBannerProps> = ({
  onDiscoverMore,
}) => {
  return (
    <section 
      aria-label="Editorial Beauty Spotlight"
      className="site-promotional-feature py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-[#FFF5FA] to-white font-inter"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl lg:rounded-4xl bg-gradient-to-br from-[#FFF1F4] via-white to-[#FFF0F9] border border-[#FFCDF2]/70 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Column: Text Panel */}
            <div className="lg:col-span-6 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EC3460]">
                  EDITORIAL SPOTLIGHT
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" aria-hidden="true" />
                <span className="text-xs text-[#6F6870] font-medium">Daily Self Care</span>
              </div>

              <h2 className="font-anton text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#171417] leading-[1.08] mb-4 text-balance">
                Korean Beauty for Everyday Life
              </h2>

              <p className="text-sm sm:text-base text-[#6F6870] leading-relaxed mb-6 max-w-xl">
                Nourish, protect and enhance your natural glow with trusted beauty brands. Discover clinically validated rituals formulated to elevate your skin health day after day.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#FFCDF2] flex items-center justify-center text-[#EC3460] shrink-0 shadow-2xs">
                    <Sparkles size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-[#171417]">Radiance Restoration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#FFCDF2] flex items-center justify-center text-[#EC3460] shrink-0 shadow-2xs">
                    <ShieldCheck size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-[#171417]">Barrier Defense</span>
                </div>
              </div>

              {/* CTA Button: 44-50px height */}
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={onDiscoverMore}
                  aria-label="Discover more Korean beauty essentials"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[46px] rounded-full bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EC3460] focus:ring-offset-2"
                >
                  <span>DISCOVER MORE</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <span className="text-xs text-[#6F6870] font-medium hidden sm:inline">
                  Free shipping on orders over $75
                </span>
              </div>
            </div>

            {/* Right Column: Premium Product Photography */}
            <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[480px] bg-[#FFF0F9] overflow-hidden flex items-center justify-center">
              <picture className="w-full h-full">
                <source
                  type="image/webp"
                  srcSet="/medicube-lineup-banner.webp"
                />
                <img
                  src="/5931077C-048F-40AA-B867-AEFF21A819B7.png"
                  alt="Korean Beauty Everyday Skincare Routine Lineup featuring Medicube and clinical treatments"
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none lg:hidden" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
