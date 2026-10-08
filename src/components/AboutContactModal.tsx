import React, { useState } from 'react';
import { X, Sparkles, Mail, Send, CheckCircle2 } from 'lucide-react';

interface AboutContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutContactModal: React.FC<AboutContactModalProps> = ({ isOpen, onClose }) => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-base">About Li Fei Beauty & Seoul Labs</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">Our Heritage & Mission</h4>
            <p>
              Founded in Gangnam, Seoul, Li Fei Beauty was created to bridge traditional Asian botanical remedies with advanced cellular biotechnology. We work exclusively with certified clinical laboratories to deliver authentic Salmon DNA (PDRN), NAD+, and peptide concentrates that transform skin texture from within.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-600" />
              Contact Our Seoul Concierge
            </h4>
            <p className="text-xs text-stone-500 mb-3">
              Questions regarding ritual layering, product compatibility, or order tracking? Reach out directly:
            </p>

            {sent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 font-medium text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Message received! A skincare advisor will reply within 4 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="How can we assist your ritual today?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-stone-900 resize-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
