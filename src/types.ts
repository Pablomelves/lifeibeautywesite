export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  numericPrice: number;
  compareAtPrice?: string;
  availableForSale: boolean;
  selectedOptions?: { name: string; value: string }[];
}

export interface Product {
  id: number;
  name: string;
  subtitle: string;
  src: string;
  bg: string;
  panel: string;
  themeColor: string;
  darkTone: boolean;
  price: string;
  numericPrice: number;
  originalPrice?: string;
  volume: string;
  category: 'Serums' | 'Moisturizers' | 'Masks' | 'Cleansers' | 'Eye Care' | 'Sets & Bundles' | 'Tools & Rollers';
  rating: number;
  reviewsCount: number;
  badge?: string;
  clinicalClaim: string;
  benefits: string[];
  keyIngredients: string[];
  allIngredients: string;
  howToUse: string[];
  ritualStep: string;
  skinType: string;
  fullDescription: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  beforeAfterSummary?: string;
  faqs?: { q: string; a: string }[];
  // Shopify Headless fields
  shopifyId?: string;
  handle?: string;
  variants?: ShopifyVariant[];
  selectedVariantId?: string;
  availableForSale?: boolean;
  images?: string[];
}

export interface Review {
  id: number;
  productId: number;
  productName: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  skinConcern: string;
  skinType: string;
  beforeAfterTimeframe?: string;
  measuredMetric?: string;
  beforeImg?: string;
  afterImg?: string;
  routineUsed?: string;
  likes?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  variantId?: string;
  variantTitle?: string;
}

export interface CartNotificationData {
  product: Product;
  quantity: number;
  timestamp: number;
  variantTitle?: string;
}

export interface WishlistNotificationData {
  product: Product;
  timestamp: number;
  isRemoved?: boolean;
}

export interface ShopifyConfig {
  domain: string;
  storefrontAccessToken: string;
  apiVersion: string;
  isConnected: boolean;
}

export interface SkinConcern {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  recommendedProductId: number;
  targetActives: string[];
  clinicalResult: string;
}

export interface RoutineStep {
  step: number;
  title: string;
  koreanName: string;
  description: string;
  tip: string;
  recommendedProductIds: number[];
}

export interface AdminProduct extends Product {
  stockQuantity: number;
  status: 'active' | 'draft';
  sku: string;
  compareAtPrice?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  selectedSize?: string;
}

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zip: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: OrderCustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shippingCost: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered';
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  tags: string[];
  notes: string;
  joinedDate: string;
  shippingAddress?: {
    address: string;
    city: string;
    country: string;
    zip: string;
  };
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  usageCount: number;
  usageLimit?: number;
  active: boolean;
  expiresAt?: string;
  description?: string;
}

export interface ReviewModeration {
  id: number;
  productId: number;
  productName: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  featured: boolean;
  verified: boolean;
  skinConcern?: string;
}

export interface StoreContentSettings {
  announcementText: string;
  promoCode: string;
  promoBadge: string;
  heroHeadline: string;
  heroSubhead: string;
  heroTagline: string;
  bannerPromoTitle: string;
  bannerPromoSubtitle: string;
  bannerPromoDiscount: string;
  brandStoryTitle: string;
  brandStoryText: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'manager' | 'editor';
}
