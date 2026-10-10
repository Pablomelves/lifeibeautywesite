import React from 'react';
import { ShieldCheck, Sparkles, ThermometerSnowflake, Lock, Award, HeartHandshake } from 'lucide-react';

export const WhyLiFei: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Current Product Catalog',
      desc: 'Product names, descriptions, images, and options are retrieved from the connected Shopify store.'
    },
    {
      icon: ThermometerSnowflake,
      title: 'Destination-Based Shipping',
      desc: 'Shopify calculates available delivery options using your address and the actual items in your bag.'
    },
    {
      icon: Sparkles,
      title: 'Read Before You Choose',
      desc: 'Review the product description and manufacturer’s packaging for ingredients and directions.'
    },
    {
      icon: Lock,
      title: 'Shopify Checkout',
      desc: 'Orders are completed in Shopify checkout. Available payment methods are displayed there.'
    },
    {
      icon: Award,
      title: 'Product Availability',
      desc: 'The storefront retrieves current product availability and checks selected items with Shopify before checkout.'
    },
    {
      icon: HeartHandshake,
      title: 'Store Policies and Help',
      desc: 'Read the published store policies or contact Li Fei Beauty for information that is not yet available.'
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
            Find product details, available options, and store information before choosing your skincare.
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
