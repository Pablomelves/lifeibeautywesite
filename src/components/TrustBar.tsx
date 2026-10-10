import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Sparkles, Award } from 'lucide-react';

interface TrustBarProps {
  onVerifyClick?: () => void;
  onTrackClick?: () => void;
}

export const TrustBar: React.FC<TrustBarProps> = ({ onVerifyClick, onTrackClick }) => {
  return (
    <section className="bg-[#EC3460] text-white border-y border-[#EC3460]/20 py-6 sm:py-8 font-inter shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Pillar 1 */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white">
                Current Shopify Catalog
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Current product descriptions, options, prices, and availability from the store.
              </p>
              {onVerifyClick && (
                <button
                  onClick={onVerifyClick}
                  className="mt-1 text-[10px] sm:text-[11px] font-bold underline text-[#FFCDF2] hover:text-white transition-colors cursor-pointer block"
                >
                  Store shipping information →
                </button>
              )}
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white">
                Shipping at Checkout
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Check available shipping methods and costs after entering your delivery details.
              </p>
              {onTrackClick && (
                <button
                  onClick={onTrackClick}
                  className="mt-1 text-[10px] sm:text-[11px] font-bold underline text-[#FFCDF2] hover:text-white transition-colors cursor-pointer block"
                >
                  Track My Order →
                </button>
              )}
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white">
                Product Information
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Read the published description and manufacturer’s packaging before use.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white">
                Store Support
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Check published store policies and contact Li Fei Beauty with any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
