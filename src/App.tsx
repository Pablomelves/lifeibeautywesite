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
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { ComparisonModal } from './components/ComparisonModal';
import { FastPictureProcessorModal } from './components/FastPictureProcessorModal';

import { Product, CartItem, StoreContentSettings, CartNotificationData, WishlistNotificationData, AdminUser } from './types';
import { createShopifyCheckout, getShopifyConfig, getShopifyProducts } from './services/shopify';
import { getStoreContentSettings, verifyAdminSession } from './services/adminService';
import { Check, SlidersHorizontal, Scale, Zap } from 'lucide-react';

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isShopifyConnected, setIsShopifyConnected] = useState<boolean>(false);
  const [shopifyConnectOpen, setShopifyConnectOpen] = useState(false);

  // Storefront dynamic content
  const [contentSettings, setContentSettings] = useState<StoreContentSettings>(() => getStoreContentSettings());

  // Personal Information State (Lifted for global reactivity)
  const [profileInfo, setProfileInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifei_profile_info');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'South Korea',
      zip: '',
      skinGoal: 'Glass Skin Luminosity & Firming',
      skinType: 'Combination / Dehydrated',
      sensitivity: 'Mild (Prefers Fragrance-Free Korean Formulations)'
    };
  });

  const profileIncomplete = !profileInfo.firstName || !profileInfo.lastName || !profileInfo.email;

  // Admin Security & Access State (Completely hidden unless authenticated as admin)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  // Check server-side admin authentication and handle URL navigation securely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if redirected due to unauthorized admin access attempt
    if (window.location.search.includes('unauthorized=admin_access_denied')) {
      showToast('Access Denied: 403 Forbidden. Store admin authorization required.');
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check for admin login URL request (/admin/login or ?login=admin)
    const isLoginUrl = 
      window.location.pathname === '/admin/login' || 
      window.location.pathname === '/admin/login/' ||
      window.location.search.includes('login=admin');

    if (isLoginUrl) {
      setAdminLoginOpen(true);
    }

    // Server-side admin verification
    verifyAdminSession().then((res) => {
      if (res.authenticated && res.user) {
        setIsAdminAuthenticated(true);
        setCurrentUser(res.user);
        // If authenticated owner visited /admin or requested ?admin=true, open portal
        if (
          window.location.pathname === '/admin' || 
          window.location.pathname === '/admin/' || 
          window.location.search.includes('admin=true')
        ) {
          setAdminOpen(true);
        }
      } else {
        setIsAdminAuthenticated(false);
        setCurrentUser(null);
        // If unauthenticated visitor attempted to access /admin or ?admin=true, deny and redirect
        if (
          window.location.pathname === '/admin' || 
          window.location.pathname === '/admin/' || 
          window.location.search.includes('admin=true')
        ) {
          showToast('Access Denied: 403 Forbidden. Store admin authorization required.');
          window.history.replaceState({}, '', '/');
          setAdminOpen(false);
        }
      }
    });

    // Keyboard shortcut (Ctrl+Shift+A or Alt+A) for store owner quick login trigger
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        setAdminLoginOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefreshStoreData = () => {
    setContentSettings(getStoreContentSettings());
  };

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  // Comparison state
  const [comparisonIds, setComparisonIds] = useState<number[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  // Fast Picture Processor modal state
  const [fastProcessorOpen, setFastProcessorOpen] = useState(false);

  const handleToggleComparison = (productId: number) => {
    setComparisonIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) return prev.filter((id) => id !== productId);
      if (prev.length >= 3) {
        showToast('Limit reached: Compare up to 3 products.');
        return prev;
      }
      return [...prev, productId];
    });
  };

  const comparisonProducts = products.filter((p) => comparisonIds.includes(p.id));

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

  // Sync mechanism for wishlistIds backup
  useEffect(() => {
    // Immediate save for responsiveness is already in handleToggleWishlist
    // but we add a robust periodic sync for consistency during rapid changes
    const syncInterval = setInterval(() => {
      try {
        localStorage.setItem('lifei_wishlist', JSON.stringify(wishlistIds));
      } catch (e) {
        // ignore
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [wishlistIds]);

  const handleToggleWishlist = (productId: number) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('lifei_wishlist', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        showToast(exists ? `Removed ${prod.name} from wishlist` : `Saved ${prod.name} to wishlist ❤️`);
        triggerWishlistNotification(prod, exists);
      }
      return updated;
    });
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Added to Cart notification state popping up on bottom right Quick Add
  const [cartNotification, setCartNotification] = useState<CartNotificationData | null>(null);
  const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Added to Wishlist notification state
  const [wishlistNotification, setWishlistNotification] = useState<WishlistNotificationData | null>(null);
  const wishlistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerCartNotification = (product: Product, quantity = 1, variantTitle?: string) => {
    if (cartTimerRef.current) {
      clearTimeout(cartTimerRef.current);
    }
    setWishlistNotification(null); // Clear wishlist notification if cart is triggered
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

  const triggerWishlistNotification = (product: Product, isRemoved = false) => {
    if (wishlistTimerRef.current) {
      clearTimeout(wishlistTimerRef.current);
    }
    setCartNotification(null); // Clear cart notification if wishlist is triggered
    setWishlistNotification({
      product,
      timestamp: Date.now(),
      isRemoved,
    });
    wishlistTimerRef.current = setTimeout(() => {
      setWishlistNotification(null);
    }, 4500);
  };

  const handleDismissCartNotification = () => {
    if (cartTimerRef.current) {
      clearTimeout(cartTimerRef.current);
    }
    setCartNotification(null);
  };

  const handleDismissWishlistNotification = () => {
    if (wishlistTimerRef.current) {
      clearTimeout(wishlistTimerRef.current);
    }
    setWishlistNotification(null);
  };

  const handleUpdateProfile = (newInfo: any) => {
    setProfileInfo(newInfo);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifei_profile_info', JSON.stringify(newInfo));
      } catch (e) {
        // ignore
      }
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadProducts = async (showNotice = false) => {
    setIsProductsLoading(true);
    setProductError(null);
    setIsShopifyConnected(false);
    try {
      const liveProducts = await getShopifyProducts(24);
      setProducts(liveProducts);
      setIsShopifyConnected(true);
      if (liveProducts.length === 0) {
        setProductError('No products are available through this Shopify storefront. Check that products are Active and published to the sales channel associated with Storefront access.');
      } else if (showNotice) {
        showToast(`Connected to Shopify! Loaded ${liveProducts.length} live products.`);
      }
    } catch (error) {
      setProducts([]);
      setProductError(error instanceof Error ? error.message : 'Unable to load products from Shopify. Please try again.');
    } finally {
      setIsProductsLoading(false);
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

  const quickAddProducts = products.slice(0, 3);

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
        wishlistCount={wishlistIds.length}
        profileIncomplete={profileIncomplete}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={(tab) => {
          if (tab) setAccountTab(tab);
          else if (profileIncomplete) setAccountTab('profile');
          else setAccountTab('points');
          setAccountOpen(true);
        }}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onNavigateSection={scrollToSection}
        onOpenAbout={() => setAboutContactMode('about')}
        onOpenContact={() => setAboutContactMode('contact')}
        onOpenShopifyConnect={() => setShopifyConnectOpen(true)}
        isShopifyConnected={isShopifyConnected}
        onOpenAdmin={isAdminAuthenticated ? () => setAdminOpen(true) : undefined}
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
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
      />

      {/* 4. Authenticity & Trust Bar */}
      <TrustBar 
        onVerifyClick={() => setPolicyType('shipping')}
        onTrackClick={() => handleOpenTrackOrder()} 
      />

      {/* 5. Featured / Best Sellers (4-6 products with tabs, ratings, add to cart) */}
      <BestSellers
        products={products}
        isLoading={isProductsLoading}
        errorMessage={productError}
        isShopifyConnected={isShopifyConnected}
        onOpenShopifyConnect={() => setShopifyConnectOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(p) => handleAddToCart(p)}
        onBuyNow={handleBuyNow}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
      />

      {/* 5b. Dedicated My Favorites Section */}
      <MyFavoritesSection
        products={products}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
        onQuickView={(p) => setQuickViewProduct(p)}
        onNavigateSection={scrollToSection}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
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
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
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
          const match = products.find((p) => p.id === id);
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
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
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
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
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
        profileInfo={profileInfo}
        onUpdateProfile={handleUpdateProfile}
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
        isOpen={Boolean(policyType)}
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

      {/* About & Contact Modal */}
      <AboutContactModal
        isOpen={Boolean(aboutContactMode)}
        mode={aboutContactMode || 'about'}
        onClose={() => setAboutContactMode(null)}
      />

      {/* Product Comparison Modal */}
      <ComparisonModal
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        products={comparisonProducts}
        onAddToCart={handleAddToCart}
        onRemove={handleToggleComparison}
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
        wishlistNotification={wishlistNotification}
        onDismissNotification={handleDismissCartNotification}
        onDismissWishlistNotification={handleDismissWishlistNotification}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
      />

      {/* Floating Store Admin Trigger - Completely hidden unless authenticated as admin */}
      {isAdminAuthenticated && (
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
      )}

      {/* Floating Fast Picture Processor Trigger */}
      <button
        onClick={() => setFastProcessorOpen(true)}
        className="fixed bottom-6 left-36 z-[120] bg-white/95 text-slate-800 hover:text-[#EC3460] px-3.5 py-2.5 rounded-full border border-[#FFCDF2] shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer group hover:bg-[#FFF0F9]"
        title="Open Fast Picture Processor & Studio Optimizer"
        aria-label="Open Fast Picture Processor"
      >
        <Zap size={14} className="text-[#EC3460]" />
        <span className="hidden sm:inline">Picture Fast Processor</span>
      </button>

      {/* Floating Comparison Trigger */}
      {comparisonIds.length > 0 && (
        <button
          onClick={() => setComparisonOpen(true)}
          className="fixed bottom-22 left-6 z-[120] bg-white/95 text-slate-900 px-4.5 py-3 rounded-full border border-[#FFCDF2] shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-[#EC3460] flex items-center justify-center text-white shadow-raspberry">
            <Scale size={14} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Compare ({comparisonIds.length}/3)</span>
          {comparisonIds.length >= 2 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460] animate-pulse" />
          )}
        </button>
      )}

      {/* Master Admin Portal Modal - Only rendered when authenticated as admin */}
      {adminOpen && isAdminAuthenticated && (
        <AdminPortal
          onClose={() => setAdminOpen(false)}
          onRefreshStoreData={handleRefreshStoreData}
          onLogoutSuccess={() => {
            setIsAdminAuthenticated(false);
            setCurrentUser(null);
            setAdminOpen(false);
            showToast('Signed out of Admin Hub');
          }}
        />
      )}

      {/* Store Owner Secure Authentication Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={(user) => {
          setIsAdminAuthenticated(true);
          setCurrentUser(user);
          setAdminLoginOpen(false);
          setAdminOpen(true);
          showToast(`Authenticated as ${user.name}`);
        }}
      />

      {/* Standalone Fast Picture Processor Modal */}
      <FastPictureProcessorModal
        isOpen={fastProcessorOpen}
        onClose={() => setFastProcessorOpen(false)}
      />

      {/* General Notification (Wishlist, Promo, Sync in Light Theme) */}
      {toastMessage && !cartNotification && (
        <aside 
          aria-live="polite"
          className="fixed bottom-22 right-6 z-[95] bg-white/95 text-slate-900 px-4.5 py-3 rounded-2xl shadow-2xl shadow-slate-200/50 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 border border-[#FFCDF2] backdrop-blur-md"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}

export default App;
