import React from 'react';
import { X, Check, ShoppingBag, Sparkles, Scale } from 'lucide-react';
import { Product } from '../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onRemove: (productId: number) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 font-inter">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460]">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="font-anton text-2xl uppercase tracking-tight text-slate-900">Compare Formulas</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Side-by-side Clinical Analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 mb-4">
                <Scale size={32} />
              </div>
              <p className="text-slate-500 text-sm font-medium">Select up to 3 products to compare their benefits and ingredients.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-${products.length + 1} min-w-[800px]`}>
              {/* Labels Column */}
              <div className="bg-slate-50/50 border-r border-slate-100 sticky left-0 z-10">
                <div className="h-[280px] border-b border-slate-100 flex items-end p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Attribute</span>
                </div>
                <div className="p-6 border-b border-slate-100 min-h-[100px] flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Price</span>
                </div>
                <div className="p-6 border-b border-slate-100 min-h-[140px] flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Benefits</span>
                </div>
                <div className="p-6 border-b border-slate-100 min-h-[140px] flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Matrix</span>
                </div>
                <div className="p-6 border-b border-slate-100 min-h-[100px] flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ritual Step</span>
                </div>
              </div>

              {/* Product Columns */}
              {products.map((product) => (
                <div key={product.id} className="border-r border-slate-100 last:border-r-0 relative group">
                  {/* Remove Button */}
                  <button 
                    onClick={() => onRemove(product.id)}
                    className="absolute top-4 right-4 z-20 p-1.5 bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 rounded-full border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X size={14} />
                  </button>

                  {/* Header Visual */}
                  <div className="h-[280px] p-6 border-b border-slate-100 flex flex-col items-center text-center">
                    <div 
                      className="w-32 h-32 rounded-2xl mb-4 flex items-center justify-center p-2 border border-[#FFCDF2]/40"
                      style={{ backgroundColor: product.panel }}
                    >
                      <img src={product.src} alt={product.name} className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <h3 className="font-anton text-base uppercase leading-tight line-clamp-2 text-slate-900">{product.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{product.category}</p>
                  </div>

                  {/* Price */}
                  <div className="p-6 border-b border-slate-100 min-h-[100px] flex flex-col justify-center items-center text-center">
                    <span className="font-mono text-xl font-bold text-slate-950">{product.price}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{product.volume}</span>
                  </div>

                  {/* Benefits */}
                  <div className="p-6 border-b border-slate-100 min-h-[140px] flex flex-col gap-2">
                    {product.benefits.slice(0, 3).map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={12} className="text-[#EC3460] mt-0.5 shrink-0" />
                        <span className="text-[11px] text-slate-600 leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div className="p-6 border-b border-slate-100 min-h-[140px]">
                    <div className="flex flex-wrap gap-1.5">
                      {product.keyIngredients.map((ing, i) => (
                        <span key={i} className="text-[9px] font-bold bg-[#FFF0F9] text-[#B31940] px-2 py-1 rounded-lg border border-[#FFCDF2]/50">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ritual */}
                  <div className="p-6 border-b border-slate-100 min-h-[100px] flex items-center text-center">
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">{product.ritualStep}</p>
                  </div>

                  {/* Actions */}
                  <div className="p-6 flex flex-col gap-2">
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-[#EC3460] hover:bg-[#D8224F] text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-raspberry flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      <span>Add to Bag</span>
                    </button>
                    <button 
                      className="w-full bg-white text-slate-900 border border-slate-200 text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>Full PDP</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
