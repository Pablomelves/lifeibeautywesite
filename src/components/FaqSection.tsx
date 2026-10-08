import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Are Li Fei Beauty formulations 100% authentic and temperature-monitored?",
      a: "Yes. Every single batch is produced and verified in Seoul's premier dermatological laboratories. We ship directly under climate-controlled conditions to protect delicate actives like bio-compatible Salmon PDRN, EGF, and live Ferments."
    },
    {
      q: "How does the Rose Quartz Facial Roller enhance serum absorption?",
      a: "Our Grade-A Brazilian Rose Quartz crystal provides gentle cryo-constriction followed by micro-circulation stimulation. Rolling over active ampoules increases topical dermal penetration by up to 94% compared to hand application alone."
    },
    {
      q: "Can I use Medicube PDRN Pink and EGF NAD serums together?",
      a: "Absolutely. Layering them provides ultimate cellular synergy: PDRN stimulates collagen synthesis and rapid skin barrier rebound, while NAD+ powers mitochondrial ATP to smooth deeper fine lines."
    },
    {
      q: "What is your return and satisfaction policy?",
      a: "We offer a 30-day 100% satisfaction guarantee. If your skin does not experience noticeable hydration and barrier comfort, contact our Seoul care team for a hassle-free refund or exchange."
    }
  ];

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-[#FAF9F6] border-t border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-anton text-3xl sm:text-4xl uppercase text-stone-900 tracking-wide">
            Seoul Science & Ritual FAQs
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                >
                  <span className="font-bold text-stone-900 text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-rose-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100 animate-in fade-in duration-200">
                    {faq.a}
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
