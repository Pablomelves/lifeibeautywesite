import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { StorefrontHtml } from './StorefrontHtml';
import type { StorefrontDocument } from '../services/storefrontContent';

export const FaqSection: React.FC<{ document?: StorefrontDocument | null }> = ({ document }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: 'How do I choose a product option?', a: 'Open a product to see its current description, price, available variants, and stock status from the store catalog. Sold-out options cannot be purchased.' },
    { q: 'When are shipping costs calculated?', a: 'Shopify calculates available shipping methods and costs at checkout after you enter your delivery details. Final costs depend on your destination and the items in your bag.' },
    { q: 'Where can I find ingredients and directions?', a: 'Refer to the published product description and manufacturer’s packaging. No ingredients, treatment results, or suitability claims are assumed when that information is unavailable.' },
    { q: 'Where can I check returns or request help?', a: 'Use the Returns and Refunds and Contact links in the footer. If a policy is not published, contact Li Fei Beauty for details before placing an order.' },
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
            Shopping & Store FAQs
          </h2>
        </div>

        <div className="space-y-3">
          {document && <StorefrontHtml html={document.body} />}
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
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
