import React from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Product } from '../types';

interface SkincareRoutineProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SkincareRoutine: React.FC<SkincareRoutineProps> = ({
  products,
  onSelectProduct
}) => {
  const steps = [
    {
      step: "01",
      name: "Purify & Tone",
      desc: "Swipe embossed dual-texture pads to dissolve micro-impurities and sebum.",
      productId: 5
    },
    {
      step: "02",
      name: "Flood Hydration",
      desc: "Press 7-molecular hyaluronic booster essence to open cellular moisture channels.",
      productId: 6
    },
    {
      step: "03",
      name: "Active Ampoule",
      desc: "Infuse biomimetic salmon PDRN to restore loosened dermal matrix and glass glow.",
      productId: 1
    },
    {
      step: "04",
      name: "Cryo Barrier Lock",
      desc: "Massage ceramide cushion cream with cooled Rose Quartz crystal to lift and seal.",
      productId: 8
    }
  ];

  return (
    <section id="skincare-routine" className="py-16 sm:py-24 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Korean Derma Ritual</span>
          </div>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-wide text-stone-900">
            4-Step Glass Skin Architecture
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Layered synergy designed to deliver deep cellular hydration, tightened pore texture, and reflective glass luminescence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const product = products.find((p) => p.id === item.productId) || products[0];

            return (
              <div
                key={idx}
                onClick={() => onSelectProduct(product)}
                className="group bg-stone-50/70 hover:bg-stone-50 rounded-2xl p-6 border border-stone-200/80 transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-anton text-3xl text-rose-600/80">{item.step}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                      Step {item.step}
                    </span>
                  </div>

                  <div
                    className="w-full aspect-square rounded-xl mb-4 p-4 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: product.panel || '#fff' }}
                  >
                    {product.src ? (
                      <img
                        src={product.src}
                        alt={product.name}
                        className="max-h-full w-auto object-contain drop-shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-stone-200 rounded-lg" />
                    )}
                  </div>

                  <h4 className="font-bold text-stone-900 text-base mb-1">{item.name}</h4>
                  <p className="text-xs text-rose-700 font-semibold mb-2">{product.name}</p>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">{product.price}</span>
                  <span className="font-semibold text-rose-600 group-hover:underline flex items-center gap-1">
                    Ritual Info <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
