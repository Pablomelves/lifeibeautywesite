import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  type: string;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const contentMap: Record<string, { title: string; body: string[] }> = {
    shipping: {
      title: "Global Shipping & Delivery Policy",
      body: [
        "Li Fei Beauty processes all orders directly from our climate-controlled Seoul laboratory facility within 24–48 business hours.",
        "Complimentary express courier shipping applies automatically to all orders over $40. Standard delivery times are 3–5 business days to North America and Europe with tracked end-to-end temperature protection.",
        "Every dispatch is vacuum-sealed with authentic Korean holographic security tags to ensure zero oxidation."
      ]
    },
    returns: {
      title: "30-Day Seoul Satisfaction Guarantee",
      body: [
        "We stand firmly behind the clinical efficacy of every botanical and bio-compatible formula we curate.",
        "If you do not observe marked improvement in dermal hydration or skin elasticity within 30 days, we will gladly issue a complete refund or exchange.",
        "To initiate a return, simply contact our concierge team at concierge@lifeibeauty.com with your order number."
      ]
    },
    privacy: {
      title: "Privacy & Data Protection",
      body: [
        "Your personal data, checkout records, and payment identifiers are encrypted using industry-standard 256-bit AES protocols.",
        "We never sell or distribute your private browsing or purchase data to third-party marketing networks.",
        "You retain complete rights to request data erasure or export at any time."
      ]
    },
    terms: {
      title: "Terms of Service",
      body: [
        "By accessing and placing orders with Li Fei Beauty, you agree to our fair usage standards and authentic resale protection policies.",
        "All formulations are dermatologically evaluated; please perform a patch test prior to initial full facial application.",
        "Discounts and promotional codes are subject to single-order redemption limits."
      ]
    }
  };

  const current = contentMap[type] || contentMap.shipping;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-base">{current.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed max-h-[70vh] overflow-y-auto">
          {current.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-stone-100 flex justify-end bg-stone-50/30">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
