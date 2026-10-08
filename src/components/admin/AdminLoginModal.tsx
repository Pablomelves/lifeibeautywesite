import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../../types';
import { loginAdmin } from '../../services/adminService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both admin email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await loginAdmin(email, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      setEmail('');
      setPassword('');
      onSuccess(result.user);
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-8 sm:p-10 text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Return to Storefront"
          aria-label="Return to Storefront"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Badge & Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#FFF0F9] text-[#EC3460] flex items-center justify-center mb-6 shadow-cotton">
          <Lock size={24} />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] bg-[#FFF0F9] px-2.5 py-1 rounded-full border border-[#FFCDF2]">
          AUTHORIZED ACCESS ONLY
        </span>

        <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950 mt-2 mb-1">
          Store Owner Authentication
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Sign in to access store operations, product catalogs, customer data, and system controls.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-medium text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EC3460] hover:bg-[#D8224F] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Authenticate & Enter'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Server-verified session · Protected environment</span>
        </div>
      </div>
    </div>
  );
};
