import React from 'react';
import { ShieldCheck, Sparkles, ThermometerSnowflake, Lock, Award, HeartHandshake } from 'lucide-react';

export const WhyLiFei: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Seoul Sourcing',
      desc: 'We circumvent secondary gray-market wholesalers. Every bottle is sourced directly from certified Seoul brand laboratories with holographic manufacturer verification seals.'
    },
    {
      icon: ThermometerSnowflake,
      title: 'Climate-Preserved Efficacy',
      desc: 'Active bio-peptides, PDRN DNA, and unstable vitamins degrade in hot cargo holds. Our logistics chain uses climate-buffered containers to ensure maximum topical potency.'
    },
    {
      icon: Sparkles,
      title: 'Zero-Filler Ingredient Integrity',
      desc: 'Every formula in our boutique is individually evaluated for bio-compatibility, EWG green-grade certification, and proven clinical dermal absorption.'
    },
    {
      icon: Lock,
      title: 'Bank-Grade Encrypted Checkout',
      desc: 'Shop with complete peace of mind. We utilize 256-bit SSL encryption and full support for Apple Pay, Google Pay, Shop Pay, and major credit cards.'
    },
    {
      icon: Award,
      title: 'Clinical Efficacy & Transparency',
      desc: 'We publish full clinical trial statistics, ingredient percentages, and exact molecular weights so you know exactly what is penetrating your skin barrier.'
    },
    {
      icon: HeartHandshake,
      title: '30-Day Radiant Skin Guarantee',
      desc: 'Your skin journey is personal. If a formula doesn’t suit your skin type within 30 days, enjoy simple returns or complimentary consultation with our skincare specialists.'
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FFF5FA] font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-2">
            LIFE LOOKS BETTER WITH LIFEI · THE LI FEI STANDARD
          </span>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
            WHY TRUST LI FEI BEAUTY?
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            The skincare you put on your face must be pure, potent, and genuine. We built Li Fei Beauty on unrelenting authenticity and scientific transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#FFCDF2]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:border-[#EC3460]/40"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460] mb-6">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg uppercase tracking-wide mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
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
