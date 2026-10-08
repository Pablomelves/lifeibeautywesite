import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, Check, Droplets } from 'lucide-react';
import { Product } from '../types';

interface BeforeAfterRollingFacialProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const BeforeAfterRollingFacial: React.FC<BeforeAfterRollingFacialProps> = ({
  products,
  onSelectProduct,
  onAddToCart
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const rollerProduct = products.find((p) => p.id === 8) || products[0];

  const steps = [
    { title: "Step 1: Prep with Serum", desc: "Dispense 3–4 drops of Medicube PDRN Pink for effortless slip." },
    { title: "Step 2: Neck Drainage", desc: "Roll upward from collarbone to open lymphatic channels." },
    { title: "Step 3: Jawline Contour", desc: "Glide along the jawline toward earlobes with medium pressure." },
    { title: "Step 4: Precision Under-Eye", desc: "Use the micro quartz stone outward to instantly depuff bags." }
  ];

  return (
    <section id="rolling-facial" className="py-16 sm:py-24 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cryo Lymphatic Sculpting</span>
          </div>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-wide text-stone-900">
            Real Clinical Contour Results
          </h2>
          <p className="text-sm sm:text-base text-stone-500 mt-2">
            Dual-node Brazilian Rose Quartz crystal depuffs morning congestion and drives active PDRN peptides 94% deeper.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Interactive Before / After Comparison */}
          <div className="lg:col-span-7">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 select-none">
              {/* After Image (Base) */}
              <img
                src="/rolling/after.jpg"
                alt="After 10-Minute Facial Rolling"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute bottom-4 right-4 bg-stone-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                After 10-Min Cryo Sculpt
              </span>

              {/* Before Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src="/rolling/before.jpg"
                  alt="Before Facial Rolling"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 bg-white/90 text-stone-900 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                  Before Treatment
                </span>
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white text-stone-900 rounded-full shadow-lg flex items-center justify-center text-xs font-bold">
                  ⇄
                </div>
              </div>

              {/* Invisible Range Input Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                aria-label="Before and after comparison slider"
              />
            </div>
            <p className="text-center text-xs text-stone-400 mt-3">
              Drag the slider to compare facial depuffing and jawline definition
            </p>
          </div>

          {/* Right: Product Highlight & Ritual Steps */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200/80 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Seoul Sculpting Tool
                </span>
                <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full">
                  -38% Puffiness
                </span>
              </div>

              <h3 className="text-2xl font-bold text-stone-900 mb-2">
                {rollerProduct.name}
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                {rollerProduct.fullDescription || rollerProduct.subtitle}
              </p>

              {/* Key Technique Steps */}
              <div className="space-y-3 mb-6">
                {steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-stone-800">{st.title}: </span>
                      <span className="text-stone-600">{st.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-stone-900">{rollerProduct.price}</span>
                  {rollerProduct.compareAtPrice && (
                    <span className="text-xs text-stone-400 line-through ml-2">
                      {rollerProduct.compareAtPrice}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectProduct(rollerProduct)}
                    className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Reviews ({rollerProduct.reviewsCount})
                  </button>
                  <button
                    onClick={() => onAddToCart(rollerProduct)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-black rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Add Tool
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
