import React, { useState } from 'react';
import { ShieldCheck, ArrowUp, Instagram, Youtube, Facebook, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' 
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer 
      aria-label="Site Footer" 
      className="site-footer bg-[#171417] text-white font-inter border-t border-white/10 pt-14 sm:pt-20 pb-12"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid: 5 columns desktop, 2 columns tablet, stacked mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-white/10">
          
          {/* Group 1: Lifei Beauty Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src="/BC0C39FF-CA32-434C-8D58-12498BC5C2E2.png" 
                alt="LI FEI BEAUTY" 
                className="h-9 sm:h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#EC3460] block mb-2">
              Life looks better with lifei
            </span>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed mb-6 font-normal">
              Your destination for authentic Korean skincare, clinical formulations, and international beauty brands. Sourced with integrity, delivered with care.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mb-6">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LiFei Beauty on Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#EC3460] flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <Instagram size={16} aria-hidden="true" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LiFei Beauty on YouTube"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#EC3460] flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <Youtube size={16} aria-hidden="true" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LiFei Beauty on Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#EC3460] flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <Facebook size={16} aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#FFCDF2] font-semibold bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl inline-flex">
              <ShieldCheck size={16} className="text-[#EC3460]" aria-hidden="true" />
              <span>Verified Direct Sourcing &amp; Secure Checkout</span>
            </div>
          </div>

          {/* Group 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button 
                  type="button"
                  onClick={() => onNavigateSection?.('hero')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onNavigateSection?.('bestsellers')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  Shop Best Sellers
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onNavigateSection?.('shop-by-brand')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  Curated Brands
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenAbout?.()}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onNavigateSection?.('routine')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  Skincare Blog &amp; Rituals
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onOpenContact?.()}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Group 3: Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              {onOpenTrackOrder && (
                <li>
                  <button 
                    type="button"
                    onClick={onOpenTrackOrder}
                    className="hover:text-white transition-colors cursor-pointer text-[#FFCDF2] font-semibold flex items-center gap-1.5"
                  >
                    <span>Track My Order</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460] animate-pulse" aria-hidden="true" />
                  </button>
                </li>
              )}
              <li>
                <a 
                  href="/policies/shipping-policy" 
                  onClick={event => { if (onOpenPolicy) { event.preventDefault(); onOpenPolicy('shipping'); } }}
                  className="hover:text-white hover:underline transition-colors cursor-pointer block"
                >
                  Shipping &amp; Delivery Policy
                </a>
              </li>
              <li>
                <a 
                  href="/policies/refund-policy" 
                  onClick={event => { if (onOpenPolicy) { event.preventDefault(); onOpenPolicy('returns'); } }}
                  className="hover:text-white hover:underline transition-colors cursor-pointer block"
                >
                  Returns &amp; Refund Policy
                </a>
              </li>
              <li>
                <a 
                  href="/policies/terms-of-service" 
                  onClick={event => { if (onOpenPolicy) { event.preventDefault(); onOpenPolicy('terms'); } }}
                  className="hover:text-white hover:underline transition-colors cursor-pointer block"
                >
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a 
                  href="/policies/privacy-policy" 
                  onClick={event => { if (onOpenPolicy) { event.preventDefault(); onOpenPolicy('privacy'); } }}
                  className="hover:text-white hover:underline transition-colors cursor-pointer block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => onNavigateSection?.('faq-section')}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Group 4 & 5: Contact Us & Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Contact &amp; Newsletter
            </h4>
            <p className="text-xs text-white/70 mb-3 leading-relaxed">
              Questions regarding formulations, orders, or tracking?
            </p>
            <p className="text-xs text-white/90 font-semibold mb-4">
              <a href="mailto:support@lifeibeauty.com" className="hover:text-[#EC3460] underline">
                support@lifeibeauty.com
              </a>
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white block mb-1.5">
                Stay In The Glow
              </span>
              <p className="text-[11px] text-white/60 mb-2">
                Subscribe for exclusive drops and skincare wisdom.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 text-emerald-400 text-xs">
                  <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      aria-label="Email address for newsletter"
                      className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#EC3460] flex-1 min-w-0"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      Join
                    </button>
                  </div>
                  {error && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} LI FEI BEAUTY. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium tracking-wide text-white/60">
            <span>Free shipping on orders over $75</span>
            <span aria-hidden="true">·</span>
            <span>100% Genuine Korean Skincare</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>

      </div>
    </footer>
  );
};
