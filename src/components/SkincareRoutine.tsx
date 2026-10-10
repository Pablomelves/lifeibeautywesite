import React, { useState } from 'react';
import { ResponsiveProductImage } from './ResponsiveProductImage';
import { ROUTINE_STEPS } from '../data/storeData';
import { Product } from '../types';
import { Check, ArrowRight, Sparkles, Droplets } from 'lucide-react';

interface SkincareRoutineProps {
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  products?: Product[];
}

export const SkincareRoutine: React.FC<SkincareRoutineProps> = ({
  onQuickView,
  onAddToCart,
  products,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(3); // Default to Step 3 (Treat)

  const catalog = products || [];
  const activeStepData = ROUTINE_STEPS.find((s) => s.step === selectedStep) || ROUTINE_STEPS[2];
  let stepProducts = catalog.filter((p) => activeStepData.recommendedProductIds.includes(p.id));
  if (stepProducts.length === 0) {
    stepProducts = catalog.slice(0, 2);
  }

  return (
    <section id="routine" className="py-20 sm:py-28 bg-white font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-2">
            THE KOREAN GLASS SKIN METHOD
          </span>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
            HOW THE 5-STEP RITUAL WORKS
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Korean skincare relies on strategic layering from lowest to highest viscosity: Cleanse → Prep → Treat → Seal → Protect.
          </p>
        </div>

        {/* Step Indicator Navigation */}
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-12 overflow-x-auto pb-4 gap-2">
          {ROUTINE_STEPS.map((step) => {
            const isActive = step.step === selectedStep;
            return (
              <button
                key={step.step}
                onClick={() => setSelectedStep(step.step)}
                className={`flex flex-col items-center min-w-[120px] p-3 rounded-2xl transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry scale-105'
                    : 'bg-white text-slate-600 border-[#FFCDF2]/60 hover:bg-[#FFF0F9] hover:border-[#EC3460]/40'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-[#FFCDF2]' : 'text-slate-400'}`}>
                  Step 0{step.step}
                </span>
                <span className="text-xs font-semibold text-center leading-tight">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Details & Recommendations */}
        <div className="bg-[#FFF5FA] rounded-3xl p-6 sm:p-12 border border-[#FFCDF2]/60 shadow-xs max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-[#FFCDF2]/60 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#EC3460]">
                  STEP 0{activeStepData.step} PHILOSOPHY
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {activeStepData.koreanName}
                </span>
              </div>
              <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-tight text-slate-900">
                {activeStepData.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {activeStepData.description}
              </p>
            </div>

            {/* Pro Tip Box */}
            <div className="bg-white p-4 rounded-2xl border border-[#FFCDF2] shadow-xs max-w-xs shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#EC3460] flex items-center gap-1 mb-1">
                <Sparkles size={12} />
                Seoul Esthetician Tip
              </span>
              <p className="text-xs text-slate-700 leading-snug">
                {activeStepData.tip}
              </p>
            </div>
          </div>

          {/* Recommended Formulas for this Step */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
              RECOMMENDED STEP 0{activeStepData.step} FORMULAS:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stepProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onQuickView?.(product)}
                  className="bg-white rounded-2xl p-4 border border-[#FFCDF2]/50 shadow-xs hover:shadow-md transition-all flex gap-4 items-center cursor-pointer group hover:border-[#EC3460]/40"
                >
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden relative shrink-0 border border-slate-200/50"
                    style={{ backgroundColor: product.panel }}
                  >
                    <ResponsiveProductImage
                      src={product.src}
                      alt={product.name}
                      className="w-full h-full object-contain object-center transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs uppercase text-slate-900 truncate group-hover:text-[#EC3460] transition-colors">
                      {product.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate mb-2">
                      {product.subtitle}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                        {product.price}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product);
                          }}
                          className="text-[9px] bg-slate-50 hover:bg-[#FFF0F9] text-slate-900 hover:text-[#EC3460] border border-slate-200 font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product);
                          }}
                          className="text-[9px] bg-[#EC3460] hover:bg-[#D8224F] text-white font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-raspberry"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
