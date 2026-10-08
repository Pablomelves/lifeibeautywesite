import React, { useState } from 'react';
import { Save, CheckCircle, FileText, MessageSquare } from 'lucide-react';
import { StoreContent } from '../../types';

interface AdminContentTabProps {
  content: StoreContent;
  onSaveContent: (content: StoreContent) => void;
}

export const AdminContentTab: React.FC<AdminContentTabProps> = ({ content, onSaveContent }) => {
  const [data, setData] = useState<StoreContent>({ ...content });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContent(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Store Content & Copywriting</h2>
          <p className="text-xs text-stone-500">
            Edit brand messaging, announcements, hero callouts, and marketing headers
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Store content successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-stone-700 mb-1">Top Announcement Bar</label>
          <input
            type="text"
            value={data.announcementText}
            onChange={(e) => setData({ ...data, announcementText: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Promo Badge</label>
            <input
              type="text"
              value={data.promoBadge}
              onChange={(e) => setData({ ...data, promoBadge: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200"
            />
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">Banner Promo Discount Code</label>
            <input
              type="text"
              value={data.promoCode}
              onChange={(e) => setData({ ...data, promoCode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 uppercase font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">Hero Main Headline</label>
          <input
            type="text"
            value={data.heroHeadline}
            onChange={(e) => setData({ ...data, heroHeadline: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 font-anton text-base"
          />
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">Hero Subhead</label>
          <input
            type="text"
            value={data.heroSubhead}
            onChange={(e) => setData({ ...data, heroSubhead: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200"
          />
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">Hero Tagline</label>
          <textarea
            rows={2}
            value={data.heroTagline}
            onChange={(e) => setData({ ...data, heroTagline: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 resize-none"
          />
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">Brand Heritage Philosophy</label>
          <textarea
            rows={3}
            value={data.brandStoryText}
            onChange={(e) => setData({ ...data, brandStoryText: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer shadow-sm"
          >
            Save All Content
          </button>
        </div>
      </form>
    </div>
  );
};
