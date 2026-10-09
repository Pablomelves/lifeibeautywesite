import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  Copy, 
  AlertCircle,
  Tag,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import { AdminProduct } from '../../types';

interface AdminProductsTabProps {
  products: AdminProduct[];
  onAddProduct: (product: Omit<AdminProduct, 'id'>) => void;
  onUpdateProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleStatus: (productId: number) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'low_stock'>('all');

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    subtitle: '',
    price: '$38.00',
    numericPrice: 38,
    compareAtPrice: '$48.00',
    volume: '30 ml / 1.01 fl. oz.',
    category: 'Serums',
    src: '/products/medicube-pink.jpg',
    bg: '#EFA6B7',
    panel: '#FDF0F3',
    themeColor: '#DF4D6E',
    darkTone: false,
    stockQuantity: 50,
    status: 'active',
    sku: 'LF-SRM-109',
    badge: 'New Formula',
    clinicalClaim: '+150% Hydration & Pore Refinement',
    benefits: ['Deep barrier hydration', 'Clinically proven cellular turnover'],
    keyIngredients: ['Salmon PDRN', 'Niacinamide', 'Hyaluronic Acid'],
    allIngredients: 'Water, Damask Rose Hydrosol, Niacinamide, Sodium DNA, Glycerin, 1,2-Hexanediol.',
    howToUse: ['Dispense 2-3 drops to clean skin morning and evening.'],
    ritualStep: 'Step 03 · Targeted Ampoule & Treatment',
    skinType: 'All Skin Types, Dull, Dehydrated',
    fullDescription: 'Clinical Korean botanical ampoule suspended in fresh Damask rose dewdrops for glassy barrier hydration.',
    stockStatus: 'In Stock',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Image Presets Available
  const IMAGE_PRESETS = [
    { label: 'Medicube PDRN Pink (Rose Ampoule)', url: '/products/medicube-pink.jpg', bg: '#EFA6B7', panel: '#FDF0F3' },
    { label: 'Medicube EGF NAD (Firming Crimson)', url: '/products/medicube-firming.jpg', bg: '#5E101D', panel: '#3F0811' },
    { label: 'Medicube Kojic Turmeric (Brightening)', url: '/products/medicube-turmeric.jpg', bg: '#E4980E', panel: '#FCF2DC' },
    { label: 'Biodance Bio-Collagen Mask', url: '/products/biodance.png', bg: '#DDEEF2', panel: '#EDF7F9' },
    { label: 'Medicube Zero Pore Pad 2.0', url: '/products/medicube.png', bg: '#EBF4F6', panel: '#F0F8FA' },
    { label: 'Rose Quartz Roller & Gua Sha', url: '/products/facial-roller.jpg', bg: '#FDECEF', panel: '#FFF5F7' },
    { label: 'Ceramide Barrier Cream', url: '/products/skincare-3.png', bg: '#F5EBE6', panel: '#FAF3F0' },
    { label: 'Glow Essence Mist', url: '/products/skincare-4.png', bg: '#E8EFF5', panel: '#F2F6FA' },
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      subtitle: '',
      price: '$38.00',
      numericPrice: 38,
      compareAtPrice: '$48.00',
      volume: '30 ml / 1.01 fl. oz.',
      category: 'Serums',
      src: '/products/medicube-pink.jpg',
      bg: '#EFA6B7',
      panel: '#FDF0F3',
      themeColor: '#DF4D6E',
      darkTone: false,
      stockQuantity: 50,
      status: 'active',
      sku: `LF-SRM-${Math.floor(100 + Math.random() * 900)}`,
      badge: 'New Formula',
      clinicalClaim: '+150% Hydration & Pore Refinement',
      benefits: ['Deep barrier hydration', 'Clinically proven cellular turnover'],
      keyIngredients: ['Salmon PDRN', 'Niacinamide', 'Hyaluronic Acid'],
      allIngredients: 'Water, Damask Rose Hydrosol, Niacinamide, Sodium DNA, Glycerin, 1,2-Hexanediol.',
      howToUse: ['Dispense 2-3 drops to clean skin morning and evening.'],
      ritualStep: 'Step 03 · Targeted Ampoule & Treatment',
      skinType: 'All Skin Types, Dull, Dehydrated',
      fullDescription: 'Clinical Korean botanical ampoule suspended in fresh Damask rose dewdrops for glassy barrier hydration.',
      stockStatus: 'In Stock',
      rating: 5.0,
      reviewsCount: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const numPrice = typeof formData.numericPrice === 'number' 
      ? formData.numericPrice 
      : parseFloat(String(formData.price).replace(/[^0-9.]/g, '')) || 35;

    const stock = Number(formData.stockQuantity) || 0;
    const stockStatus = stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock';

    const cleanProductData: Omit<AdminProduct, 'id'> = {
      name: formData.name.trim().toUpperCase(),
      subtitle: formData.subtitle?.trim() || 'Seoul Verified Active Formula',
      src: formData.src || '/products/medicube-pink.jpg',
      bg: formData.bg || '#EFA6B7',
      panel: formData.panel || '#FDF0F3',
      themeColor: formData.themeColor || '#EC3460',
      darkTone: Boolean(formData.darkTone),
      price: formData.price.startsWith('$') ? formData.price : `$${numPrice.toFixed(2)}`,
      numericPrice: numPrice,
      originalPrice: formData.compareAtPrice,
      compareAtPrice: formData.compareAtPrice,
      volume: formData.volume || '30 ml / 1.01 fl. oz.',
      category: formData.category || 'Serums',
      rating: formData.rating || 4.9,
      reviewsCount: formData.reviewsCount || 120,
      badge: formData.badge,
      clinicalClaim: formData.clinicalClaim || '+120% Barrier Resilience',
      benefits: Array.isArray(formData.benefits) ? formData.benefits : ['Dermal hydration', 'Barrier reinforcement'],
      keyIngredients: Array.isArray(formData.keyIngredients) ? formData.keyIngredients : ['Active Peptides', 'Centella'],
      allIngredients: formData.allIngredients || 'Water, Butylene Glycol, Glycerin, Sodium Hyaluronate.',
      howToUse: Array.isArray(formData.howToUse) ? formData.howToUse : ['Apply after toning.'],
      ritualStep: formData.ritualStep || 'Step 03 · Treatment',
      skinType: formData.skinType || 'All Skin Types',
      fullDescription: formData.fullDescription || 'Clinical Korean skincare formulation.',
      stockStatus,
      stockQuantity: stock,
      status: formData.status || 'active',
      sku: formData.sku || `LF-PROD-${Date.now().toString().slice(-4)}`,
    };

    if (editingProduct) {
      onUpdateProduct({ ...cleanProductData, id: editingProduct.id });
    } else {
      onAddProduct(cleanProductData);
    }

    setIsModalOpen(false);
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = p.status === 'active';
    else if (statusFilter === 'draft') matchesStatus = p.status === 'draft';
    else if (statusFilter === 'low_stock') matchesStatus = p.stockQuantity < 10;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Products & Catalog Management
          </h2>
          <p className="text-xs text-slate-500">
            {products.length} formulas in database ({products.filter(p => p.status === 'active').length} active, {products.filter(p => p.status === 'draft').length} draft)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
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
            placeholder="Search by name, subtitle, or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#EC3460] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Draft Only</option>
            <option value="low_stock">Low Stock (&lt; 10)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Serums">Serums</option>
            <option value="Moisturizers">Moisturizers</option>
            <option value="Masks">Masks</option>
            <option value="Cleansers">Cleansers</option>
            <option value="Tools & Rollers">Tools &amp; Rollers</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Product Visual</th>
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div 
                          className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: product.panel }}
                        >
                          <img
                            src={product.src}
                            alt={product.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      </td>

                      {/* Info & SKU */}
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold uppercase tracking-wide text-slate-900 truncate">
                            {product.name}
                          </h4>
                          {product.badge && (
                            <span className="text-[9px] font-bold bg-[#FFF0F9] text-[#EC3460] px-1.5 py-0.2 rounded border border-[#FFCDF2]/60">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {product.subtitle} · {product.volume}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">
                          SKU: {product.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {product.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {product.price}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-[10px] text-slate-400 font-mono line-through">
                            {product.compareAtPrice}
                          </span>
                        )}
                      </td>

                      {/* Inventory Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-800">
                            {product.stockQuantity} in stock
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                          product.stockQuantity === 0
                            ? 'bg-rose-100 text-rose-700'
                            : product.stockQuantity < 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {product.stockQuantity === 0 ? 'Out of Stock' : product.stockQuantity < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* Status Active / Draft Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleStatus(product.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
                            product.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Draft"
                        >
                          {product.status === 'active' ? '● Active' : '○ Draft'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#EC3460] hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>

                          {deleteConfirmId === product.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteProduct(product.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
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

      {/* ================================================================= */}
      {/* Add / Edit Product Modal */}
      {/* ================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-anton text-xl uppercase tracking-wide text-slate-950">
                  {editingProduct ? 'Edit Skincare Product' : 'Create New Skincare Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  Formulation properties will immediately sync across storefront components.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. MEDICUBE PDRN PINK"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subtitle / Active Formula *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Rose PDRN Peptide Serum"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
                  />
                </div>
              </div>

              {/* Price, Compare-At Price, Stock & Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.numericPrice || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormData({ 
                        ...formData, 
                        numericPrice: val, 
                        price: `$${val.toFixed(2)}` 
                      });
                    }}
                    placeholder="36.00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Compare-At Price ($)
                  </label>
                  <input
                    type="text"
                    value={formData.compareAtPrice || ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="$45.00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity || 0}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    placeholder="50"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store Status
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-semibold text-slate-900 cursor-pointer"
                  >
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Category, Volume, SKU, Badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Serums'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-semibold text-slate-900 cursor-pointer"
                  >
                    <option value="Serums">Serums</option>
                    <option value="Moisturizers">Moisturizers</option>
                    <option value="Masks">Masks</option>
                    <option value="Cleansers">Cleansers</option>
                    <option value="Eye Care">Eye Care</option>
                    <option value="Sets & Bundles">Sets &amp; Bundles</option>
                    <option value="Tools & Rollers">Tools &amp; Rollers</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Volume / Size
                  </label>
                  <input
                    type="text"
                    value={formData.volume || ''}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    placeholder="30 ml / 1.01 fl. oz."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="LF-SRM-101"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Storefront Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Bestseller / Award Winner"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
                  />
                </div>
              </div>

              {/* Product Visual / Image Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Product Image &amp; Studio Backdrop
                  </label>
                </div>
                
                {/* Preset Picker */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        src: preset.url,
                        bg: preset.bg,
                        panel: preset.panel 
                      })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        formData.src === preset.url
                          ? 'border-[#EC3460] bg-rose-50/60 ring-2 ring-[#EC3460]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] font-medium text-slate-800 line-clamp-1">
                        {preset.label.split('(')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Image URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.src || ''}
                    onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                    placeholder="Or enter custom image URL: /products/your-image.jpg or https://..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono text-[11px] text-slate-900"
                  />
                  {formData.src && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={formData.src} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Clinical Claim */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Claim / Proof Line
                  </label>
                  <input
                    type="text"
                    value={formData.clinicalClaim || ''}
                    onChange={(e) => setFormData({ ...formData, clinicalClaim: e.target.value })}
                    placeholder="+192% Collagen Synthesis & Instant Plump"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.fullDescription || ''}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    placeholder="Enter detailed Korean beauty formula benefits, sensory texture, and skin finish..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ingredients (Full INCI List)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.allIngredients || ''}
                    onChange={(e) => setFormData({ ...formData, allIngredients: e.target.value })}
                    placeholder="Water, Rosa Damascena Flower Water, Butylene Glycol, Sodium DNA, Niacinamide..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
