import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { FAQS } from '../data/storeData';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#FFF5FA] font-inter border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-2">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
            ANSWERS ABOUT YOUR K-BEAUTY RITUAL
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Everything you need to know about formula authenticity, international shipping, and layering compatibility.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#FFCDF2]/60 overflow-hidden shadow-xs transition-all hover:border-[#EC3460]/40"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FFF0F9]/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-[#B31940] bg-[#FFF0F9] border border-[#FFCDF2]/50 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#EC3460]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#FFCDF2]/40 animate-in fade-in duration-200 bg-[#FFF0F9]/30">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
