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
                100% Authentic Guaranteed
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Direct Seoul laboratory sourcing with verifiable manufacturer batch codes.
              </p>
              {onVerifyClick && (
                <button
                  onClick={onVerifyClick}
                  className="mt-1 text-[10px] sm:text-[11px] font-bold underline text-[#FFCDF2] hover:text-white transition-colors cursor-pointer block"
                >
                  Verify Authenticity →
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
                Free Express Sourcing
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Fast courier dispatch on orders over $50 with real-time end-to-end tracking.
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
                Clinical Bio-Actives
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                PDRN Salmon DNA, NAD+ Coenzymes & Pure Kojic Acid for genuine glass skin.
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
                30-Day Radiant Guarantee
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                Try your ritual risk-free. Easy returns or expert skincare adjustments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
