import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Minus, 
  Save, 
  Search, 
  Package, 
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { AdminProduct } from '../../types';

interface AdminInventoryTabProps {
  products: AdminProduct[];
  onUpdateStock: (productId: number, newStock: number) => void;
}

export const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({
  products,
  onUpdateStock,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [editingStocks, setEditingStocks] = useState<Record<number, number>>({});
  const [savedNoticeId, setSavedNoticeId] = useState<number | null>(null);

  const getStockVal = (p: AdminProduct) => {
    return editingStocks[p.id] !== undefined ? editingStocks[p.id] : p.stockQuantity;
  };

  const handleAdjust = (productId: number, current: number, delta: number) => {
    const nextVal = Math.max(0, current + delta);
    setEditingStocks(prev => ({ ...prev, [productId]: nextVal }));
  };

  const handleSaveStock = (productId: number) => {
    const val = editingStocks[productId];
    if (val !== undefined) {
      onUpdateStock(productId, val);
      setSavedNoticeId(productId);
      setTimeout(() => setSavedNoticeId(null), 1800);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'low_stock') return p.stockQuantity > 0 && p.stockQuantity < 10;
    if (filterMode === 'out_of_stock') return p.stockQuantity === 0;
    return true;
  });

  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Real-Time Inventory &amp; Stock Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Monitor Seoul warehouse stock, trigger reorder thresholds, and adjust inventory quantities.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle size={13} /> {lowStockCount} Low Stock
            </span>
          )}
          {outOfStockCount > 0 && (
            <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              {outOfStockCount} Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#EC3460] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('low_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'low_stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Low Stock (&lt; 10)
          </button>
          <button
            onClick={() => setFilterMode('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'out_of_stock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Formula Visual</th>
                <th className="py-3.5 px-4">SKU &amp; Product</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Inline Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products matching this filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentStock = getStockVal(p);
                  const isModified = editingStocks[p.id] !== undefined && editingStocks[p.id] !== p.stockQuantity;
                  const isSaved = savedNoticeId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div 
                          className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center shrink-0"
                          style={{ backgroundColor: p.panel }}
                        >
                          <img src={p.src} alt={p.name} className="w-full h-full object-cover object-center" />
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <span className="font-mono text-[10px] text-slate-400 block font-bold">
                          {p.sku}
                        </span>
                        <h4 className="font-bold uppercase text-slate-900 truncate">
                          {p.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {p.volume}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.price}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400 block">units in stock</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block border ${
                          currentStock === 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : currentStock < 10
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {currentStock === 0 ? 'Out of Stock' : currentStock < 10 ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>

                      {/* Adjuster */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAdjust(p.id, currentStock, -5)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-[10px]"
                            title="Subtract 5 units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleAdjust(p.id, currentStock, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Subtract 1 unit"
                          >
                            <Minus size={13} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              setEditingStocks(prev => ({ ...prev, [p.id]: isNaN(v) ? 0 : Math.max(0, v) }));
                            }}
                            className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs focus:outline-none focus:border-[#EC3460]"
                          />

                          <button
                            onClick={() => handleAdjust(p.id, currentStock, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Add 1 unit"
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            onClick={() => handleAdjust(p.id, currentStock, 10)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-[10px]"
                            title="Add 10 units"
                          >
                            +10
                          </button>

                          {isModified && (
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="px-3 py-1.5 bg-[#EC3460] hover:bg-[#D8224F] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer animate-pulse"
                            >
                              <Save size={12} /> Save
                            </button>
                          )}

                          {isSaved && (
                            <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1 animate-fadeIn">
                              <CheckCircle size={14} /> Saved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
