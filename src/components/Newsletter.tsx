import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { submitStoreForm } from '../services/forms';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = React.useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || pending.current) return;
    pending.current = true; setSending(true); setError(null);
    try { await submitStoreForm('lifei-newsletter', { email, 'bot-field': '' }); setSubscribed(true); }
    catch { setError('Your signup could not be submitted. Please try again.'); }
    finally { pending.current = false; setSending(false); }
  };

  return (
    <section className="py-16 bg-stone-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Seoul Secret Society</span>
        </div>

        <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-wide mb-3">
          Stay Connected With Li Fei Beauty
        </h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto mb-8">
          Request email updates about the store. No discount or promotional code is promised.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-6 py-3 rounded-2xl text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Thank you. Your signup request has been received.</span>
          </div>
        ) : (
          <form name="lifei-newsletter" method="POST" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="hidden" name="form-name" value="lifei-newsletter" />
            <input
              type="email"
              required
              name="email"
              aria-label="Email address for store updates"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3 rounded-xl bg-stone-800/90 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              {sending ? 'Sending…' : 'Subscribe'}
            </button>
          </form>
        )}
        {error && <p role="alert" className="mt-3 text-xs text-rose-300">{error}</p>}
      </div>
    </section>
  );
};
