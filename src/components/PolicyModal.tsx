import React from 'react';
import { X, Truck, RefreshCw, Lock, FileText } from 'lucide-react';
import { StorefrontHtml } from './StorefrontHtml';
import type { PolicyType, StorefrontDocument } from '../services/storefrontContent';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface PolicyModalProps {
  isOpen?: boolean;
  type: PolicyType | null;
  onClose: () => void;
  document?: StorefrontDocument | null;
  isLoading?: boolean;
  error?: string | null;
  onOpenContact?: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose, document, isLoading, error, onOpenContact }) => {
  const modal = useModalAccessibility(isOpen !== false && !!type, onClose);
  if (isOpen === false || !type) return null;
  const labels = { shipping: 'Shipping Policy', returns: 'Returns and Refunds Policy', privacy: 'Privacy Policy', terms: 'Terms of Service' };
  const icons = { shipping: Truck, returns: RefreshCw, privacy: Lock, terms: FileText };
  const Icon = icons[type];
  return (
    <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200" onClick={onClose}>
      <div ref={modal} role="dialog" aria-modal="true" aria-labelledby="policy-title" className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative my-auto p-6 sm:p-8 max-h-[92dvh] flex flex-col" onClick={event => event.stopPropagation()}>
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6 shrink-0">
          <div className="flex items-center gap-3"><Icon size={24} className="text-[#EC3460]" /><div><h3 id="policy-title" className="font-anton text-2xl sm:text-3xl uppercase tracking-tight text-slate-900">{labels[type]}</h3><span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Li Fei Beauty store information</span></div></div>
          <button onClick={onClose} className="p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer" aria-label="Close policy"><X size={18} /></button>
        </div>
        <div className="min-h-0 overflow-y-auto pr-2">
          {isLoading ? <p role="status" className="text-sm text-slate-600">Loading the current store policy…</p> : error ? <p role="alert" className="text-sm text-[#B31940]">{error}</p> : document ? <StorefrontHtml html={document.body} /> : <div className="space-y-3 text-sm text-slate-600"><p>This policy has not yet been published in the store. Please contact Li Fei Beauty for details before placing an order.</p>{type === 'shipping' && <p>Available shipping methods and costs are calculated by Shopify checkout after you enter your delivery details. No delivery date or shipping price is assumed here.</p>}<button onClick={onOpenContact} className="text-[#B31940] underline cursor-pointer">Contact Li Fei Beauty</button></div>}
        </div>
        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end shrink-0"><button onClick={onClose} className="bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-raspberry">Close</button></div>
      </div>
    </div>
  );
};
