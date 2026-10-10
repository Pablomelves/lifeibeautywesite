import React from 'react';
import { ShieldCheck, ArrowUp, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  onOpenPolicy?: (type: 'shipping' | 'returns' | 'privacy' | 'terms') => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenTrackOrder?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicy,
  onOpenAbout,
  onOpenContact,
  onNavigateSection,
  onOpenTrackOrder,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white font-inter border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="font-anton text-3xl uppercase tracking-tight text-white mb-1">
              LI FEI BEAUTY
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#A64D63] block mb-2">
              Life looks better with lifei
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60 block mb-4">
              SEOUL · AUTHENTIC KOREAN SKINCARE
            </span>
            <p className="text-xs text-white/70 max-w-sm leading-relaxed mb-6">
              Curated clinical skincare from certified Seoul laboratories. Engineered for authentic glass-skin radiance, barrier integrity, and cellular rejuvenation.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#FFCDF2] font-semibold bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl inline-flex">
              <ShieldCheck size={16} className="text-[#EC3460]" />
              <span>100% Seoul Direct Batch Authenticity</span>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button 
                  onClick={() => onNavigateSection?.('bestsellers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection?.('concerns')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  PDRN & Peptide Serums
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection?.('bestsellers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bio-Collagen Masks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection?.('bestsellers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Barrier Cushion Creams
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection?.('routine')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  5-Step Korean Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              {onOpenTrackOrder && (
                <li>
                  <button 
                    onClick={onOpenTrackOrder}
                    className="hover:text-white transition-colors cursor-pointer text-[#FFCDF2] font-semibold flex items-center gap-1.5"
                  >
                    <span>Track My Order</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460] animate-pulse" />
                  </button>
                </li>
              )}
              <li>
                <button 
                  onClick={() => onOpenPolicy?.('shipping')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy?.('returns')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Returns & Refunds (30 Days)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection?.('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ & Sourcing Guide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenContact?.()}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Skincare Support
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: The House */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/90 mb-4">
              The House
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button 
                  onClick={() => onOpenAbout?.()}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Li Fei Beauty
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy?.('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy?.('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <span className="text-white/40 block">
                  Seoul Office: Gangnam-gu, Teheran-ro 152
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} LI FEI BEAUTY CO., LTD. All rights reserved.
          </div>

          {/* Payment Badges Simulator */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-wider text-white/60">
            <span className="border border-white/10 px-2 py-1 rounded bg-white/5">Apple Pay</span>
            <span className="border border-white/10 px-2 py-1 rounded bg-white/5">Visa</span>
            <span className="border border-white/10 px-2 py-1 rounded bg-white/5">Mastercard</span>
            <span className="border border-white/10 px-2 py-1 rounded bg-white/5">Shop Pay</span>
            <span className="border border-white/10 px-2 py-1 rounded bg-white/5">PayPal</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
