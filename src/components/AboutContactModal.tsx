import React, { useState } from 'react';
import { X, Send, Sparkles, MapPin, Mail, Phone, Check } from 'lucide-react';

interface AboutContactModalProps {
  isOpen?: boolean;
  mode?: 'about' | 'contact' | 'about-lifei' | string | null;
  onClose: () => void;
}

export const AboutContactModal: React.FC<AboutContactModalProps> = ({ isOpen, mode = 'about', onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', concern: 'General Inquiry' });

  if (isOpen === false || (!mode && isOpen === undefined)) return null;

  const isContact = mode === 'contact';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2400);
  };

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
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block mb-1">
              LI FEI BEAUTY
            </span>
            <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-tight text-slate-900">
              {!isContact ? 'OUR SEOUL HERITAGE' : 'CONNECT WITH SKINCARE CARE'}
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
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <div className="mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#EC3460] bg-[#FFF0F9] px-3 py-1 rounded-full border border-[#FFCDF2] inline-block">
                Life looks better with lifei
              </span>
            </div>
            <p>
              <strong>LI FEI BEAUTY</strong> was founded with an uncompromising premise: genuine Korean glass skin is not achieved through 10 generic, diluted steps, but through <em>biomimetic clinical integrity</em>.
            </p>
            <p>
              Based in Gangnam, Seoul, our curation team collaborates directly with premier cosmetic chemistry laboratories. We bypass middleman resellers to bring you authentic, factory-fresh formulations with intact active peptides, Salmon PDRN, and cellular NAD+.
            </p>
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-900 block">The Li Fei Commitments:</span>
              <p>• 100% Certified Seoul Procurement with Holographic Batch Verification</p>
              <p>• Climate-Shielded Shipping to Prevent Peptide Denaturation</p>
              <p>• 30-Day Radiant Guarantee on All Formulations</p>
            </div>
            <p className="text-xs text-slate-400">
              Headquarters: Teheran-ro 152, Gangnam-gu, Seoul, Republic of Korea.
            </p>
          </div>
        ) : (
          <div>
            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-2 animate-in zoom-in-95">
                <Check size={28} className="mx-auto text-emerald-600" />
                <h4 className="font-bold text-sm uppercase">Message Received</h4>
                <p className="text-xs">
                  Our Seoul aesthetician team will respond within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                    placeholder="Evelyn Chen"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                    placeholder="evelyn@example.com"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Topic / Skin Goal
                  </label>
                  <select
                    value={formData.concern}
                    onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                  >
                    <option>Product Recommendation Consultation</option>
                    <option>Order & Tracking Assistance</option>
                    <option>Ingredient & Sensitivity Verification</option>
                    <option>General Question</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-900"
                    placeholder="How can our skincare team help you achieve your glass skin goal?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-raspberry flex items-center justify-center gap-2 mt-2"
                >
                  <Send size={15} />
                  <span>Send to Seoul Skincare Care</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
