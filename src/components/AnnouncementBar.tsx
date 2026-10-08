import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Gift, X, ChevronRight } from 'lucide-react';
import { StoreContentSettings, StoreContent } from '../types';

interface AnnouncementBarProps {
  onOpenPromo?: () => void;
  customText?: string;
  promoCode?: string;
  onOpenTrackOrder?: () => void;
  content?: StoreContent;
  contentSettings?: StoreContentSettings;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ 
  onOpenPromo,
  customText,
  promoCode = 'GLOW15',
  onOpenTrackOrder,
  content,
  contentSettings,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const activePromo = promoCode || contentSettings?.promoCode || content?.promoCode || 'GLOW15';
  const activeCustomText = customText || contentSettings?.announcementText || content?.announcementText;

  const announcements = [
    {
      icon: Sparkles,
      text: activeCustomText || "✨ Life looks better with lifei · Free Express Delivery on Orders Over $40",
      cta: `Use ${activePromo}`
    },
    {
      icon: ShieldCheck,
      text: "🛡️ 100% Certified Authentic Korean Skincare · Temperature-Preserved Batches",
      cta: "Verify Authenticity"
    },
    {
      icon: Gift,
      text: `🎁 First Order? Use code ${activePromo} for 15% OFF your curated ritual order`,
      cta: `Claim ${activePromo}`
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!visible) return null;

  const current = announcements[currentIdx];
  const Icon = current.icon;

  return (
    <div className="relative bg-[#EC3460] text-white text-[11px] sm:text-xs font-inter z-[70] border-b border-white/20 transition-colors duration-500 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-white/80 text-[10px] uppercase tracking-wider font-semibold">
          <span>Seoul ⇄ Global</span>
          <span>·</span>
          <span>USD ($)</span>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden px-2">
          <Icon size={14} className="text-[#FFCDF2] shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wide truncate max-w-xl text-white">
            {current.text}
          </span>
          {onOpenPromo && (
            <button 
              onClick={onOpenPromo}
              className="hidden sm:inline-flex items-center gap-0.5 underline font-bold text-[#FFCDF2] hover:text-white ml-1 cursor-pointer transition-colors"
            >
              <span>{current.cta}</span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onOpenTrackOrder && (
            <button
              onClick={onOpenTrackOrder}
              className="text-[10px] text-white/90 hover:text-white underline font-semibold tracking-wider cursor-pointer"
            >
              Track Order
            </button>
          )}
          <span className="hidden lg:inline text-[10px] text-white/80 tracking-wider font-medium">
            30-Day Radiant Guarantee
          </span>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss banner"
            className="text-white/70 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
