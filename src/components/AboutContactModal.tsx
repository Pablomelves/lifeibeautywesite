import React, { useState } from 'react';
import { X, Send, Sparkles, MapPin, Mail, Phone, Check } from 'lucide-react';
import { StorefrontHtml } from './StorefrontHtml';
import { submitStoreForm } from '../services/forms';
import type { StorefrontDocument } from '../services/storefrontContent';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface AboutContactModalProps {
  isOpen?: boolean;
  mode?: 'about' | 'contact' | 'about-lifei' | string | null;
  onClose: () => void;
  aboutDocument?: StorefrontDocument | null;
  contactDocument?: StorefrontDocument | null;
}

export const AboutContactModal: React.FC<AboutContactModalProps> = ({ isOpen, mode = 'about', onClose, aboutDocument, contactDocument }) => {
  const modal = useModalAccessibility(isOpen !== false && !!mode, onClose);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', concern: 'General Inquiry' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = React.useRef(false);
  const inputId = React.useId();

  if (isOpen === false || (!mode && isOpen === undefined)) return null;

  const isContact = mode === 'contact';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending.current) return;
    pending.current = true; setSending(true); setError(null);
    try { await submitStoreForm('lifei-contact', { ...formData, 'bot-field': '' }); setSubmitted(true); }
    catch { setError('Your message could not be submitted. Please try again.'); }
    finally { pending.current = false; setSending(false); }
  };

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        ref={modal}
        className="w-full max-w-xl bg-white text-slate-900 rounded-3xl overflow-y-auto shadow-2xl relative my-auto p-6 sm:p-8 max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block mb-1">
              LI FEI BEAUTY
            </span>
            <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-tight text-slate-900">
              {!isContact ? 'ABOUT LI FEI BEAUTY' : 'CONTACT LI FEI BEAUTY'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {!isContact ? (
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            {aboutDocument ? <StorefrontHtml html={aboutDocument.body} /> : <><p>Li Fei Beauty offers the products shown in our current store catalog. Explore product descriptions, available options, and prices before adding an item to your bag.</p><p>Purchases are completed through Shopify checkout. Please contact us for any store information that is not yet published.</p></>}
          </div>
        ) : (
          <div>
            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-2 animate-in zoom-in-95">
                <Check size={28} className="mx-auto text-emerald-600" />
                <h4 className="font-bold text-sm uppercase">Message Received</h4>
                <p className="text-xs">
                  Your message has been submitted to Li Fei Beauty. No response time has been assumed.
                </p>
              </div>
            ) : (
              <form name="lifei-contact" method="POST" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <input type="hidden" name="form-name" value="lifei-contact" />
                {contactDocument && <StorefrontHtml html={contactDocument.body} />}
                {error && <p role="alert" className="text-[#B31940]">{error}</p>}
                <div>
                  <label htmlFor={inputId + '-name'} className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id={inputId + '-name'}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                    placeholder="Your name"
                    name="name"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor={inputId + '-email'} className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id={inputId + '-email'}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                    placeholder="Your email address"
                    name="email"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor={inputId + '-topic'} className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Topic
                  </label>
                  <select
                    id={inputId + '-topic'}
                    value={formData.concern}
                    onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                  >
                    <option>Product Question</option>
                    <option>Order & Tracking Assistance</option>
                    <option>Returns and Refunds</option>
                    <option>General Question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={inputId + '-message'} className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Your Message
                  </label>
                  <textarea
                    id={inputId + '-message'}
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                    placeholder="How can Li Fei Beauty help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-raspberry flex items-center justify-center gap-2 mt-2"
                >
                  <Send size={15} />
                  <span>{sending ? 'Sending…' : 'Send message'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
