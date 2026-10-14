import React from 'react';
import { Heart, ShieldCheck, Truck, Headphones } from 'lucide-react';

export const WhyLiFei: React.FC = () => {
  const highlights = [
    {
      icon: Heart,
      title: 'Cruelty-Free & Clean',
      description: 'Mindfully formulated without parabens or sulfates. 100% cruelty-free.',
    },
    {
      icon: ShieldCheck,
      title: 'Dermatologist Tested',
      description: 'Clinical-grade formulations certified safe for sensitive skin types.',
    },
    {
      icon: Headphones,
      title: 'Sustainably Sourced',
      description: 'Ethically harvested botanicals and eco-friendly recyclable packaging.',
    },
    {
      icon: Truck,
      title: 'Fast Worldwide Delivery',
      description: 'Reliable, insured delivery to your doorstep. Free US shipping over $75.',
    },
  ];

  return (
    <section 
      aria-label="Lifei Beauty Brand Story and Values"
      className="site-brand-story-strip py-14 sm:py-20 bg-[#EC3460] text-white font-inter"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 block mb-2">
            LIFE LOOKS BETTER WITH LIFEI · OUR PROMISE
          </span>
          <h2 className="font-anton text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-none">
            BEAUTY THAT CARES
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-3 leading-relaxed max-w-lg mx-auto">
            Experience authentic Korean skincare and international beauty with transparent sourcing, proven efficacy, and caring customer service.
          </p>
        </div>

        {/* 4 Horizontally Aligned Highlights on Desktop, 2x2 on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-white/20 shadow-sm hover:bg-white/15 transition-all duration-300 flex flex-col justify-between text-center sm:text-left"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 sm:mb-5 shadow-2xs mx-auto sm:mx-0">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wide mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
