import React, { useState, useEffect, useRef } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero3D } from './components/Hero3D';
import { TrustBar } from './components/TrustBar';
import { BestSellers } from './components/BestSellers';
import { MyFavoritesSection } from './components/MyFavoritesSection';
import { CategoryGrid } from './components/CategoryGrid';
import { BeforeAfterRollingFacial } from './components/BeforeAfterRollingFacial';
import { SkinConcernSection } from './components/SkinConcernSection';
import { WhyLiFei } from './components/WhyLiFei';
import { SkincareRoutine } from './components/SkincareRoutine';
import { CustomerReviews } from './components/CustomerReviews';
import { UgcGallery } from './components/UgcGallery';
import { FaqSection } from './components/FaqSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AccountModal } from './components/AccountModal';
import { PolicyModal } from './components/PolicyModal';
import { AboutContactModal } from './components/AboutContactModal';
import { ShopifyConnectModal } from './components/ShopifyConnectModal';
import { QuickAddWidget } from './components/QuickAddWidget';
import { AdminPortal } from './components/admin/AdminPortal';
import { TrackOrderModal } from './components/TrackOrderModal';

import { Product, CartItem, StoreContentSettings, CartNotificationData } from './types';
import { createShopifyCheckout, getShopifyConfig, getShopifyProducts } from './services/shopify';
import { STORE_PRODUCTS } from './data/storeData';
import { getAdminProducts, getStoreContentSettings } from './services/adminService';
import { Check, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // Storefront products & admin sync
  const [adminProducts, setAdminProducts] = useState<Product[]>(() => {
    const adminList = getAdminProducts();
    const active = adminList.filter(p => p.status === 'active');
    return active.length > 0 ? active : STORE_PRODUCTS;
  });
  const [products, setProducts] = useState<Product[]>(adminProducts);
  const [isShopifyConnected, setIsShopifyConnected] = useState<boolean>(() => getShopifyConfig().isConnected);
  const [shopifyConnectOpen, setShopifyConnectOpen] = useState(false);

  // Storefront dynamic content
  const [contentSettings, setContentSettings] = useState<StoreContentSettings>(() => getStoreContentSettings());

  // Admin Hub Open state
  const [adminOpen, setAdminOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('admin=true');
    }
    return false;
  });

  const handleRefreshStoreData = () => {
    const freshAdminProducts = getAdminProducts();
    const active = freshAdminProducts.filter(p => p.status === 'active');
    setAdminProducts(active.length > 0 ? active : freshAdminProducts);
    if (!isShopifyConnected) {
      setProducts(active.length > 0 ? active : freshAdminProducts);
    }
    setContentSettings(getStoreContentSettings());
  };

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: STORE_PRODUCTS[0], quantity: 1 } // Medicube PDRN Pink
  ]);
  const [cartOpen, setCartOpen] = useState(false);

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<'points' | 'orders' | 'tracking' | 'profile' | 'wishlist' | 'favorites'>('points');
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [trackOrderParams, setTrackOrderParams] = useState({ orderNumber: '', email: '' });
  const [policyType, setPolicyType] = useState<'shipping' | 'returns' | 'privacy' | 'terms' | null>(null);
  const [aboutContactMode, setAboutContactMode] = useState<'about' | 'contact' | null>(null);

  const handleOpenTrackOrder = (orderNum = '', orderEmail = '') => {
    setTrackOrderParams({ orderNumber: orderNum, email: orderEmail });
    setTrackOrderOpen(true);
  };

  // Category filter state for BestSellers
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifei_wishlist');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [1, 8]; // Medicube PDRN Pink & Rose Quartz Roller as default favorites
  });

  const handleToggleWishlist = (productId: number) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('lifei_wishlist', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      const prod = products.find((p) => p.id === productId) || STORE_PRODUCTS.find((p) => p.id === productId);
      if (prod) {
        showToast(exists ? `Removed ${prod.name} from wishlist` : `Saved ${prod.name} to wishlist ❤️`);
      }
      return updated;
    });
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Added to Cart notification state popping up on bottom right Quick Add
  const [cartNotification, setCartNotification] = useState<CartNotificationData | null>(null);
  const cartTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCartNotification = (product: Product, quantity = 1, variantTitle?: string) => {
    if (cartTimerRef.current) {
      clearTimeout(cartTimerRef.current);
    }
    setCartNotification({
      product,
      quantity,
      variantTitle,
      timestamp: Date.now(),
    });
    cartTimerRef.current = setTimeout(() => {
      setCartNotification(null);
    }, 4500);
  };

  const handleDismissCartNotification = () => {
    if (cartTimerRef.current) {
      clearTimeout(cartTimerRef.current);
    }
    setCartNotification(null);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadProducts = async (showNotice = false) => {
    const config = getShopifyConfig();
    setIsShopifyConnected(config.isConnected);
    if (config.isConnected) {
      try {
        const liveProducts = await getShopifyProducts(24);
        if (liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
          if (showNotice) {
            showToast(`Connected to Shopify! Loaded ${liveProducts.length} live products.`);
          }
        }
      } catch (err) {
        console.warn('Error loading Shopify products:', err);
      }
    } else {
      setProducts(adminProducts);
      if (showNotice) {
        showToast('Restored curated Li Fei Beauty catalog.');
      }
    }
  };

  useEffect(() => {
    loadProducts(false);
  }, []);

  const handleAddToCart = (product: Product, quantity = 1) => {
    const variantId = product.selectedVariantId || product.variants?.[0]?.id;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const itemVariant = item.variantId || item.product.selectedVariantId || item.product.variants?.[0]?.id;
        return item.product.id === product.id && itemVariant === variantId;
      });

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, variantId, selectedSize: product.volume }];
    });
    // Pop up darker pink notification from Quick Add on bottom-right corner
    triggerCartNotification(product, quantity, product.volume);
  };

  const handleBuyNow = async (product: Product, quantity = 1) => {
    const config = getShopifyConfig();
    if (config.isConnected) {
      try {
        const checkoutUrl = await createShopifyCheckout([{ product, quantity }]);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
      } catch (err) {
        console.warn('Instant buy error:', err);
      }
    }
    // Fallback: Add to cart and open it
    handleAddToCart(product, quantity);
    setCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number, variantId?: string) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          const itemVariant = item.variantId || item.product.selectedVariantId || item.product.variants?.[0]?.id;
          const isMatch = item.product.id === productId && (!variantId || itemVariant === variantId);
          if (isMatch) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveCartItem = (productId: number, variantId?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const itemVariant = item.variantId || item.product.selectedVariantId || item.product.variants?.[0]?.id;
        return !(item.product.id === productId && (!variantId || itemVariant === variantId));
      })
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const quickAddProducts = products.filter(p => 
    p.name.toLowerCase().includes('kojic acid') || 
    p.name.toLowerCase().includes('egf nad') || 
    p.name.toLowerCase().includes('pdrn pink')
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter selection:bg-[#FFCDF2] selection:text-[#4A0818]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar 
        customText={contentSettings.announcementText}
        promoCode={contentSettings.promoCode}
        onOpenPromo={() => showToast(`Use code ${contentSettings.promoCode} at checkout for discounts`)}
        onOpenTrackOrder={() => handleOpenTrackOrder()} 
      />

      {/* 2. Main Navigation Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={(tab) => {
          if (tab) setAccountTab(tab);
          else setAccountTab('points');
          setAccountOpen(true);
        }}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onNavigateSection={scrollToSection}
        onOpenAbout={() => setAboutContactMode('about')}
        onOpenContact={() => setAboutContactMode('contact')}
        onOpenShopifyConnect={() => setShopifyConnectOpen(true)}
        isShopifyConnected={isShopifyConnected}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
      />

      {/* 3. Hero Section (3D animated with 3 pictures filling the page & covering GLOW) */}
      <Hero3D
        products={quickAddProducts}
        autoSlide={false}
        onAddToCart={(p) => {
          handleAddToCart(p);
          setCartOpen(true);
        }}
        onBuyNow={handleBuyNow}
        onQuickView={(p) => setQuickViewProduct(p)}
        onExploreCatalog={() => scrollToSection('bestsellers')}
      />

      {/* 4. Authenticity & Trust Bar */}
      <TrustBar 
        onVerifyClick={() => setPolicyType('shipping')}
        onTrackClick={() => handleOpenTrackOrder()} 
      />

      {/* 5. Featured / Best Sellers (4-6 products with tabs, ratings, add to cart) */}
      <BestSellers
        products={products}
        isShopifyConnected={isShopifyConnected}
        onOpenShopifyConnect={() => setShopifyConnectOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(p) => handleAddToCart(p)}
        onBuyNow={handleBuyNow}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 5b. Dedicated My Favorites Section */}
      <MyFavoritesSection
        products={products}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
        onQuickView={(p) => setQuickViewProduct(p)}
        onNavigateSection={scrollToSection}
      />

      {/* 6. Shop by Category Grid */}
      <CategoryGrid
        products={products}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onNavigateSection={scrollToSection}
      />

      {/* 7. Interactive Before & After Rolling Facial (Seoul Clinical Trial) */}
      <BeforeAfterRollingFacial
        products={products}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* 8. Problem → Solution Section (Interactive Skin Concern Finder) */}
      <SkinConcernSection
        products={products}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* 9. Why Li Fei Beauty (Core Value Pillars) */}
      <WhyLiFei />

      {/* 10. How it Works / 5-Step Skincare Routine */}
      <SkincareRoutine
        products={products}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* 11. Verified Customer Reviews ⭐ */}
      <CustomerReviews />

      {/* 12. UGC / Social Proof Gallery */}
      <UgcGallery
        onExploreProduct={(id) => {
          const match = products.find((p) => p.id === id) || STORE_PRODUCTS.find((p) => p.id === id);
          if (match) setQuickViewProduct(match);
        }}
      />

      {/* 13. FAQ Accordion */}
      <FaqSection />

      {/* 14. Newsletter / Discount Signup (GLOW15) */}
      <Newsletter />

      {/* 15. Comprehensive Footer */}
      <Footer
        onOpenPolicy={(type) => setPolicyType(type)}
        onOpenAbout={() => setAboutContactMode('about')}
        onOpenContact={() => setAboutContactMode('contact')}
        onNavigateSection={scrollToSection}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
      />

      {/* Modals & Drawers */}
      {/* Product Detail Modal (PDP with full structure: Product → Rating → Price → Benefits → Add → Buy → Ingredients → How to Use → Results → Reviews → Recommended) */}
      <ProductDetailModal
        product={quickViewProduct}
        allProducts={products}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product, qty) => {
          handleAddToCart(product, qty);
          setCartOpen(true);
        }}
        onSelectRecommended={(p) => setQuickViewProduct(p)}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onTrackOrder={(num, mail) => handleOpenTrackOrder(num, mail)}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        products={products}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Customer Account & Glow Rewards Modal */}
      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        onToggleWishlist={handleToggleWishlist}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(p) => {
          handleAddToCart(p);
          setCartOpen(true);
        }}
        initialTab={accountTab}
        onNavigateSection={scrollToSection}
        onOpenTrackOrder={(num, mail) => handleOpenTrackOrder(num, mail)}
      />

      {/* Track My Order Modal */}
      <TrackOrderModal
        isOpen={trackOrderOpen}
        onClose={() => setTrackOrderOpen(false)}
        initialOrderNumber={trackOrderParams.orderNumber}
        initialEmail={trackOrderParams.email}
      />

      {/* Policy Modal (Shipping, Returns, Privacy, Terms) */}
      <PolicyModal
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

      {/* About & Contact Modal */}
      <AboutContactModal
        mode={aboutContactMode}
        onClose={() => setAboutContactMode(null)}
      />

      {/* Shopify Headless Storefront Connect Modal */}
      <ShopifyConnectModal
        isOpen={shopifyConnectOpen}
        onClose={() => setShopifyConnectOpen(false)}
        onConnected={() => loadProducts(true)}
      />

      {/* Floating Quick Add Mini-Widget (Top 3 Best Sellers for returning visitors) */}
      <QuickAddWidget
        products={quickAddProducts}
        onAddToCart={(p) => handleAddToCart(p)}
        onQuickView={(p) => setQuickViewProduct(p)}
        onOpenCart={() => setCartOpen(true)}
        cartCount={totalCartCount}
        cartNotification={cartNotification}
        onDismissNotification={handleDismissCartNotification}
      />

      {/* Floating Store Admin Trigger */}
      <button
        onClick={() => setAdminOpen(true)}
        className="fixed bottom-6 left-6 z-[120] bg-slate-950/90 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-full border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer group"
        title="Open Li Fei Beauty Admin Hub"
        aria-label="Open Store Admin Hub"
      >
        <SlidersHorizontal size={14} className="text-[#EC3460] group-hover:rotate-45 transition-transform" />
        <span className="hidden sm:inline">Admin Hub</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Master Admin Portal Modal */}
      {adminOpen && (
        <AdminPortal
          onClose={() => setAdminOpen(false)}
          onRefreshStoreData={handleRefreshStoreData}
        />
      )}

      {/* General Notification (Wishlist, Promo, Sync in Darker Pink theme) */}
      {toastMessage && !cartNotification && (
        <aside 
          aria-live="polite"
          className="fixed bottom-22 right-6 z-[95] bg-gradient-to-br from-[#9E1438] via-[#8C0D30] to-[#730823] text-white px-4.5 py-3 rounded-2xl shadow-2xl shadow-[#4A0818]/50 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 border border-[#EC3460]/40 backdrop-blur-md"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
