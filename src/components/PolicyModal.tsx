import React from 'react';
import { X, ShieldCheck, Truck, RefreshCw, Lock, FileText } from 'lucide-react';

interface PolicyModalProps {
  isOpen?: boolean;
  type: 'shipping' | 'returns' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose }) => {
  if (isOpen === false || !type) return null;

  const contentMap = {
    shipping: {
      title: 'SHIPPING & SEOUL LOGISTICS',
      subtitle: 'Temperature-Controlled Fast Global Dispatch',
      icon: Truck,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Free Express Shipping:</strong> Orders over $50 qualify for complimentary courier delivery worldwide. Orders under $50 ship for a flat rate of $4.99.
          </p>
          <p>
            <strong>Delivery Windows:</strong>
            <br />• United States & Canada: 2–4 business days via DHL / FedEx Express.
            <br />• United Kingdom & Europe: 3–5 business days.
            <br />• Australia & Asia-Pacific: 2–4 business days.
          </p>
          <p>
            <strong>Climate Preservation:</strong> All peptide, enzyme, and DNA-active serums are packaged in insulated thermal cartons to shield against temperature spikes in transit.
          </p>
          <p>
            <strong>Tracking:</strong> You will receive an instant email and SMS with live GPS tracking immediately upon dispatch from our Seoul fulfillment center.
          </p>
        </div>
      )
    },
    returns: {
      title: '30-DAY RADIANT SKIN GUARANTEE',
      subtitle: 'Hassle-Free Returns & Skin Consultations',
      icon: RefreshCw,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            We stand behind every formula we curate. If a product does not agree with your skin barrier or deliver your expected radiance, you may return it within <strong>30 days of receipt</strong> for a full refund or store exchange.
          </p>
          <p>
            <strong>Simple Return Process:</strong>
            <br />1. Contact us at <code className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">care@lifeibeauty.com</code> with your order number.
            <br />2. We will generate a prepaid return shipping label.
            <br />3. Drop the parcel at any postal carrier drop-off location.
          </p>
          <p>
            Refunds are credited back to your original payment method (Apple Pay, Credit Card, PayPal) within 2–3 business days of receipt.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'PRIVACY POLICY',
      subtitle: 'Transparent, Encrypted Data Protection',
      icon: Lock,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            At Li Fei Beauty, your privacy is inviolable. We never sell, rent, or trade your personal or skin-type data to third-party data brokers.
          </p>
          <p>
            <strong>Data Security:</strong> All transactional information is handled via Level 1 PCI-DSS certified payment processors with 256-bit AES encryption.
          </p>
          <p>
            You may request complete erasure of your Glow Club account or customer profile at any time by contacting our data protection officer.
          </p>
        </div>
      )
    },
    terms: {
      title: 'TERMS OF SERVICE',
      subtitle: 'Clear Customer Rights & Standards',
      icon: FileText,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            By accessing or ordering from Li Fei Beauty, you agree to our terms of service governing authentic cosmetic sales, pricing, and certified Seoul procurement.
          </p>
          <p>
            All content, brand assets, and clinical evaluations displayed are proprietary to Li Fei Beauty and authorized partner laboratories.
          </p>
          <p>
            Products are strictly for personal cosmetic topical application as directed on packaging.
          </p>
        </div>
      )
    }
  };

  const item = contentMap[type];
  const Icon = item.icon;

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative my-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F9] border border-[#FFCDF2] text-[#EC3460] flex items-center justify-center shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900">
                {item.title}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {item.subtitle}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {item.body}
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-raspberry"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
