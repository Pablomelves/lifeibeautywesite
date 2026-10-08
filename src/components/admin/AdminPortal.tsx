import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Layers, 
  Tag, 
  Star, 
  FileText, 
  ArrowLeft, 
  LogOut, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Check, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Store,
  Zap
} from 'lucide-react';
import { FastPictureProcessorModal } from '../FastPictureProcessorModal';
import { 
  AdminProduct, 
  Order, 
  Customer, 
  Discount, 
  ReviewModeration, 
  StoreContentSettings, 
  AdminUser 
} from '../../types';
import { 
  getAdminAuth, 
  loginAdmin, 
  logoutAdmin, 
  getAdminProducts, 
  addAdminProduct, 
  updateAdminProduct, 
  deleteAdminProduct, 
  toggleProductStatus, 
  saveAdminProducts,
  getAdminOrders, 
  updateOrder, 
  cancelAndRefundOrder, 
  fulfillOrder, 
  getAdminCustomers, 
  saveAdminCustomers,
  getAdminDiscounts, 
  saveAdminDiscounts,
  getAdminReviews, 
  saveAdminReviews,
  getStoreContentSettings, 
  saveStoreContentSettings, 
  getDashboardMetrics 
} from '../../services/adminService';

import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminCustomersTab } from './AdminCustomersTab';
import { AdminInventoryTab } from './AdminInventoryTab';
import { AdminDiscountsTab } from './AdminDiscountsTab';
import { AdminReviewsTab } from './AdminReviewsTab';
import { AdminContentTab } from './AdminContentTab';

interface AdminPortalProps {
  onClose: () => void;
  onRefreshStoreData?: () => void;
  onLogoutSuccess?: () => void;
  onLoginSuccess?: (user: AdminUser) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  onRefreshStoreData,
  onLogoutSuccess,
  onLoginSuccess,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getAdminAuth());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'discounts' | 'reviews' | 'content'
  >('dashboard');

  // Selected order for direct opening from dashboard
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Fast Picture Processor modal state
  const [isPictureProcessorOpen, setIsPictureProcessorOpen] = useState(false);

  // Live state
  const [products, setProducts] = useState<AdminProduct[]>(() => getAdminProducts());
  const [orders, setOrders] = useState<Order[]>(() => getAdminOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => getAdminCustomers());
  const [discounts, setDiscounts] = useState<Discount[]>(() => getAdminDiscounts());
  const [reviews, setReviews] = useState<ReviewModeration[]>(() => getAdminReviews());
  const [contentSettings, setContentSettings] = useState<StoreContentSettings>(() => getStoreContentSettings());

  // Metrics
  const metrics = getDashboardMetrics();

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await loginAdmin(loginEmail, loginPass);
    setIsLoggingIn(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      showToast(`Welcome back, ${result.user.name}`);
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } else {
      setLoginError(result.error || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    showToast('Signed out of Admin Hub');
    if (onLogoutSuccess) {
      onLogoutSuccess();
    } else {
      onClose();
    }
  };

  // Product handlers
  const handleAddProduct = (newProd: Omit<AdminProduct, 'id'>) => {
    const created = addAdminProduct(newProd);
    setProducts(getAdminProducts());
    showToast(`Added formula ${created.name}`);
    if (onRefreshStoreData) onRefreshStoreData();
  };

  const handleUpdateProduct = (updated: AdminProduct) => {
    updateAdminProduct(updated);
    setProducts(getAdminProducts());
    showToast(`Updated ${updated.name}`);
    if (onRefreshStoreData) onRefreshStoreData();
  };

  const handleDeleteProduct = (productId: number) => {
    deleteAdminProduct(productId);
    setProducts(getAdminProducts());
    showToast('Product removed from catalog');
    if (onRefreshStoreData) onRefreshStoreData();
  };

  const handleToggleProductStatus = (productId: number) => {
    const updated = toggleProductStatus(productId);
    setProducts(getAdminProducts());
    if (updated) {
      showToast(`${updated.name} marked as ${updated.status.toUpperCase()}`);
    }
    if (onRefreshStoreData) onRefreshStoreData();
  };

  const handleSaveInventory = (updatedProducts: AdminProduct[]) => {
    saveAdminProducts(updatedProducts);
    setProducts(getAdminProducts());
    showToast('Inventory level updated');
    if (onRefreshStoreData) onRefreshStoreData();
  };

  // Order handlers
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    updateOrder(orderId, updates);
    setOrders(getAdminOrders());
    showToast(`Order ${orderId} updated`);
  };

  const handleCancelAndRefund = (orderId: string) => {
    cancelAndRefundOrder(orderId);
    setOrders(getAdminOrders());
    showToast(`Order ${orderId} cancelled & refunded`);
  };

  const handleFulfillOrder = (orderId: string, trackingNumber: string, carrier?: string) => {
    fulfillOrder(orderId, trackingNumber, carrier);
    setOrders(getAdminOrders());
    showToast(`Order ${orderId} marked shipped with tracking`);
  };

  // Customer handlers
  const handleSaveCustomers = (updatedCustomers: Customer[]) => {
    saveAdminCustomers(updatedCustomers);
    setCustomers(getAdminCustomers());
    showToast('Customer profile notes updated');
  };

  // Discount handlers
  const handleSaveDiscounts = (updatedDiscounts: Discount[]) => {
    saveAdminDiscounts(updatedDiscounts);
    setDiscounts(getAdminDiscounts());
    showToast('Discount rule updated');
  };

  // Review handlers
  const handleSaveReviews = (updatedReviews: ReviewModeration[]) => {
    saveAdminReviews(updatedReviews);
    setReviews(getAdminReviews());
    showToast('Reviews updated');
    if (onRefreshStoreData) onRefreshStoreData();
  };

  // Content handlers
  const handleSaveContentSettings = (settings: StoreContentSettings) => {
    saveStoreContentSettings(settings);
    setContentSettings(settings);
    showToast('Storefront content published!');
    if (onRefreshStoreData) onRefreshStoreData();
  };

  // If not logged in, render the secure admin login screen
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-8 sm:p-10 text-slate-900 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Return to Store"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Badge & Lock Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F9] text-[#EC3460] flex items-center justify-center mb-6 shadow-cotton">
            <Lock size={24} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] bg-[#FFF0F9] px-2.5 py-1 rounded-full border border-[#FFCDF2]">
            ADMIN PORTAL ACCESS
          </span>

          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950 mt-2 mb-1">
            Li Fei Beauty Store Manager
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Log in to manage catalog, fulfillment, orders, inventory, discounts, reviews, and homepage text.
          </p>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@lifeibeauty.com"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Passkey / Password
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#EC3460] hover:bg-[#D8224F] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer mt-2"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Operations'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: metrics.unfulfilledOrdersCount > 0 ? metrics.unfulfilledOrdersCount : undefined, badgeColor: 'bg-[#EC3460]' },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'inventory', label: 'Inventory', icon: Layers, badge: metrics.lowStockCount > 0 ? metrics.lowStockCount : undefined, badgeColor: 'bg-amber-600' },
    { id: 'discounts', label: 'Discounts', icon: Tag, badge: discounts.filter(d => d.active).length },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: metrics.pendingReviewsCount > 0 ? metrics.pendingReviewsCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'content', label: 'Homepage/Content', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden font-inter animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <Check size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs z-20">
        {/* Brand & Store switcher */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#EC3460] transition-colors cursor-pointer bg-slate-50 hover:bg-[#FFF0F9] px-3 py-1.5 rounded-xl border border-slate-200/60"
            title="Return to customer store view"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back to Live Store</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <span className="font-anton text-lg uppercase tracking-tight text-slate-950">
              LI FEI BEAUTY
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF0F9] text-[#EC3460] border border-[#FFCDF2] px-2 py-0.5 rounded-md">
              ADMIN HUB
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="font-semibold text-slate-800">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400">({currentUser.role})</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Sign out of Admin Hub"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Body: Left Tab Rail + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-56 sm:w-64 bg-white border-r border-slate-200/80 p-3 sm:p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
              Store Management
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedOrderForModal(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EC3460] text-white shadow-raspberry'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badgeColor 
                        ? `${item.badgeColor} text-white` 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Studio Tools */}
            <div className="pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Studio Tools
              </span>
              <button
                type="button"
                onClick={() => setIsPictureProcessorOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FFF0F9] border border-[#FFCDF2] text-[#EC3460] hover:bg-[#EC3460] hover:text-white transition-all shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Zap size={16} className="text-[#EC3460] group-hover:text-white transition-colors" />
                  <span>Fast Picture Processor</span>
                </div>
                <span className="text-[9px] bg-[#EC3460] text-white group-hover:bg-white group-hover:text-[#EC3460] font-mono px-1.5 py-0.5 rounded-md font-bold">
                  FAST
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Store Status Pill */}
          <div className="pt-4 border-t border-slate-100 p-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
                <Store size={14} className="text-[#EC3460]" />
                <span>Headless Storefront</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Vite + Express Backend connected to live product &amp; order database.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <AdminDashboardTab
                metrics={metrics}
                onNavigateTab={(tab) => {
                  setActiveTab(tab as any);
                  setSelectedOrderForModal(null);
                }}
                onViewOrder={(order) => {
                  setSelectedOrderForModal(order);
                  setActiveTab('orders');
                }}
                onViewProduct={() => {
                  setActiveTab('products');
                }}
              />
            )}

            {activeTab === 'products' && (
              <AdminProductsTab
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onToggleStatus={handleToggleProductStatus}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrdersTab
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
                onCancelAndRefund={handleCancelAndRefund}
                onFulfillOrder={handleFulfillOrder}
                selectedOrderForModal={selectedOrderForModal}
                onCloseOrderModal={() => setSelectedOrderForModal(null)}
              />
            )}

            {activeTab === 'customers' && (
              <AdminCustomersTab
                customers={customers}
                onSaveCustomers={handleSaveCustomers}
              />
            )}

            {activeTab === 'inventory' && (
              <AdminInventoryTab
                products={products}
                onSaveProducts={handleSaveInventory}
              />
            )}

            {activeTab === 'discounts' && (
              <AdminDiscountsTab
                discounts={discounts}
                onSaveDiscounts={handleSaveDiscounts}
              />
            )}

            {activeTab === 'reviews' && (
              <AdminReviewsTab
                reviews={reviews}
                products={products}
                onSaveReviews={handleSaveReviews}
              />
            )}

            {activeTab === 'content' && (
              <AdminContentTab
                contentSettings={contentSettings}
                onSaveContentSettings={handleSaveContentSettings}
                onPreviewStorefront={onClose}
              />
            )}
          </div>
        </main>
      </div>

      {/* Fast Picture Processor Studio Modal */}
      <FastPictureProcessorModal
        isOpen={isPictureProcessorOpen}
        onClose={() => setIsPictureProcessorOpen(false)}
      />
    </div>
  );
};
