import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { StaticHero } from './components/StaticHero';
import { REFERENCE_HEROES, referenceHeroForPath, referenceHeroForProduct, type ReferenceHero } from './data/referenceHeroes';
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
import { PolicyModal } from './components/PolicyModal';
import { AboutContactModal } from './components/AboutContactModal';
import { ShopifyConnectModal } from './components/ShopifyConnectModal';
import { QuickAddWidget } from './components/QuickAddWidget';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { TrackOrderModal } from './components/TrackOrderModal';

import { Product, CartItem, StoreContentSettings, CartNotificationData, WishlistNotificationData, AdminUser } from './types';
import { createShopifyCheckout, getShopifyConfig, getShopifyProducts } from './services/shopify';
import { getStoreContentSettings, verifyAdminSession } from './services/adminService';
import { Check, SlidersHorizontal } from 'lucide-react';
import { usePersistentBag } from './hooks/usePersistentBag';
import { getStorefrontContent, type StorefrontContent } from './services/storefrontContent';
import { trackShoppingEvent } from './services/analytics';

const AccountModal = lazy(() => import('./components/AccountModal').then(module => ({ default: module.AccountModal })));
const AdminPortal = lazy(() => import('./components/admin/AdminPortal').then(module => ({ default: module.AdminPortal })));

export function App() {
  const instantCheckoutPending = useRef(false);
  const lastAddition = useRef({ key: '', time: 0 });
  const [storefrontInfo, setStorefrontInfo] = useState<StorefrontContent | null>(null);
  const [storefrontInfoError, setStorefrontInfoError] = useState<string | null>(null);
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
  const { cartItems, setCartItems, cartReady, persistenceError, retryPersistence, flushPersistence } = usePersistentBag(products, !isProductsLoading, productError);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => { if (cartOpen && cartReady) trackShoppingEvent('view_cart', cartItems); }, [cartOpen, cartReady]);

  useEffect(() => {
    if (!products.length) return;
    setCartItems(items => items.map(item => {
      const latestProduct = products.find(product => product.id === item.product.id);
      if (!latestProduct) return { ...item, product: { ...item.product, availableForSale: false, stockStatus: 'Out of Stock' } };
      const variant = latestProduct.variants?.find(variant => variant.id === item.variantId);
      return {
        ...item,
        selectedSize: variant && variant.title !== 'Default Title' ? variant.title : latestProduct.volume,
        product: { ...latestProduct, selectedVariantId: item.variantId, price: variant?.price || latestProduct.price, numericPrice: variant?.numericPrice ?? latestProduct.numericPrice, availableForSale: variant?.availableForSale ?? false },
      };
    }));
  }, [products]);

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [heroReference, setHeroReference] = useState<ReferenceHero>(REFERENCE_HEROES[0]);
  const [heroVisible, setHeroVisible] = useState(true);
  const [routePath, setRoutePath] = useState(() => window.location.pathname.replace(/\/$/, '') || '/');

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<'points' | 'orders' | 'tracking' | 'profile' | 'wishlist' | 'favorites'>('points');


  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [trackOrderParams, setTrackOrderParams] = useState({ orderNumber: '', email: '' });
  const [policyType, setPolicyType] = useState<'shipping' | 'returns' | 'privacy' | 'terms' | null>(null);
  const [aboutContactMode, setAboutContactMode] = useState<'about' | 'contact' | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getStorefrontContent(controller.signal).then(setStorefrontInfo).catch(() => {
      if (!controller.signal.aborted) setStorefrontInfoError('Store information is temporarily unavailable. Please try again later.');
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname.replace(/\/$/, '');
      setRoutePath(path || '/');
      const policies: Record<string, 'shipping' | 'returns' | 'privacy' | 'terms'> = { '/policies/shipping-policy': 'shipping', '/policies/refund-policy': 'returns', '/policies/privacy-policy': 'privacy', '/policies/terms-of-service': 'terms' };
      if (policies[path]) setPolicyType(policies[path]);
      if (path === '/pages/about-us') setAboutContactMode('about');
      if (path === '/pages/contact') setAboutContactMode('contact');
      if (path === '/pages/faqs') document.getElementById('faq-section')?.scrollIntoView();
      let handle = '';
      try { handle = path.startsWith('/products/') ? decodeURIComponent(path.slice('/products/'.length)) : ''; }
      catch { showToast('This product link is invalid. Please choose an item from the catalog.'); }
      if (!handle) setQuickViewProduct(null);
      if (handle && products.length) {
        const product = products.find(product => product.handle === handle);
        if (product) setQuickViewProduct(product);
        else showToast('This product is not available in the current storefront.');
      }
    };
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [products]);

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
    return [];
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

  const productRequestRef = useRef(false);

  const loadProducts = async (showNotice = false, background = false) => {
    if (productRequestRef.current) return;
    productRequestRef.current = true;
    if (!background) setIsProductsLoading(true);
    try {
      const liveProducts = await getShopifyProducts(24);
      setProducts(liveProducts);
      setIsShopifyConnected(true);
      setProductError(null);
      if (liveProducts.length === 0) {
        setProductError('No products are available through this Shopify storefront. Check that products are Active and published to the sales channel associated with Storefront access.');
      } else if (showNotice) {
        showToast(`Connected to Shopify! Loaded ${liveProducts.length} live products.`);
      }
    } catch (error) {
      if (!background) setProducts([]);
      setIsShopifyConnected(false);
      setProductError(error instanceof Error ? error.message : 'Unable to load products from Shopify. Please try again.');
    } finally {
      setIsProductsLoading(false);
      productRequestRef.current = false;
    }
  };

  useEffect(() => {
    loadProducts(false);
    const refreshProducts = () => {
      if (document.visibilityState === 'visible') loadProducts(false, true);
    };
    const refreshInterval = window.setInterval(refreshProducts, 60000);
    window.addEventListener('focus', refreshProducts);
    window.addEventListener('online', refreshProducts);
    document.addEventListener('visibilitychange', refreshProducts);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshProducts);
      window.removeEventListener('online', refreshProducts);
      document.removeEventListener('visibilitychange', refreshProducts);
    };
  }, []);

  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!cartReady) { showToast('Your saved bag is loading. Please try again in a moment.'); return false; }
    const current = products.find(current => current.id === product.id);
    if (!current) { showToast('This product is no longer available.'); return false; }
    const variantId = product.selectedVariantId || product.variants?.find(variant => variant.availableForSale)?.id;
    const variant = current.variants?.find(variant => variant.id === variantId);
    const existing = cartItems.find(item => item.variantId === variantId)?.quantity || 0;
    if (!current.availableForSale || !variant?.availableForSale || !Number.isInteger(quantity) || quantity < 1 || quantity + existing > 999) {
      showToast('This variant is unavailable. Please select an available option.');
      return false;
    }
    const key = `${product.id}-${variant.id}`;
    if (lastAddition.current.key === key && Date.now() - lastAddition.current.time < 350) return false;
    lastAddition.current = { key, time: Date.now() };
    product = { ...current, selectedVariantId: variant.id, price: variant.price, numericPrice: variant.numericPrice, volume: variant.title === 'Default Title' ? current.volume : variant.title };
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
    trackShoppingEvent('add_to_cart', [{ product, quantity, variantId }]);
    return true;
  };

  const handleBuyNow = async (product: Product, quantity = 1) => {
    if (instantCheckoutPending.current) return;
    const config = getShopifyConfig();
    if (config.isConnected) {
      instantCheckoutPending.current = true;
      try {
        const checkoutUrl = await createShopifyCheckout([{ product, quantity }]);
        if (checkoutUrl) {
          trackShoppingEvent('begin_checkout', [{ product, quantity }]);
          window.location.href = checkoutUrl;
          return;
        }
      } catch (err) {
        trackShoppingEvent('shopping_error');
        showToast(err instanceof Error ? err.message : 'Shopify checkout is temporarily unavailable.');
        return;
      } finally {
        instantCheckoutPending.current = false;
      }
    }
    // Fallback: Add to cart and open it
    handleAddToCart(product, quantity);
    setCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number, variantId?: string) => {
    const item = cartItems.find(item => item.product.id === productId && (!variantId || item.variantId === variantId));
    if (!item || !Number.isInteger(delta)) return;
    if (delta > 0 && (item.product.availableForSale === false || item.quantity + delta > 999)) { showToast('This quantity or variant is unavailable.'); return; }
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

  const closeRoutedView = () => {
    if (/^\/(products|policies|pages)\//.test(window.location.pathname)) window.history.replaceState({}, '', '/');
    setRoutePath(window.location.pathname.replace(/\/$/, '') || '/');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToSection = (sectionId: string) => {
    setQuickViewProduct(null);
    closeRoutedView();
    const behavior = sectionId === 'hero' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const kojicAcidProduct = products.find(product => product.shopifyId === 'gid://shopify/Product/10705876779148');
  const quickAddProducts = products
    .filter(product => product.shopifyId !== 'gid://shopify/Product/10691183050892' && product.id !== kojicAcidProduct?.id)
    .slice(0, kojicAcidProduct ? 2 : 3);
  if (kojicAcidProduct) quickAddProducts.push(kojicAcidProduct);

  const productReference = referenceHeroForProduct(quickViewProduct);
  const headerProps = {
    cartCount: totalCartCount,
    wishlistCount: wishlistIds.length,
    profileIncomplete,
    onOpenCart: () => setCartOpen(true),
    onOpenSearch: () => setSearchOpen(true),
    onOpenAccount: (tab?: typeof accountTab) => {
      setAccountTab(tab || (profileIncomplete ? 'profile' : 'points'));
      setAccountOpen(true);
    },
    onSelectCategory: (category: string) => setSelectedCategory(category),
    onNavigateSection: scrollToSection,
    onOpenAbout: () => setAboutContactMode('about'),
    onOpenContact: () => setAboutContactMode('contact'),
    onOpenShopifyConnect: () => setShopifyConnectOpen(true),
    isShopifyConnected,
    onOpenAdmin: isAdminAuthenticated ? () => setAdminOpen(true) : undefined,
    onOpenTrackOrder: () => handleOpenTrackOrder(),
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter selection:bg-[#FFCDF2] selection:text-[#4A0818]">
      {/* 2. Main Navigation Header */}
      <Header
        {...headerProps}
        pageHeader
        reference={routePath === '/' ? heroReference : referenceHeroForPath(routePath)}
        referenceOverlay={routePath === '/'}
      />

      <StaticHero
        reference={heroReference}
        products={products}
        onSelectReference={setHeroReference}
        onOpenProduct={(handle) => {
          window.history.pushState({}, '', `/products/${encodeURIComponent(handle)}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
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
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
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
      <FaqSection document={storefrontInfo?.faq} />

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
        brandHeader={productReference ? <Header {...headerProps} reference={productReference} /> : undefined}
        product={quickViewProduct ? products.find(product => product.id === quickViewProduct.id) || null : null}
        allProducts={products}
        onClose={() => { setQuickViewProduct(null); closeRoutedView(); }}
        onAddToCart={handleAddToCart}
        onSelectRecommended={(p) => setQuickViewProduct(p)}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenPolicy={setPolicyType}
        onOpenContact={() => setAboutContactMode('contact')}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        isLoading={!cartReady}
        persistenceError={persistenceError}
        onRetryPersistence={() => { if (productError && !products.length) loadProducts(false); else retryPersistence(); }}
        onBeforeCheckout={flushPersistence}
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
      {accountOpen && <Suspense fallback={<div role="status" className="fixed inset-0 z-[140] bg-white/95 flex items-center justify-center">Loading your account…</div>}><AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        onToggleWishlist={handleToggleWishlist}
        onQuickView={(product) => {
          setAccountOpen(false);
          setQuickViewProduct(product);
        }}
        onAddToCart={(product) => {
          handleAddToCart(product);
          setAccountOpen(false);
          setCartOpen(true);
        }}
        initialTab={accountTab}
        onNavigateSection={scrollToSection}
        onOpenTrackOrder={(num, mail) => handleOpenTrackOrder(num, mail)}
        profileInfo={profileInfo}
        onUpdateProfile={handleUpdateProfile}
      /></Suspense>}

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
        onClose={() => { setPolicyType(null); closeRoutedView(); }}
        document={policyType ? storefrontInfo?.policies[policyType] : null}
        isLoading={!storefrontInfo && !storefrontInfoError}
        error={storefrontInfoError}
        onOpenContact={() => { setPolicyType(null); setAboutContactMode('contact'); }}
      />

      {/* About & Contact Modal */}
      <AboutContactModal
        isOpen={Boolean(aboutContactMode)}
        mode={aboutContactMode || 'about'}
        onClose={() => { setAboutContactMode(null); closeRoutedView(); }}
        aboutDocument={storefrontInfo?.about}
        contactDocument={storefrontInfo?.contact}
      />

      {/* Shopify Headless Storefront Connect Modal */}
      <ShopifyConnectModal
        isOpen={shopifyConnectOpen}
        onClose={() => setShopifyConnectOpen(false)}
        onConnected={() => loadProducts(true)}
      />

      {/* Floating Quick Add Mini-Widget (Top 3 Best Sellers for returning visitors) */}
      {!heroVisible && <QuickAddWidget
        products={quickAddProducts}
        onAddToCart={(p) => handleAddToCart(p)}
        onQuickView={(p) => setQuickViewProduct(p)}
        onOpenCart={() => setCartOpen(true)}
        cartCount={totalCartCount}
        cartNotification={cartNotification}
        wishlistNotification={wishlistNotification}
        onDismissNotification={handleDismissCartNotification}
        onDismissWishlistNotification={handleDismissWishlistNotification}
      />}

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

      {/* Master Admin Portal Modal - Only rendered when authenticated as admin */}
      {adminOpen && isAdminAuthenticated && (
        <Suspense fallback={<div role="status" className="fixed inset-0 z-[140] bg-white/95 flex items-center justify-center">Loading store administration…</div>}><AdminPortal
          onClose={() => setAdminOpen(false)}
          onRefreshStoreData={handleRefreshStoreData}
          onLogoutSuccess={() => {
            setIsAdminAuthenticated(false);
            setCurrentUser(null);
            setAdminOpen(false);
            showToast('Signed out of Admin Hub');
          }}
        /></Suspense>
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
