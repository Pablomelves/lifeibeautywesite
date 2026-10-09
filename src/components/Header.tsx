import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { CATEGORIES } from '../data/storeData';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  profileIncomplete?: boolean;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: (tab?: 'points' | 'orders' | 'tracking' | 'profile' | 'wishlist' | 'favorites') => void;
  onSelectCategory: (catId: string) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenShopifyConnect?: () => void;
  isShopifyConnected?: boolean;
  onOpenAdmin?: () => void;
  onOpenTrackOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  profileIncomplete,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  onSelectCategory,
  onNavigateSection,
  onOpenAbout,
  onOpenContact,
  onOpenShopifyConnect,
  isShopifyConnected,
  onOpenAdmin,
  onOpenTrackOrder,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (catId: string) => {
    setShopMenuOpen(false);
    setMobileNavOpen(false);
    onSelectCategory(catId);
    onNavigateSection('bestsellers');
  };

  return (
    <header 
      className={`sticky top-0 z-[65] transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 text-slate-900 py-3' 
          : 'bg-white/85 sm:bg-white/70 backdrop-blur-sm border-b border-slate-200/40 text-slate-900 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center justify-between">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => onNavigateSection('hero')}
            className="text-left cursor-pointer group"
          >
            <img 
              src="/BC0C39FF-CA32-434C-8D58-12498BC5C2E2.png" 
              alt="LI FEI BEAUTY" 
              className="block h-9 sm:h-12 w-auto object-contain transition-opacity group-hover:opacity-80"
            />
            <span className="font-inter text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[#A64D63] font-medium block mt-0.5">
              Life looks better with lifei
            </span>
          </button>
        </div>

        {/* Right Side: Menu on the right side + Action Icons */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-7">
          {/* Menu on the right side */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-[12px] font-inter font-medium uppercase tracking-[0.12em]">
            <button 
              onClick={() => onNavigateSection('hero')}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
            >
              Home
            </button>

            {/* Shop with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <button 
                onClick={() => {
                  onSelectCategory('all');
                  onNavigateSection('bestsellers');
                }}
                className="flex items-center gap-1 hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
              >
                <span>Shop</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${shopMenuOpen ? 'rotate-180 text-[#EC3460]' : ''}`} />
              </button>

              {shopMenuOpen && (
                <div className="absolute top-full -left-6 w-64 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-100 p-3 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
                      BROWSE BY CATEGORY
                    </span>
                  </div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#FFF0F9] hover:text-[#EC3460] transition-all text-xs font-medium cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400">{cat.count}</span>
                    </button>
                  ))}
                  <div className="pt-2 mt-1 border-t border-slate-100 px-3">
                    <span className="text-[10px] text-[#EC3460] font-semibold flex items-center gap-1">
                      <ShieldCheck size={12} />
                      100% Verified Seoul Batches
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigateSection('bestsellers')}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800 flex items-center gap-1"
            >
              <span>Best Sellers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
            </button>

            {/* Rolling Facial Menu Link */}
            <button 
              onClick={() => onNavigateSection('rolling-facial')}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800 flex items-center gap-1"
            >
              <span>Rolling Facial</span>
              <span className="text-[9px] bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-1.5 py-0.2 rounded-full font-bold">
                B&A
              </span>
            </button>

            <button 
              onClick={() => onNavigateSection('concerns')}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
            >
              Concerns
            </button>

            <button 
              onClick={() => onNavigateSection('routine')}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
            >
              Routine
            </button>

            {/* Wishlist Menu Link */}
            <button 
              onClick={() => onOpenAccount('favorites')}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800 flex items-center gap-1.5 relative group"
            >
              <Heart size={13} className="text-[#EC3460] group-hover:scale-110 transition-transform" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#EC3460] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs animate-pop">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenAbout}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
            >
              About
            </button>

            <button 
              onClick={onOpenContact}
              className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
            >
              Contact
            </button>

            {onOpenTrackOrder && (
              <button 
                onClick={onOpenTrackOrder}
                className="hover:text-[#EC3460] transition-colors cursor-pointer py-1 text-slate-800"
              >
                Track Order
              </button>
            )}
          </nav>

          {/* Action Icons: Shopify, Search, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            {/* Admin Hub Button - Hidden on small mobile */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                aria-label="Open Store Admin Hub"
                title="Store Operations & Admin Hub"
                className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border border-slate-900 bg-slate-950 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs hover:scale-102"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460] animate-pulse" />
                <span>Admin Hub</span>
              </button>
            )}

            {/* Shopify Storefront indicator / button - Hidden on small mobile */}
            {onOpenShopifyConnect && (
              <button
                onClick={onOpenShopifyConnect}
                aria-label="Shopify Storefront Settings"
                title={isShopifyConnected ? "Shopify Headless Storefront Connected" : "Connect Shopify Storefront API"}
                className={`hidden md:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isShopifyConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-[#FFF0F9] text-[#B31940] border-[#FFCDF2] hover:bg-[#FFE6F6]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isShopifyConnected ? 'bg-emerald-500 animate-pulse' : 'bg-[#EC3460]'}`} />
                <span>{isShopifyConnected ? 'Shopify Live' : 'Shopify'}</span>
              </button>
            )}

            <button
              onClick={onOpenSearch}
              aria-label="Search products"
              className="p-1.5 sm:p-2 text-slate-700 hover:text-[#EC3460] hover:bg-[#FFF0F9] rounded-full transition-colors cursor-pointer"
              title="Search formulas"
            >
              <Search size={18} strokeWidth={2} />
            </button>

            <button
              onClick={() => onOpenAccount()}
              aria-label="Account and Glow Club"
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#EC3460] hover:bg-[#FFF0F9] rounded-full transition-colors cursor-pointer"
              title="Account & Glow Rewards"
            >
              <User size={18} strokeWidth={2} />
              {profileIncomplete && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC3460] rounded-full border border-white animate-pulse" />
              )}
            </button>

            <button
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#EC3460] hover:bg-[#FFF0F9] rounded-full transition-colors cursor-pointer"
              title="View Bag"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EC3460] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              aria-label="Toggle menu"
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigateSection('hero');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              Home
            </button>
            <button
              onClick={() => {
                onSelectCategory('all');
                onNavigateSection('bestsellers');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              Shop All Products
            </button>
            <button
              onClick={() => {
                onNavigateSection('bestsellers');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              Best Sellers
            </button>
            <button
              onClick={() => {
                onNavigateSection('rolling-facial');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm flex items-center justify-between"
            >
              <span>Before & After Rolling Facial</span>
              <span className="text-[10px] bg-[#FFF0F9] text-[#B31940] px-2 py-0.5 rounded-full font-bold">
                Clinical
              </span>
            </button>
            <button
              onClick={() => {
                onNavigateSection('concerns');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              Skin Concerns Guide
            </button>
            <button
              onClick={() => {
                onNavigateSection('routine');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              5-Step Skincare Routine
            </button>
            <button
              onClick={() => {
                onOpenAccount('profile');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm flex items-center gap-2"
            >
              <User size={14} className="text-slate-500" />
              <span>My Account & Orders</span>
            </button>
            <button
              onClick={() => {
                onOpenSearch();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm flex items-center gap-2"
            >
              <Search size={14} className="text-slate-500" />
              <span>Search Products</span>
            </button>
            <button
              onClick={() => {
                onOpenAccount('favorites');
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-[#EC3460]" />
                <span>My Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-[#EC3460] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onOpenAbout();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              About Li Fei Beauty
            </button>
            <button
              onClick={() => {
                onOpenContact();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm"
            >
              Contact Us
            </button>
            {onOpenTrackOrder && (
              <button
                onClick={() => {
                  onOpenTrackOrder();
                  setMobileNavOpen(false);
                }}
                className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm flex items-center justify-between"
              >
                <span>Track My Order</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  Tracking
                </span>
              </button>
            )}
            {onOpenAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileNavOpen(false);
                }}
                className="text-left py-2 font-medium text-slate-900 hover:text-[#EC3460] text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
                <span>Admin Hub Operations</span>
              </button>
            )}
            {onOpenShopifyConnect && (
              <button
                onClick={() => {
                  onOpenShopifyConnect();
                  setMobileNavOpen(false);
                }}
                className="text-left py-2 font-medium text-[#EC3460] text-sm flex items-center gap-2"
              >
                <ShoppingBag size={14} />
                <span>Shopify Storefront API Settings</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct Seoul Sourcing</span>
            <span className="text-emerald-700 font-semibold">100% Genuine</span>
          </div>
        </div>
      )}
    </header>
  );
};
