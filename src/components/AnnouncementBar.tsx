import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { StoreContent } from '../types';

interface AnnouncementBarProps {
  content: StoreContent;
  onOpenAdmin?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ content, onOpenAdmin }) => {
  return (
    <div className="bg-[#1c1917] text-white text-xs py-2.5 px-4 font-medium tracking-wide flex items-center justify-between border-b border-stone-800">
      <div className="hidden md:flex items-center gap-2 text-stone-400 text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
        <span>100% Guaranteed Authentic Seoul Laboratory Direct</span>
      </div>

      <div className="flex-1 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>{content.announcementText}</span>
        {content.promoBadge && (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {content.promoBadge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <button
          onClick={onOpenAdmin}
          className="text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          Store Admin
        </button>
      </div>
    </div>
  );
};
