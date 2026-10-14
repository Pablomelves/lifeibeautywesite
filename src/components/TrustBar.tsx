import React from 'react';
import { Award, Sparkles, ShieldCheck, Truck } from 'lucide-react';

interface TrustBarProps {
  onVerifyClick?: () => void;
  onTrackClick?: () => void;
}

export const TrustBar: React.FC<TrustBarProps> = ({ onVerifyClick, onTrackClick }) => {
  const features = [
    {
      icon: Award,
      title: 'Premium Beauty',
      description: 'Carefully selected global and Korean brands with proven clinical efficacy.',
      actionText: 'Explore Brands →',
      action: onVerifyClick,
    },
    {
      icon: Truck,
      title: 'Free US Shipping',
      description: 'On qualifying orders over $75. Complimentary tracking sent to your inbox.',
      actionText: onTrackClick ? 'Track Order →' : null,
      action: onTrackClick,
    },
    {
      icon: ShieldCheck,
      title: '100% Authentic',
      description: 'Sourced directly from authorized distributors & certified Seoul laboratories.',
      actionText: 'Verify Sourcing →',
      action: onVerifyClick,
    },
    {
      icon: Sparkles,
      title: '30-Day Guarantee',
      description: 'Easy returns and dedicated customer care for a worry-free skincare journey.',
      actionText: null,
      action: undefined,
    },
  ];

  return (
    <section 
      aria-label="Trust and Benefits" 
      className="site-trust-strip bg-[#FFF1F4] border-y border-[#FFCDF2]/50 py-8 sm:py-10 font-inter"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="flex flex-col sm:flex-row items-start gap-3 sm:gap-3.5 p-3 sm:p-4 rounded-2xl bg-white/70 border border-[#FFCDF2]/40 shadow-2xs transition-all hover:bg-white hover:shadow-xs"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460] shrink-0 shadow-2xs">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight text-[#171417]">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6F6870] mt-1 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                  {feature.actionText && feature.action && (
                    <button
                      type="button"
                      onClick={feature.action}
                      className="mt-1.5 text-[10px] sm:text-[11px] font-semibold text-[#EC3460] hover:text-[#B31940] underline transition-colors cursor-pointer block"
                    >
                      {feature.actionText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
