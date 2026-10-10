import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Gift, 
  Package, 
  ShieldCheck, 
  Heart, 
  LogIn, 
  ShoppingBag, 
  Eye, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  Truck,
  CheckCircle,
  Search,
  Clock,
  MapPin,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Product } from '../types';

export interface OrderItem {
  id: number;
  name: string;
  volume: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PastOrder {
  id: string;
  date: string;
  email: string;
  status: 'Delivered' | 'In Transit' | 'Seoul Lab Processing';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  items: OrderItem[];
  total: number;
  stepIndex: number; // 0 to 3
  origin: string;
  destination: string;
}

const INITIAL_ORDERS: PastOrder[] = [];

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds?: number[];
  products?: Product[];
  onToggleWishlist?: (productId: number) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  initialTab?: 'points' | 'orders' | 'tracking' | 'profile' | 'wishlist' | 'favorites';
  onNavigateSection?: (sectionId: string) => void;
  onOpenTrackOrder?: (orderNumber: string, email: string) => void;
  profileInfo: any;
  onUpdateProfile: (info: any) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ 
  isOpen, 
  onClose,
  wishlistIds = [],
  products,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  initialTab = 'points',
  onNavigateSection,
  onOpenTrackOrder,
  profileInfo,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'points' | 'orders' | 'tracking' | 'profile' | 'wishlist' | 'favorites'>(initialTab);
  const [pastOrders] = useState<PastOrder[]>([]);

  // Personal Information State (Lifted to App.tsx)
  const isProfileIncomplete = !profileInfo.firstName || !profileInfo.lastName || !profileInfo.email;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const catalog = products || [];

  // AI Recommendations Fetcher
  const fetchRecommendations = async () => { setRecommendedIds([]); setIsRecLoading(false); };

  useEffect(() => {
    if (activeTab === 'profile' && (profileInfo.skinGoal || profileInfo.skinType)) {
      fetchRecommendations();
    }
  }, [activeTab, profileInfo.skinGoal, profileInfo.skinType]);

  // Auto-save feedback loop
  useEffect(() => {
    if (isOpen) {
      setIsAutoSaving(true);
      const timer = setTimeout(() => setIsAutoSaving(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [profileInfo, isOpen]);

  useEffect(() => {
    if (activeTab === 'profile' && isProfileIncomplete) {
      setIsEditingProfile(true);
    }
  }, [activeTab, isProfileIncomplete]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTrackingNotice('Profile information updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setTrackingNotice(null), 3000);
    } catch (e) {
      // ignore
    }
  };

  // Order Tracking Form State
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [trackingEmail, setTrackingEmail] = useState('');
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<PastOrder | null>(null);
  const [isCopiedTracking, setIsCopiedTracking] = useState(false);
  const [trackingNotice, setTrackingNotice] = useState<string | null>(null);
  const [addedModalIds, setAddedModalIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const wishlistedProducts = catalog.filter((p) => wishlistIds.includes(p.id));

  const handleAddAllWishlist = () => {
    if (!onAddToCart) return;
    wishlistedProducts.forEach((prod) => {
      onAddToCart(prod);
    });
  };

  // Dummy order generator
  const handleGenerateDummyOrder = () => { setTrackingNotice('Order history is not connected here. Use the order confirmation sent by Shopify.'); };

  const handleTrackSubmit = (event: React.FormEvent) => {
    event.preventDefault(); setActiveTrackedOrder(null);
    setTrackingNotice('Order lookup is not connected here. Use the tracking link in your Shopify shipping confirmation or contact support.');
  };

  const handleJumpToTracking = (order: PastOrder) => {
    if (onOpenTrackOrder) {
      onClose();
      onOpenTrackOrder(order.id, order.email || '');
      return;
    }
    setActiveTrackedOrder(order);
    setTrackingOrderNumber(order.id);
    setActiveTab('tracking');
  };

  const handleCopyTracking = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setIsCopiedTracking(true);
      setTimeout(() => setIsCopiedTracking(false), 2000);
    }
  };

  const trackingSteps = [
    { title: 'Order Verified & Certified', desc: 'Seoul HQ laboratory allocation & authenticity check' },
    { title: 'Quality Sealed & Packed', desc: 'Cryo-temperature packaging sealed in Gangnam' },
    { title: 'In Flight via Air Cargo', desc: 'Direct flight from Incheon Airport to destination' },
    { title: 'Delivered to Doorstep', desc: 'Package signed and safely received' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative my-auto flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F5]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              LF
            </div>
            <div>
              <h3 className="font-bold text-base uppercase text-slate-900">
                Glow Club Member
              </h3>
              <span className="text-xs text-[#EC3460] font-semibold flex items-center gap-1">
                <Gift size={12} />
                Tier 2: Glass Skin Connoisseur
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
            aria-label="Close account"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-100 px-3 sm:px-6 pt-2 text-xs font-semibold overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('points')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'points'
                ? 'border-[#EC3460] text-[#EC3460]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Glow Rewards
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'favorites' || activeTab === 'wishlist'
                ? 'border-[#EC3460] text-[#EC3460]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Heart size={13} fill={(activeTab === 'favorites' || activeTab === 'wishlist') && wishlistedProducts.length > 0 ? '#EC3460' : 'none'} />
            <span>My Favorites</span>
            {wishlistedProducts.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'favorites' || activeTab === 'wishlist' ? 'bg-[#EC3460] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {wishlistedProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#EC3460] text-[#EC3460]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Package size={13} />
            <span>Past Orders</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
              {pastOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'border-[#EC3460] text-[#EC3460]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Truck size={13} />
            <span>Order Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#EC3460] text-[#EC3460]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <User size={13} />
            <span>My Profile</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[62vh]">
          {trackingNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>{trackingNotice}</span>
            </div>
          )}

          {/* =========================================================
              1. My Favorites Tab (Wishlist with Direct Add to Cart)
          ========================================================= */}
          {(activeTab === 'favorites' || activeTab === 'wishlist') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block">
                    SAVED WISHLIST COLLECTION
                  </span>
                  <h4 className="font-anton text-xl uppercase text-slate-900 tracking-tight">
                    MY FAVORITES ({wishlistedProducts.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateSection && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateSection('my-favorites');
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-[#EC3460] flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-[#FFF0F9] border border-slate-200 hover:border-[#FFCDF2] px-3 py-1.5 rounded-xl transition-all"
                      title="View on dedicated storefront section"
                    >
                      <span>View on Storefront</span>
                      <ArrowRight size={12} />
                    </button>
                  )}

                  {wishlistedProducts.length > 1 && onAddToCart && (
                    <button
                      type="button"
                      onClick={handleAddAllWishlist}
                      className="text-xs font-semibold text-[#EC3460] hover:text-[#D8224F] flex items-center gap-1 cursor-pointer bg-[#FFF0F9] border border-[#FFCDF2] px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                    >
                      <ShoppingBag size={12} />
                      <span>Add All to Bag</span>
                    </button>
                  )}
                </div>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFF0F9] border border-[#FFCDF2] text-[#EC3460] flex items-center justify-center mx-auto mb-3">
                    <Heart size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm uppercase">Your Favorites list is empty</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Tap the heart icon on any product in Best Sellers or Product Details to curate your favorite Korean skincare formulas.
                  </p>
                  {onNavigateSection && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateSection('bestsellers');
                      }}
                      className="mt-4 px-4 py-2 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-raspberry"
                    >
                      Browse Best Sellers
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistedProducts.map((product) => {
                    const isAdded = !!addedModalIds[product.id];

                    return (
                      <div
                        key={product.id}
                        className="p-3.5 rounded-2xl border border-slate-100 hover:border-[#FFCDF2] bg-white flex items-center justify-between gap-3 transition-colors group"
                      >
                        {/* Product Thumbnail */}
                        <div 
                          onClick={() => onQuickView && onQuickView(product)}
                          className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/50 cursor-pointer"
                          style={{ backgroundColor: product.panel }}
                        >
                          <img 
                            src={product.src} 
                            alt={product.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] uppercase font-bold text-[#EC3460] bg-[#FFF0F9] px-1.5 py-0.2 rounded border border-[#FFCDF2]/50">
                              {product.category}
                            </span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">{product.stockStatus}</span>
                          </div>
                          <h5 
                            onClick={() => onQuickView && onQuickView(product)}
                            className="text-xs font-bold uppercase text-slate-900 truncate hover:text-[#EC3460] cursor-pointer"
                          >
                            {product.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 truncate">{product.subtitle}</p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-mono text-xs font-bold text-slate-900">{product.price}</span>
                            {product.originalPrice && (
                              <span className="font-mono text-[10px] text-slate-400 line-through">{product.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onQuickView && (
                            <button
                              type="button"
                              onClick={() => onQuickView(product)}
                              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                              title="Quick View"
                              aria-label="Quick View"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {onAddToCart && (
                            <button
                              type="button"
                              onClick={() => {
                                onAddToCart(product);
                                setAddedModalIds(prev => ({ ...prev, [product.id]: true }));
                                setTimeout(() => setAddedModalIds(prev => ({ ...prev, [product.id]: false })), 1800);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#EC3460] hover:bg-[#D8224F] text-white shadow-raspberry'
                              }`}
                              title="Add to Bag"
                            >
                              {isAdded ? (
                                <>
                                  <Check size={13} strokeWidth={3} />
                                  <span className="hidden sm:inline">Added!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={13} />
                                  <span className="hidden sm:inline">Add</span>
                                </>
                              )}
                            </button>
                          )}
                          {onToggleWishlist && (
                            <button
                              type="button"
                              onClick={() => onToggleWishlist(product.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Remove from favorites"
                              aria-label="Remove from favorites"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              2. Order Tracking Tab (Interactive Search & Simulation)
          ========================================================= */}
          {activeTab === 'tracking' && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block mb-1">
                  SEOUL DIRECT SHIPMENT TRACKING
                </span>
                <h4 className="font-anton text-xl uppercase text-slate-900 tracking-tight">
                  LIVE CARRIER TRACKING
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your order number or tracking code to monitor real-time Seoul airport cargo dispatch.
                </p>
              </div>

              {/* Order Number & Email Search Form */}
              <form onSubmit={handleTrackSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Order Number
                    </label>
                    <input
                      type="text"
                      required
                      value={trackingOrderNumber}
                      onChange={(e) => setTrackingOrderNumber(e.target.value)}
                      placeholder="#LF-94108"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold uppercase focus:outline-none focus:border-[#EC3460]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Billing Email
                    </label>
                    <input
                      type="email"
                      required
                      value={trackingEmail}
                      onChange={(e) => setTrackingEmail(e.target.value)}
                      placeholder="customer@lifeibeauty.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Try <strong className="font-mono text-slate-800 cursor-pointer underline" onClick={() => setTrackingOrderNumber('#LF-94108')}>#LF-94108</strong> or <strong className="font-mono text-slate-800 cursor-pointer underline" onClick={() => setTrackingOrderNumber('#LF-89241')}>#LF-89241</strong>
                  </span>
                  <button
                    type="submit"
                    className="bg-[#EC3460] hover:bg-[#D8224F] text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Search size={13} />
                    <span>Track</span>
                  </button>
                </div>
              </form>

              {/* Active Tracking Status Card */}
              {activeTrackedOrder && (
                <div className="bg-white rounded-2xl border border-[#FFCDF2] p-5 shadow-xs space-y-4">
                  {/* Status Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {activeTrackedOrder.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          activeTrackedOrder.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : activeTrackedOrder.status === 'In Transit'
                            ? 'bg-sky-100 text-sky-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {activeTrackedOrder.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeTrackedOrder.carrier}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Tracking ID</span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {activeTrackedOrder.trackingNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyTracking(activeTrackedOrder.trackingNumber)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
                        title="Copy tracking number"
                        aria-label="Copy tracking number"
                      >
                        {isCopiedTracking ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Route & Delivery Date */}
                  <div className="bg-[#FFF5FA] p-3.5 rounded-xl border border-[#FFCDF2]/60 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Estimated Delivery
                      </span>
                      <span className="font-bold text-[#EC3460] flex items-center gap-1 mt-0.5">
                        <Clock size={13} />
                        {activeTrackedOrder.estimatedDelivery}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Dispatch Origin
                      </span>
                      <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={13} className="text-[#EC3460] shrink-0" />
                        Seoul, South Korea
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Bar */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                      Shipment Progress Timeline
                    </span>
                    <div className="space-y-3">
                      {trackingSteps.map((step, idx) => {
                        const isDone = idx <= activeTrackedOrder.stepIndex;
                        const isCurrent = idx === activeTrackedOrder.stepIndex;

                        return (
                          <div key={idx} className="flex items-start gap-3 relative">
                            {idx < trackingSteps.length - 1 && (
                              <div className={`absolute left-3 top-5 w-0.5 h-7 -translate-x-1/2 ${
                                idx < activeTrackedOrder.stepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                              }`} />
                            )}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white z-10 ${
                              isDone
                                ? isCurrent
                                  ? 'bg-[#EC3460] ring-4 ring-[#FFCDF2]'
                                  : 'bg-emerald-500'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isDone ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                            </div>
                            <div className="flex-1">
                              <h5 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#EC3460]' : 'text-slate-900'}`}>
                                {step.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items in this package */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Package Contents ({activeTrackedOrder.items.length})
                    </span>
                    <div className="space-y-2">
                      {activeTrackedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover object-center bg-white border border-slate-200" />
                            <div>
                              <span className="font-bold text-slate-800 block truncate max-w-[180px]">{item.name}</span>
                              <span className="text-[10px] text-slate-500">Qty: {item.quantity} · {item.volume}</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              3. Order History Tab (With Dummy Data Generator)
          ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block">
                    PURCHASE ARCHIVE
                  </span>
                  <h4 className="font-anton text-xl uppercase text-slate-900 tracking-tight">
                    ORDER HISTORY ({pastOrders.length})
                  </h4>
                </div>


              </div>

              {pastOrders.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Package size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm uppercase">No Past Orders Found</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Authenticated order history is not connected here. Check your Shopify order confirmation or contact support.
                  </p>

                </div>
              ) : (
                <div className="space-y-3.5">
                  {pastOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="p-4 bg-slate-50 hover:bg-[#FFF5FA] rounded-2xl border border-slate-200/80 hover:border-[#FFCDF2] transition-colors space-y-3"
                    >
                      {/* Top Row: Order ID, Date, Status */}
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold font-mono text-slate-900 block">{order.id}</span>
                          <span className="text-[11px] text-slate-500">Ordered on {order.date}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'In Transit'
                            ? 'bg-sky-100 text-sky-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1.5 pt-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover object-center bg-[#FAF7F5] border border-slate-200" />
                              <div className="truncate max-w-[200px]">
                                <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                                <span className="text-[10px] text-slate-500">{item.volume} · Qty {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Total & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Total Paid</span>
                          <span className="font-bold font-mono text-slate-900 text-sm">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleJumpToTracking(order)}
                          className="bg-white hover:bg-[#EC3460] text-slate-700 hover:text-white border border-slate-200 hover:border-[#EC3460] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Truck size={13} />
                          <span>Track Shipment</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              4. Glow Rewards Tab
          ========================================================= */}
          {activeTab === 'points' && <div className="space-y-4 rounded-2xl bg-[#FFF5FA] border border-[#FFCDF2] p-6 text-sm text-slate-600">No connected rewards program or verified reward balance is available. Your saved favorites remain accessible in the Wishlist tab.</div>}

          {/* =========================================================
              5. Customer Profile Tab
          ========================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block">
                    ACCOUNT PREFERENCES
                  </span>
                  <h4 className="font-anton text-xl uppercase text-slate-900 tracking-tight flex items-center gap-2">
                    MY PROFILE 
                    {isProfileIncomplete && <span className="text-rose-500 text-xs font-sans font-bold">(Incomplete)</span>}
                    {isAutoSaving && (
                      <span className="text-emerald-600 text-[10px] font-sans font-bold animate-pulse flex items-center gap-1 ml-2">
                        <CheckCircle size={10} />
                        Changes Saved
                      </span>
                    )}
                  </h4>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs font-bold text-[#EC3460] hover:text-[#D8224F] px-3 py-1.5 rounded-xl bg-[#FFF0F9] border border-[#FFCDF2] transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {isProfileIncomplete && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-medium leading-relaxed">
                      Welcome to Li Fei Beauty! Please complete your personal information to unlock full Glow Club benefits and faster Seoul dispatch.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">First Name</label>
                      <input
                        type="text"
                        value={profileInfo.firstName}
                        onChange={(e) => onUpdateProfile({ ...profileInfo, firstName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={profileInfo.lastName}
                        onChange={(e) => onUpdateProfile({ ...profileInfo, lastName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileInfo.email}
                      onChange={(e) => onUpdateProfile({ ...profileInfo, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileInfo.phone}
                      onChange={(e) => onUpdateProfile({ ...profileInfo, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Primary Skin Goal</label>
                      <select
                        value={profileInfo.skinGoal || ''}
                        onChange={(e) => onUpdateProfile({ ...profileInfo, skinGoal: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460] appearance-none"
                      >
                        <option value="">Select Goal</option>
                        <option value="Glass Skin Glow">Glass Skin Glow</option>
                        <option value="Anti-Aging & Firmness">Anti-Aging & Firmness</option>
                        <option value="Pore Refinement">Pore Refinement</option>
                        <option value="Brightening & Dark Spots">Brightening & Dark Spots</option>
                        <option value="Barrier Repair">Barrier Repair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Skin Type</label>
                      <select
                        value={profileInfo.skinType || ''}
                        onChange={(e) => onUpdateProfile({ ...profileInfo, skinType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460] appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="Dry">Dry</option>
                        <option value="Oily">Oily</option>
                        <option value="Combination">Combination</option>
                        <option value="Sensitive">Sensitive</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Shipping Destination</span>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={profileInfo.address}
                          onChange={(e) => onUpdateProfile({ ...profileInfo, address: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">City</label>
                          <input
                            type="text"
                            value={profileInfo.city}
                            onChange={(e) => onUpdateProfile({ ...profileInfo, city: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">ZIP Code</label>
                          <input
                            type="text"
                            value={profileInfo.zip}
                            onChange={(e) => onUpdateProfile({ ...profileInfo, zip: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EC3460]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#EC3460] hover:bg-[#D8224F] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-raspberry transition-all"
                    >
                      Done
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Full Name</span>
                      <span className="text-xs font-bold text-slate-900">{profileInfo.firstName} {profileInfo.lastName}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Phone</span>
                      <span className="text-xs font-bold text-slate-900">{profileInfo.phone}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Email Address</span>
                    <span className="text-xs font-bold text-slate-900">{profileInfo.email}</span>
                  </div>

                  <div className="p-4 bg-[#FFF5FA] rounded-2xl border border-[#FFCDF2]/60">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-[#EC3460]" />
                      <span className="text-[10px] font-bold uppercase text-[#EC3460]">Default Shipping Address</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {profileInfo.address}<br />
                      {profileInfo.city}, {profileInfo.zip}<br />
                      {profileInfo.country}
                    </p>
                  </div>

                  <div className="pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      SKIN GENETIC PROFILE
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="font-bold text-slate-900 uppercase block text-[10px] mb-1">Primary Skin Goal</label>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium">
                          {profileInfo.skinGoal || 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-900 uppercase block text-[10px] mb-1">Skin Type</label>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium">
                          {profileInfo.skinType || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations Section */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] flex items-center gap-2">
                        <Sparkles size={14} className="text-[#EC3460] animate-pulse" />
                        Recommended for You
                      </span>
                      {isRecLoading && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-[#EC3460] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-1 bg-[#EC3460] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-1 bg-[#EC3460] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>

                    {recommendedIds.length > 0 ? (
                      <div className="space-y-3">
                        {recommendedIds.map(id => {
                          const product = catalog.find(p => p.id === id);
                          if (!product) return null;
                          const isAdded = !!addedModalIds[product.id];

                          return (
                            <div key={id} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 hover:border-[#FFCDF2] transition-colors group">
                              <div 
                                className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 cursor-pointer"
                                onClick={() => onQuickView && onQuickView(product)}
                              >
                                <img src={product.src} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 
                                  className="text-[11px] font-bold text-slate-900 truncate hover:text-[#EC3460] cursor-pointer uppercase"
                                  onClick={() => onQuickView && onQuickView(product)}
                                >
                                  {product.name}
                                </h5>
                                <p className="text-[10px] text-slate-500 truncate">{product.subtitle}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onAddToCart && onAddToCart(product);
                                  setAddedModalIds(prev => ({ ...prev, [product.id]: true }));
                                  setTimeout(() => setAddedModalIds(prev => ({ ...prev, [product.id]: false })), 1800);
                                }}
                                className={`p-2 rounded-lg transition-all ${
                                  isAdded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-[#EC3460] hover:bg-[#FFF0F9]'
                                }`}
                              >
                                {isAdded ? <Check size={14} strokeWidth={3} /> : <ShoppingBag size={14} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          Complete your skin profile above to unlock AI-curated Korean skincare recommendations tailored to your unique goals.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
