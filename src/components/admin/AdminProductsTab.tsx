import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Search, Eye, Sparkles, Check, X, Package } from 'lucide-react';
import { Product } from '../../types';

interface AdminProductsTabProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  onSaveProducts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingProduct({
      id: Date.now(),
      name: '',
      subtitle: '',
      src: '/products/medicube-pink.jpg',
      bg: '#EFA6B7',
      panel: '#FDF0F3',
      themeColor: '#DF4D6E',
      price: '$35.00',
      numericPrice: 35,
      compareAtPrice: '$42.00',
      volume: '30 ml / 1.01 fl. oz.',
      category: 'Serums',
      rating: 5.0,
      reviewsCount: 1,
      badge: 'New Formulation',
      clinicalClaim: 'Clinically tested Seoul cellular renewal',
      stockQuantity: 50,
      sku: `LF-${Date.now().toString().slice(-4)}`,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter((p) => p.id !== id);
      onSaveProducts(updated);
    }
  };

  const handleDuplicate = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: Date.now(),
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`
    };
    onSaveProducts([duplicated, ...products]);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const existingIdx = products.findIndex((p) => p.id === editingProduct.id);
    if (existingIdx !== -1) {
      const updated = [...products];
      updated[existingIdx] = editingProduct;
      onSaveProducts(updated);
    } else {
      onSaveProducts([editingProduct, ...products]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Products & Catalog</h2>
          <p className="text-xs text-stone-500">
            Control pricing, formulas, descriptions, inventory, and storefront presentation
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <Search className="w-4 h-4 text-stone-400 ml-2" />
        <input
          type="text"
          placeholder="Filter products by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
        />
        <span className="text-xs text-stone-400 font-medium mr-2">
          {filtered.length} products
        </span>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl p-1 flex items-center justify-center shrink-0 border border-stone-200"
                        style={{ backgroundColor: product.panel || '#FAF5F7' }}
                      >
                        {product.src ? (
                          <img
                            src={product.src}
                            alt={product.name}
                            className="max-h-full w-auto object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-stone-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{product.name}</div>
                        <div className="text-[11px] text-stone-400">{product.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{product.category}</td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">{product.price}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold ${
                        (product.stockQuantity || 35) > 10 ? 'text-stone-700' : 'text-amber-600'
                      }`}
                    >
                      {product.stockQuantity || 35} in stock
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-stone-800">★ {product.rating}</span>
                    <span className="text-[11px] text-stone-400 ml-1">({product.reviewsCount})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(product)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">
                {editingProduct.id ? 'Edit Product Details' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Subtitle / Formula</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.subtitle}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Display Price (e.g. $36.00)</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.price}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                        numericPrice: num
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Compare-At Price</label>
                  <input
                    type="text"
                    value={editingProduct.compareAtPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Serums">Serums</option>
                    <option value="Masks">Masks</option>
                    <option value="Cleansers">Cleansers</option>
                    <option value="Moisturizers">Moisturizers</option>
                    <option value="Tools & Rollers">Tools & Rollers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity || 35}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.src}
                    onChange={(e) => setEditingProduct({ ...editingProduct, src: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Clinical Claim</label>
                <input
                  type="text"
                  value={editingProduct.clinicalClaim || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, clinicalClaim: e.target.value })}
                  placeholder="e.g. +192% Collagen Synthesis & Instant Plump"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.fullDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
