import React from 'react';
import { Instagram, Sparkles, Heart } from 'lucide-react';

interface UgcGalleryProps {
  onExploreProduct: (id: number) => void;
}

export const UgcGallery: React.FC<UgcGalleryProps> = ({ onExploreProduct }) => {
  const ugcPosts: Array<{ id: number; user: string; platform: string; title: string; likes: string; productId: number; productName: string; tag: string }> = [];

  return (
    <section className="py-20 bg-white font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#EC3460] mb-1">
              <Instagram size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                @LIFEIBEAUTY COMMUNITY
              </span>
            </div>
            <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-slate-900">
              REAL GLOW STORIES & UGC
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Tag @lifeibeauty on Instagram and TikTok to be featured and earn 200 Glow Club Rewards Points.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!ugcPosts.length && <p className="text-sm text-slate-600 col-span-full">No authenticated customer photos or social posts are available yet.</p>}
          {ugcPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onExploreProduct(post.productId)}
              className="group bg-[#FFF5FA] rounded-3xl p-6 border border-[#FFCDF2]/60 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between hover:border-[#EC3460]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-slate-900">{post.user}</span>
                  <span className="flex items-center gap-1 text-[#EC3460] font-semibold text-[11px]">
                    <Heart size={12} fill="currentColor" />
                    {post.likes}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">
                  "{post.title}"
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {post.tag}
                </span>
              </div>

              <div className="pt-4 mt-6 border-t border-[#FFCDF2]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Featured Formula:</span>
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-[#EC3460] transition-colors">
                    {post.productName}
                  </span>
                </div>
                <span className="text-xs underline font-semibold text-[#EC3460] group-hover:text-[#D8224F]">
                  Shop
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
