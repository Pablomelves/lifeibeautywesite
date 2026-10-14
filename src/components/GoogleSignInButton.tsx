import React, { useState } from 'react';
import { AlertCircle, CheckCircle, LogOut, Loader2 } from 'lucide-react';
import type { CustomerUser } from '../types';
import { signInWithGooglePopup, signOutCustomer } from '../services/firebase';

interface GoogleSignInButtonProps {
  currentUser: CustomerUser | null;
  onSignedIn?: (user: CustomerUser) => void;
  onSignedOut?: () => void;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  currentUser,
  onSignedIn,
  onSignedOut,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const isPendingRef = React.useRef(false);

  const handleSignIn = async () => {
    if (isLoading || isPendingRef.current) return;
    isPendingRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const result = await signInWithGooglePopup();
      if (result.success && result.user) {
        setSuccessNotice(`Welcome back, ${result.user.displayName || 'Beauty Insider'}!`);
        setTimeout(() => setSuccessNotice(null), 4000);
        if (onSignedIn) {
          onSignedIn(result.user);
        }
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      isPendingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (isLoading || isPendingRef.current) return;
    isPendingRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const result = await signOutCustomer();
      if (result.success) {
        setSuccessNotice('Signed out of Google session.');
        setTimeout(() => setSuccessNotice(null), 3000);
        if (onSignedOut) {
          onSignedOut();
        }
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      isPendingRef.current = false;
      setIsLoading(false);
    }
  };

  // Authenticated State View
  if (currentUser) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Google Profile'}
                className="w-10 h-10 rounded-full object-cover border border-[#FFCDF2] shadow-2xs shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FFF0F9] border border-[#FFCDF2] text-[#EC3460] font-anton text-sm flex items-center justify-center shrink-0">
                {(currentUser.displayName || currentUser.email || 'LF').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-slate-900 truncate block">
                  {currentUser.displayName || 'Google Customer'}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold shrink-0">
                  <CheckCircle size={9} />
                  Connected
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono truncate block">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Sign out of customer Google account"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin text-slate-500" />
            ) : (
              <LogOut size={13} />
            )}
            <span>Sign Out</span>
          </button>
        </div>

        {successNotice && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle size={14} className="shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated / Guest View
  return (
    <div className={`space-y-2.5 ${className}`}>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full relative flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin text-[#EC3460]" />
            <span className="font-medium text-slate-700">Connecting with Google...</span>
          </>
        ) : (
          <>
            {/* Official Google 'G' Mark SVG */}
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.34 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.26C.46 8.2 0 10.04 0 12s.46 3.8 1.26 5.4l4.02-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.66 1.26 6.6l4.02 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="tracking-wide">Continue with Google</span>
          </>
        )}
      </button>

      {/* Inline Feedback / Errors */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-150">
          <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-[11px] font-bold uppercase ml-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {successNotice && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-in fade-in duration-150">
          <CheckCircle size={14} className="shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}
    </div>
  );
};
