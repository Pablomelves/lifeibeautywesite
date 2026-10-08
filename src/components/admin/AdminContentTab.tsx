import React, { useState } from 'react';
import { 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Layout, 
  Bell, 
  Image, 
  Type, 
  ShieldCheck, 
  Award,
  Eye
} from 'lucide-react';
import { StoreContentSettings } from '../../types';

interface AdminContentTabProps {
  contentSettings: StoreContentSettings;
  onSaveContentSettings: (settings: StoreContentSettings) => void;
  onPreviewStorefront: () => void;
}

export const AdminContentTab: React.FC<AdminContentTabProps> = ({
  contentSettings,
  onSaveContentSettings,
  onPreviewStorefront,
}) => {
  const [form, setForm] = useState<StoreContentSettings>({ ...contentSettings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContentSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Storefront Copy &amp; Promotional CMS
          </h2>
          <p className="text-xs text-slate-500">
            Control the announcement ribbon, hero 3D slogans, promotional banners, and brand promises without touching code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPreviewStorefront}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Eye size={14} /> View Live Storefront
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Announcement Ribbon Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F9] text-[#EC3460] flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-anton text-base uppercase text-slate-950">
                1. Top Announcement Bar
              </h3>
              <p className="text-[11px] text-slate-500">
                Appears at the very top of all customer browsing sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Message Text
              </label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                placeholder="DIRECT FROM SEOUL · COMPLIMENTARY EXPRESS DISPATCH OVER $40"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Active Promo Code Pill
              </label>
              <input
                type="text"
                value={form.promoCode}
                onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                placeholder="GLOW15"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono font-bold text-[#EC3460]"
              />
            </div>
          </div>
        </div>

        {/* 2. Hero 3D Headline & Slogans */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layout size={16} />
            </div>
            <div>
              <h3 className="font-anton text-base uppercase text-slate-950">
                2. Hero 3D Stage &amp; Headlines
              </h3>
              <p className="text-[11px] text-slate-500">
                Main greeting and atmospheric subtitle on the homepage 3D carousel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                placeholder="SEOUL CELLULAR RENEWAL"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-anton text-slate-950 text-base"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Subheading Formula Bullets
              </label>
              <input
                type="text"
                value={form.heroSubhead}
                onChange={(e) => setForm({ ...form, heroSubhead: e.target.value })}
                placeholder="Biomimetic Salmon PDRN · Pure NAD+ · Rose Quartz Contour"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hero Brand Tagline Paragraph
            </label>
            <textarea
              rows={2}
              value={form.heroTagline}
              onChange={(e) => setForm({ ...form, heroTagline: e.target.value })}
              placeholder="Curated clinical Korean skincare designed to deliver luminous hydration, dermal density, and true glass glow."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
            />
          </div>
        </div>

        {/* 3. Promotional Section & Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#EC3460] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-anton text-base uppercase text-slate-950">
                3. Promotional Banner &amp; Discount Offer
              </h3>
              <p className="text-[11px] text-slate-500">
                Featured promotional banner highlighting formula efficacy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Banner Headline
              </label>
              <input
                type="text"
                value={form.bannerPromoTitle}
                onChange={(e) => setForm({ ...form, bannerPromoTitle: e.target.value })}
                placeholder="THE GLOW ARCHITECTURE"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Discount Offer Callout
              </label>
              <input
                type="text"
                value={form.bannerPromoDiscount}
                onChange={(e) => setForm({ ...form, bannerPromoDiscount: e.target.value })}
                placeholder="USE CODE GLOW15 FOR 15% OFF FIRST RITUAL"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-mono text-emerald-700 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Banner Subtitle Text
            </label>
            <input
              type="text"
              value={form.bannerPromoSubtitle}
              onChange={(e) => setForm({ ...form, bannerPromoSubtitle: e.target.value })}
              placeholder="Clinical Korean botanical actives engineered for rapid cellular barrier rebound."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
            />
          </div>
        </div>

        {/* 4. Brand Heritage & Story */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={16} />
            </div>
            <div>
              <h3 className="font-anton text-base uppercase text-slate-950">
                4. Brand Story &amp; Seoul Heritage
              </h3>
              <p className="text-[11px] text-slate-500">
                Narrative displayed in the "Why Li Fei" philosophy section.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Story Title / Pillars
              </label>
              <input
                type="text"
                value={form.brandStoryTitle}
                onChange={(e) => setForm({ ...form, brandStoryTitle: e.target.value })}
                placeholder="PURITY · POTENCY · PRESERVATION"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Story Narrative Body
              </label>
              <textarea
                rows={2}
                value={form.brandStoryText}
                onChange={(e) => setForm({ ...form, brandStoryText: e.target.value })}
                placeholder="Li Fei Beauty curates strictly authentic, temperature-controlled Korean formulations..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isSaved ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Content Published to Storefront!
              </span>
            ) : (
              <span className="text-slate-300 text-xs">
                Changes will instantly update storefront announcement bar, headers, and banners.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer flex items-center gap-2"
          >
            <Save size={15} />
            <span>Publish to Store</span>
          </button>
        </div>
      </form>
    </div>
  );
};
