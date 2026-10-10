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
          {type === 'shipping' ? <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p className="font-semibold">Li Fei Beauty</p>
            <p>At Li Fei Beauty, we aim to provide a smooth and transparent shopping experience. Please review our shipping policy before placing your order.</p>
            <h2 className="font-bold text-slate-900">1. Order Processing</h2>
            <p>Orders are processed after payment has been confirmed. Processing times may vary depending on product availability and order volume. If there is a significant delay affecting your order, we will make reasonable efforts to notify you.</p>
            <h2 className="font-bold text-slate-900">2. Shipping Methods and Costs</h2>
            <p>Available shipping methods, shipping charges, and estimated delivery information will be displayed at checkout when available, based on your delivery address and the shipping options offered for your order.</p>
            <p>Please review these details carefully before completing your purchase.</p>
            <h2 className="font-bold text-slate-900">3. Delivery Times</h2>
            <p>Delivery times vary depending on the destination, shipping method, supplier processing, and carrier operations. Any delivery estimates provided at checkout are estimates and are not guaranteed unless explicitly stated otherwise.</p>
            <h2 className="font-bold text-slate-900">4. Order Tracking</h2>
            <p>When tracking information is available, it will be provided using the contact details supplied at checkout. Tracking updates may take time to appear after an order has been dispatched.</p>
            <h2 className="font-bold text-slate-900">5. Incorrect Addresses</h2>
            <p>Customers are responsible for providing accurate shipping information. Please contact us as soon as possible if you notice an error. We cannot guarantee that an address can be changed after an order has been processed or dispatched.</p>
            <h2 className="font-bold text-slate-900">6. Delayed, Lost, or Damaged Orders</h2>
            <p>If your order is delayed, appears lost, or arrives damaged, please contact our customer support team with your order number and relevant details. We will review the issue and assist in accordance with our applicable policies and consumer protection obligations.</p>
            <h2 className="font-bold text-slate-900">7. International Shipping</h2>
            <p>International shipping availability, costs, delivery estimates, customs charges, and import requirements depend on the destination and the options available at checkout. Any applicable duties or taxes will be handled as disclosed during checkout or as required by law.</p>
            <h2 className="font-bold text-slate-900">8. Contact Us</h2>
            <p>For shipping questions or assistance with an order, please contact Li Fei Beauty through the <button onClick={onOpenContact} className="text-[#B31940] underline cursor-pointer">contact page</button> on our website.</p>
            <p>Li Fei Beauty — Premium Korean Skincare &amp; Barrier Repair.</p>
          </div> : isLoading ? <p role="status" className="text-sm text-slate-600">Loading the current store policy…</p> : error ? <p role="alert" className="text-sm text-[#B31940]">{error}</p> : document ? <StorefrontHtml html={document.body} /> : <div className="space-y-3 text-sm text-slate-600"><p>This policy has not yet been published in the store. Please contact Li Fei Beauty for details before placing an order.</p><button onClick={onOpenContact} className="text-[#B31940] underline cursor-pointer">Contact Li Fei Beauty</button></div>}
        </div>
        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end shrink-0"><button onClick={onClose} className="bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-raspberry">Close</button></div>
      </div>
    </div>
  );
};
