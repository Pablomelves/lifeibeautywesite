import React from 'react';
import { ShieldCheck, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (type: string) => void;
  onOpenAbout: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, onOpenAbout, onOpenAdmin }) => {
  return (
    <footer className="bg-stone-950 text-stone-400 text-xs py-14 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <span className="font-anton text-2xl text-white tracking-widest uppercase block">
              LI FEI BEAUTY
            </span>
            <p className="text-xs text-stone-500 leading-relaxed">
              Curated clinical Korean skincare and bio-compatible facial sculpting essentials direct from Seoul's top dermatological laboratories.
            </p>
            <div className="flex items-center gap-2 text-stone-400 text-[11px] pt-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>Certified 100% Authentic Korean Formulations</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Shop & Rituals</h4>
            <ul className="space-y-2">
              <li><a href="#bestsellers" className="hover:text-white transition-colors">Curated Serums</a></li>
              <li><a href="#rolling-facial" className="hover:text-white transition-colors">Rose Quartz Cryo Sculpt</a></li>
              <li><a href="#skincare-routine" className="hover:text-white transition-colors">4-Step Glass Skin Ritual</a></li>
              <li><a href="#faq-section" className="hover:text-white transition-colors">Seoul Efficacy Studies</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onOpenPolicy('shipping')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Global Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('returns')} className="hover:text-white transition-colors cursor-pointer text-left">
                  30-Day Satisfaction Guarantee
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Privacy Policy & Data Security
                </button>
              </li>
              <li>
                <button onClick={onOpenAbout} className="hover:text-white transition-colors cursor-pointer text-left">
                  About Li Fei Beauty & Seoul Labs
                </button>
              </li>
            </ul>
          </div>

          {/* Owner & Admin */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Store Administration</h4>
            <p className="text-[11px] text-stone-500 mb-3">
              Store owner dashboard for products, inventory, discounts, visual customizer, and analytics.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl border border-stone-800 text-xs transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Owner Admin Login</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>© {new Date().getFullYear()} Li Fei Beauty Inc. All rights reserved. Seoul · New York.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenPolicy('terms')} className="hover:text-stone-300 cursor-pointer">
              Terms of Service
            </button>
            <span>·</span>
            <button onClick={() => onOpenPolicy('privacy')} className="hover:text-stone-300 cursor-pointer">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
