import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Save, Search } from 'lucide-react';
import { Product } from '../../types';

interface AdminInventoryTabProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
}

export const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({
  products,
  onSaveProducts
}) => {
  const [stockMap, setStockMap] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    products.forEach((p) => {
      map[p.id] = p.stockQuantity !== undefined ? p.stockQuantity : 35;
    });
    return map;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStockChange = (productId: number, val: number) => {
    setStockMap((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleSaveAll = () => {
    const updated = products.map((p) => ({
      ...p,
      stockQuantity: stockMap[p.id] !== undefined ? stockMap[p.id] : 35,
      stockStatus: (stockMap[p.id] || 0) > 0 ? 'In Stock' : 'Out of Stock'
    }));
    onSaveProducts(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Inventory & Warehouse Stock</h2>
          <p className="text-xs text-stone-500">
            Real-time stock counts, SKU management, low stock warnings, and Seoul batch adjustments
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          Save Stock Adjustments
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Inventory levels successfully updated across public storefront!</span>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <Search className="w-4 h-4 text-stone-400 ml-2" />
        <input
          type="text"
          placeholder="Filter by SKU or formula name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
        />
        <span className="text-xs text-stone-400 font-medium mr-2">
          {filtered.length} items
        </span>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Available Stock Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((product) => {
                const currentStock = stockMap[product.id] !== undefined ? stockMap[product.id] : 35;
                const isLow = currentStock <= 10;
                const isOut = currentStock === 0;

                return (
                  <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg p-1 flex items-center justify-center shrink-0 border border-stone-200"
                          style={{ backgroundColor: product.panel || '#FAF5F7' }}
                        >
                          {product.src ? (
                            <img src={product.src} alt={product.name} className="max-h-full w-auto object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{product.name}</div>
                          <div className="text-[11px] text-stone-400">{product.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-600">
                      {product.sku || `LF-${product.id}`}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{product.category}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{product.price}</td>
                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          type="button"
                          onClick={() => handleStockChange(product.id, currentStock - 5)}
                          className="px-2 py-1 hover:bg-stone-200 cursor-pointer text-stone-600 font-bold"
                        >
                          -5
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                          className="w-14 text-center py-1 bg-white border-x border-stone-200 font-bold text-stone-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockChange(product.id, currentStock + 5)}
                          className="px-2 py-1 hover:bg-stone-200 cursor-pointer text-stone-600 font-bold"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
