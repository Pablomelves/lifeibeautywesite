import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section className="py-16 bg-stone-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Seoul Secret Society</span>
        </div>

        <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-wide mb-3">
          Join For 15% Off Your First Ritual
        </h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto mb-8">
          Receive curated seasonal skincare guides, direct laboratory drop notifications, and private VIP promotional codes.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-6 py-3 rounded-2xl text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Welcome! Your VIP code GLOW15 has been unlocked.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3 rounded-xl bg-stone-800/90 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
