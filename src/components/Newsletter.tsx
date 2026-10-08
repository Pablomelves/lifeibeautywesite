import React, { useState } from 'react';
import { Mail, Check, Sparkles, Gift } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-20 bg-slate-950 text-white font-inter relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EC3460]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#FFCDF2]/15 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 text-[#FFCDF2] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 mb-4">
          <Gift size={12} className="text-[#EC3460]" />
          <span>JOIN THE LI FEI GLOW CLUB</span>
        </div>

        <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight leading-none mb-3">
          UNLOCK 15% OFF YOUR FIRST SEOUL RITUAL
        </h2>

        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
          Be the first to receive exclusive drops from top Seoul dermatology clinics, limited-batch formulations, and customized Korean skincare consultations.
        </p>

        {subscribed ? (
          <div className="bg-white/10 border border-[#EC3460]/40 p-6 rounded-3xl max-w-md mx-auto backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-[#EC3460]/20 text-[#FFCDF2] flex items-center justify-center mx-auto mb-3">
              <Check size={20} />
            </div>
            <h3 className="font-bold text-base uppercase tracking-wider mb-1">
              Welcome to the Glow Club!
            </h3>
            <p className="text-xs text-white/80 mb-3">
              Use your welcome code at checkout for 15% off:
            </p>
            <div className="inline-block bg-white text-[#4A0818] font-mono font-bold text-lg px-4 py-2 rounded-xl select-all shadow-inner">
              GLOW15
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:border-[#FFCDF2] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold text-xs uppercase tracking-wider py-4 px-7 rounded-2xl transition-all shadow-raspberry cursor-pointer whitespace-nowrap"
            >
              Claim 15% Off
            </button>
          </form>
        )}

        <p className="text-[10px] text-white/40 mt-4">
          By signing up, you agree to receive promotional emails from Li Fei Beauty. No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};
