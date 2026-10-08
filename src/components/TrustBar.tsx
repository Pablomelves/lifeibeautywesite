import React from 'react';
import { ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const items = [
    {
      icon: ShieldCheck,
      title: "100% Authentic Seoul",
      desc: "Direct laboratory-fresh batches"
    },
    {
      icon: Truck,
      title: "Fast Global Dispatch",
      desc: "Free courier shipping over $40"
    },
    {
      icon: Sparkles,
      title: "Bio-Compatible Actives",
      desc: "PDRN, NAD+ & Micro-Peptides"
    },
    {
      icon: Award,
      title: "Clinical Efficacy",
      desc: "Dermatologically tested formulations"
    }
  ];

  return (
    <div className="border-y border-stone-200/80 bg-white/70 backdrop-blur-xs py-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-800">
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 tracking-wide uppercase">{item.title}</h4>
              <p className="text-[11px] text-stone-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
