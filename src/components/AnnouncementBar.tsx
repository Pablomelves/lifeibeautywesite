import React, { useState, useEffect } from 'react';
import { Truck, Gift, Sparkles, X, ChevronRight } from 'lucide-react';
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
  promoCode = 'FIRST10',
  onOpenTrackOrder,
  content,
  contentSettings,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const activePromo = promoCode || contentSettings?.promoCode || content?.promoCode || 'FIRST10';
  const activeCustomText = customText || contentSettings?.announcementText || content?.announcementText;

  const announcements = [
    {
      id: 'shipping',
      icon: Truck,
      text: activeCustomText || 'Free shipping on orders over $75',
      secondaryText: 'Complimentary delivery applied at checkout',
      cta: 'Learn More',
    },
    {
      id: 'discount',
      icon: Gift,
      text: `Get 10% off your first order · Use code ${activePromo}`,
      secondaryText: `Save 10% on your curated routine`,
      cta: `Use ${activePromo}`,
    },
    {
      id: 'authenticity',
      icon: Sparkles,
      text: '100% Certified Authentic Korean Skincare · Direct Sourcing',
      secondaryText: 'Verified temperature-controlled batches',
      cta: 'Our Promise',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!visible) return null;

  const current = announcements[currentIdx];
  const MobileIcon = current.icon;

  return (
    <aside 
      aria-label="Promotional Announcement"
      className="site-announcement-bar relative bg-[#EC3460] text-white text-[11px] sm:text-xs font-inter z-[70] border-b border-white/15 transition-colors duration-300 shadow-2xs"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 min-h-[32px] sm:min-h-[36px] flex items-center justify-between gap-4">
        
        {/* Desktop View: Horizontal arranged announcements with subtle dividers */}
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center gap-6 text-[11px] font-medium tracking-wide">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-[#FFCDF2] shrink-0" aria-hidden="true" />
              <span>Free shipping on orders over $75</span>
            </div>
            <span className="text-white/40" aria-hidden="true">|</span>
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-[#FFCDF2] shrink-0" aria-hidden="true" />
              <span>Get 10% off your first order · Use code <strong className="font-bold underline decoration-[#FFCDF2] underline-offset-2">{activePromo}</strong></span>
            </div>
            <span className="text-white/40" aria-hidden="true">|</span>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#FFCDF2] shrink-0" aria-hidden="true" />
              <span>100% Authentic Korean & Global Beauty</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[11px]">
            {onOpenTrackOrder && (
              <button
                type="button"
                onClick={onOpenTrackOrder}
                className="text-white/90 hover:text-white underline font-semibold tracking-wider cursor-pointer"
              >
                Track Order
              </button>
            )}
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Dismiss announcement"
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile/Tablet View: Compact rotating announcement that never overflows */}
        <div className="flex lg:hidden items-center justify-between w-full">
          <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden px-1">
            <MobileIcon size={14} className="text-[#FFCDF2] shrink-0" aria-hidden="true" />
            <span className="font-semibold tracking-wide truncate max-w-[280px] sm:max-w-md text-white text-[11px] sm:text-xs">
              {current.text}
            </span>
            {onOpenPromo && (
              <button 
                type="button"
                onClick={onOpenPromo}
                className="hidden sm:inline-flex items-center gap-0.5 underline font-bold text-[#FFCDF2] hover:text-white ml-1 cursor-pointer transition-colors shrink-0"
              >
                <span>{current.cta}</span>
                <ChevronRight size={12} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenTrackOrder && (
              <button
                type="button"
                onClick={onOpenTrackOrder}
                className="text-[10px] text-white/90 hover:text-white underline font-semibold cursor-pointer hidden max-[400px]:hidden sm:inline-block"
              >
                Track
              </button>
            )}
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Dismiss announcement"
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};
