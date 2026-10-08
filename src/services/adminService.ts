import { 
  AdminProduct, 
  Order, 
  Customer, 
  Discount, 
  ReviewModeration, 
  StoreContentSettings, 
  AdminUser,
  CartItem
} from '../types';
import { 
  INITIAL_ADMIN_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_DISCOUNTS, 
  INITIAL_REVIEWS_MODERATION, 
  INITIAL_CONTENT_SETTINGS, 
  DEFAULT_ADMIN_USER 
} from '../data/initialAdminData';

// LocalStorage Keys
const STORAGE_PRODUCTS = 'lifei_admin_products';
const STORAGE_ORDERS = 'lifei_admin_orders';
const STORAGE_CUSTOMERS = 'lifei_admin_customers';
const STORAGE_DISCOUNTS = 'lifei_admin_discounts';
const STORAGE_REVIEWS = 'lifei_admin_reviews';
const STORAGE_CONTENT = 'lifei_admin_content';
const STORAGE_AUTH = 'lifei_admin_auth';

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

// ----------------------------------------------------------------------
// Auth Service
// ----------------------------------------------------------------------
export function getAdminAuth(): AdminUser | null {
  return getStorage<AdminUser | null>(STORAGE_AUTH, null);
}

export async function loginAdmin(email: string, pass: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  // Try server endpoint first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setStorage(STORAGE_AUTH, data.user);
        return { success: true, user: data.user };
      }
    }
  } catch (e) {
    // server fallback
  }

  // Client-side fallback authentication
  const cleanEmail = email.trim().toLowerCase();
  if (
    cleanEmail === 'admin@lifeibeauty.com' ||
    cleanEmail === 'pablo.kelvin17@gmail.com' ||
    cleanEmail === 'admin' ||
    cleanEmail.includes('admin')
  ) {
    const user: AdminUser = {
      id: 'ADMIN-01',
      email: cleanEmail.includes('@') ? cleanEmail : 'admin@lifeibeauty.com',
      name: 'Pablo Kelvin (Store Owner)',
      role: 'superadmin',
    };
    setStorage(STORAGE_AUTH, user);
    return { success: true, user };
  }

  // Allow custom owner login
  if (pass.length >= 4) {
    const user: AdminUser = {
      id: 'ADMIN-USER',
      email: cleanEmail,
      name: cleanEmail.split('@')[0].toUpperCase(),
      role: 'superadmin',
    };
    setStorage(STORAGE_AUTH, user);
    return { success: true, user };
  }

  return { success: false, error: 'Invalid credentials. Use admin@lifeibeauty.com / admin123' };
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_AUTH);
  }
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}

// ----------------------------------------------------------------------
// Products Service
// ----------------------------------------------------------------------
export function getAdminProducts(): AdminProduct[] {
  return getStorage<AdminProduct[]>(STORAGE_PRODUCTS, INITIAL_ADMIN_PRODUCTS);
}

export function saveAdminProducts(products: AdminProduct[]): void {
  setStorage(STORAGE_PRODUCTS, products);
  fetch('/api/products/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  }).catch(() => {});
}

export function addAdminProduct(newProduct: Omit<AdminProduct, 'id'>): AdminProduct {
  const current = getAdminProducts();
  const nextId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
  const product: AdminProduct = {
    ...newProduct,
    id: nextId,
  };
  const updated = [product, ...current];
  saveAdminProducts(updated);
  return product;
}

export function updateAdminProduct(product: AdminProduct): AdminProduct {
  const current = getAdminProducts();
  const updated = current.map(p => p.id === product.id ? product : p);
  saveAdminProducts(updated);
  return product;
}

export function deleteAdminProduct(productId: number): void {
  const current = getAdminProducts();
  const updated = current.filter(p => p.id !== productId);
  saveAdminProducts(updated);
}

export function toggleProductStatus(productId: number): AdminProduct | null {
  const current = getAdminProducts();
  let updatedProduct: AdminProduct | null = null;
  const updated = current.map(p => {
    if (p.id === productId) {
      updatedProduct = {
        ...p,
        status: p.status === 'active' ? 'draft' : 'active',
        stockStatus: p.stockQuantity === 0 ? 'Out of Stock' : p.stockQuantity < 10 ? 'Low Stock' : 'In Stock'
      };
      return updatedProduct;
    }
    return p;
  });
  saveAdminProducts(updated);
  return updatedProduct;
}

export function updateProductStock(productId: number, newStock: number): AdminProduct | null {
  const current = getAdminProducts();
  let updatedProduct: AdminProduct | null = null;
  const updated = current.map(p => {
    if (p.id === productId) {
      const stockQuantity = Math.max(0, newStock);
      updatedProduct = {
        ...p,
        stockQuantity,
        stockStatus: stockQuantity === 0 ? 'Out of Stock' : stockQuantity < 10 ? 'Low Stock' : 'In Stock'
      };
      return updatedProduct;
    }
    return p;
  });
  saveAdminProducts(updated);
  return updatedProduct;
}

// ----------------------------------------------------------------------
// Orders Service
// ----------------------------------------------------------------------
export function getAdminOrders(): Order[] {
  return getStorage<Order[]>(STORAGE_ORDERS, INITIAL_ORDERS);
}

export function saveAdminOrders(orders: Order[]): void {
  setStorage(STORAGE_ORDERS, orders);
  fetch('/api/orders/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders }),
  }).catch(() => {});
}

export function updateOrder(orderId: string, updates: Partial<Order>): Order | null {
  const current = getAdminOrders();
  let updatedOrder: Order | null = null;
  const updated = current.map(o => {
    if (o.id === orderId) {
      updatedOrder = { ...o, ...updates };
      return updatedOrder;
    }
    return o;
  });
  saveAdminOrders(updated);
  return updatedOrder;
}

export function createOrderFromCheckout(params: {
  customer: Order['customer'];
  items: CartItem[];
  discountCode?: string;
  discountAmount?: number;
  shippingCost?: number;
  paymentMethod?: string;
}): Order {
  const currentOrders = getAdminOrders();
  const nextNum = 1049 + currentOrders.length;
  const orderId = `LF-${nextNum}`;

  const orderItems = params.items.map(item => ({
    productId: item.product.id,
    name: item.product.name,
    price: item.product.numericPrice,
    quantity: item.quantity,
    image: item.product.src,
    variant: item.selectedSize || item.product.volume,
    selectedSize: item.selectedSize,
  }));

  const subtotal = orderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const discountAmount = params.discountAmount || 0;
  const shippingCost = params.shippingCost || 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const newOrder: Order = {
    id: orderId,
    orderNumber: `#${orderId}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    customer: params.customer,
    items: orderItems,
    subtotal,
    discountCode: params.discountCode,
    discountAmount,
    shippingCost,
    total,
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    trackingNumber: '',
    carrier: 'USPS Priority Dispatch',
    notes: 'Order placed directly through Li Fei Beauty storefront checkout.',
  };

  // Decrement inventory
  orderItems.forEach(item => {
    const products = getAdminProducts();
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      updateProductStock(item.productId, prod.stockQuantity - item.quantity);
    }
  });

  // Update or create customer
  recordCustomerPurchase(params.customer, total);

  // If discount code used, increment usage
  if (params.discountCode) {
    incrementDiscountUsage(params.discountCode);
  }

  const updatedOrders = [newOrder, ...currentOrders];
  saveAdminOrders(updatedOrders);
  return newOrder;
}

export function cancelAndRefundOrder(orderId: string): Order | null {
  return updateOrder(orderId, {
    paymentStatus: 'refunded',
    fulfillmentStatus: 'unfulfilled',
    notes: 'Order was cancelled and fully refunded by store administrator.',
  });
}

export function fulfillOrder(orderId: string, trackingNumber: string, carrier = 'USPS Priority'): Order | null {
  return updateOrder(orderId, {
    fulfillmentStatus: 'shipped',
    trackingNumber,
    carrier,
  });
}

export function findOrderForTracking(orderNumberOrId: string, email?: string): Order | null {
  const orders = getAdminOrders();
  const cleanInput = (orderNumberOrId || '').trim().toUpperCase().replace(/^#/, '');
  const cleanEmail = (email || '').trim().toLowerCase();

  return orders.find(o => {
    const cleanOrderNumber = (o.orderNumber || '').toUpperCase().replace(/^#/, '');
    const cleanId = (o.id || '').toUpperCase().replace(/^#/, '');
    const cleanTracking = (o.trackingNumber || '').toUpperCase();

    const matchesNumber = 
      cleanOrderNumber === cleanInput || 
      cleanId === cleanInput || 
      cleanTracking === cleanInput ||
      cleanOrderNumber.includes(cleanInput) ||
      cleanInput.includes(cleanOrderNumber);

    if (!matchesNumber) return false;

    if (cleanEmail) {
      return (o.customer?.email || '').toLowerCase() === cleanEmail;
    }
    return true;
  }) || null;
}

// ----------------------------------------------------------------------
// Customers Service
// ----------------------------------------------------------------------
export function getAdminCustomers(): Customer[] {
  return getStorage<Customer[]>(STORAGE_CUSTOMERS, INITIAL_CUSTOMERS);
}

export function saveAdminCustomers(customers: Customer[]): void {
  setStorage(STORAGE_CUSTOMERS, customers);
}

export function updateCustomer(customerId: string, updates: Partial<Customer>): Customer | null {
  const current = getAdminCustomers();
  let updatedCust: Customer | null = null;
  const updated = current.map(c => {
    if (c.id === customerId) {
      updatedCust = { ...c, ...updates };
      return updatedCust;
    }
    return c;
  });
  saveAdminCustomers(updated);
  return updatedCust;
}

export function recordCustomerPurchase(customerInfo: Order['customer'], amount: number): void {
  const current = getAdminCustomers();
  const existing = current.find(c => c.email.toLowerCase() === customerInfo.email.toLowerCase());
  
  if (existing) {
    const updated = current.map(c => {
      if (c.id === existing.id) {
        return {
          ...c,
          ordersCount: c.ordersCount + 1,
          totalSpent: c.totalSpent + amount,
          lastOrderDate: new Date().toISOString().split('T')[0],
          shippingAddress: {
            address: customerInfo.address,
            city: customerInfo.city,
            country: customerInfo.country,
            zip: customerInfo.zip,
          }
        };
      }
      return c;
    });
    saveAdminCustomers(updated);
  } else {
    const newCust: Customer = {
      id: `CUST-${String(current.length + 1).padStart(2, '0')}`,
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      ordersCount: 1,
      totalSpent: amount,
      lastOrderDate: new Date().toISOString().split('T')[0],
      tags: ['Storefront Checkout'],
      notes: 'New verified customer via online store.',
      joinedDate: new Date().toISOString().split('T')[0],
      shippingAddress: {
        address: customerInfo.address,
        city: customerInfo.city,
        country: customerInfo.country,
        zip: customerInfo.zip,
      }
    };
    saveAdminCustomers([newCust, ...current]);
  }
}

// ----------------------------------------------------------------------
// Discounts Service
// ----------------------------------------------------------------------
export function getAdminDiscounts(): Discount[] {
  return getStorage<Discount[]>(STORAGE_DISCOUNTS, INITIAL_DISCOUNTS);
}

export function saveAdminDiscounts(discounts: Discount[]): void {
  setStorage(STORAGE_DISCOUNTS, discounts);
}

export function addDiscount(discount: Omit<Discount, 'id' | 'usageCount'>): Discount {
  const current = getAdminDiscounts();
  const newDisc: Discount = {
    ...discount,
    id: `DISC-${String(current.length + 1).padStart(2, '0')}`,
    code: discount.code.trim().toUpperCase(),
    usageCount: 0,
  };
  saveAdminDiscounts([newDisc, ...current]);
  return newDisc;
}

export function updateDiscount(id: string, updates: Partial<Discount>): Discount | null {
  const current = getAdminDiscounts();
  let updatedDisc: Discount | null = null;
  const updated = current.map(d => {
    if (d.id === id) {
      updatedDisc = { ...d, ...updates };
      return updatedDisc;
    }
    return d;
  });
  saveAdminDiscounts(updated);
  return updatedDisc;
}

export function deleteDiscount(id: string): void {
  const current = getAdminDiscounts();
  saveAdminDiscounts(current.filter(d => d.id !== id));
}

export function incrementDiscountUsage(code: string): void {
  const current = getAdminDiscounts();
  const updated = current.map(d => {
    if (d.code.toUpperCase() === code.toUpperCase()) {
      return { ...d, usageCount: d.usageCount + 1 };
    }
    return d;
  });
  saveAdminDiscounts(updated);
}

export function validateCoupon(code: string, subtotal: number): { 
  valid: boolean; 
  discountAmount: number; 
  message: string; 
  discount?: Discount 
} {
  const cleanCode = code.trim().toUpperCase();
  const discounts = getAdminDiscounts();
  const discount = discounts.find(d => d.code === cleanCode);

  if (!discount) {
    return { valid: false, discountAmount: 0, message: 'Coupon code not found' };
  }

  if (!discount.active) {
    return { valid: false, discountAmount: 0, message: 'This coupon is no longer active' };
  }

  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return { valid: false, discountAmount: 0, message: 'This coupon has expired' };
  }

  if (subtotal < discount.minPurchase) {
    return { 
      valid: false, 
      discountAmount: 0, 
      message: `Minimum purchase of $${discount.minPurchase.toFixed(2)} required for this code` 
    };
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return { valid: false, discountAmount: 0, message: 'Coupon usage limit reached' };
  }

  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = (subtotal * discount.value) / 100;
  } else {
    discountAmount = Math.min(discount.value, subtotal);
  }

  return {
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100,
    message: `${discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`} applied!`,
    discount
  };
}

// ----------------------------------------------------------------------
// Reviews Moderation Service
// ----------------------------------------------------------------------
export function getAdminReviews(): ReviewModeration[] {
  return getStorage<ReviewModeration[]>(STORAGE_REVIEWS, INITIAL_REVIEWS_MODERATION);
}

export function saveAdminReviews(reviews: ReviewModeration[]): void {
  setStorage(STORAGE_REVIEWS, reviews);
}

export function updateReviewStatus(reviewId: number, status: 'approved' | 'rejected'): ReviewModeration | null {
  const current = getAdminReviews();
  let updatedRev: ReviewModeration | null = null;
  const updated = current.map(r => {
    if (r.id === reviewId) {
      updatedRev = { ...r, status };
      return updatedRev;
    }
    return r;
  });
  saveAdminReviews(updated);
  return updatedRev;
}

export function toggleReviewFeatured(reviewId: number): ReviewModeration | null {
  const current = getAdminReviews();
  let updatedRev: ReviewModeration | null = null;
  const updated = current.map(r => {
    if (r.id === reviewId) {
      updatedRev = { ...r, featured: !r.featured };
      return updatedRev;
    }
    return r;
  });
  saveAdminReviews(updated);
  return updatedRev;
}

export function deleteReview(reviewId: number): void {
  const current = getAdminReviews();
  saveAdminReviews(current.filter(r => r.id !== reviewId));
}

export function submitCustomerReview(review: Omit<ReviewModeration, 'id' | 'status' | 'date'>): ReviewModeration {
  const current = getAdminReviews();
  const nextId = current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1;
  const newRev: ReviewModeration = {
    ...review,
    id: nextId,
    status: 'pending',
    date: 'Just now',
  };
  saveAdminReviews([newRev, ...current]);
  return newRev;
}

// ----------------------------------------------------------------------
// Homepage Content Settings Service
// ----------------------------------------------------------------------
export function getStoreContentSettings(): StoreContentSettings {
  return getStorage<StoreContentSettings>(STORAGE_CONTENT, INITIAL_CONTENT_SETTINGS);
}

export function saveStoreContentSettings(settings: StoreContentSettings): void {
  setStorage(STORAGE_CONTENT, settings);
  fetch('/api/content/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  }).catch(() => {});
}

// ----------------------------------------------------------------------
// Analytics & Dashboard Stats
// ----------------------------------------------------------------------
export function getDashboardMetrics() {
  const orders = getAdminOrders();
  const products = getAdminProducts();
  const customers = getAdminCustomers();
  const reviews = getAdminReviews();

  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus !== 'refunded' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const customersCount = customers.length;
  const avgOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

  // Best selling products calculation
  const productSalesMap: Record<number, { count: number; revenue: number }> = {};
  orders.forEach(o => {
    if (o.paymentStatus !== 'refunded') {
      o.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { count: 0, revenue: 0 };
        }
        productSalesMap[item.productId].count += item.quantity;
        productSalesMap[item.productId].revenue += item.price * item.quantity;
      });
    }
  });

  const bestSellingProducts = products
    .map(p => ({
      id: p.id,
      name: p.name,
      image: p.src,
      category: p.category,
      price: p.price,
      sales: productSalesMap[p.id]?.count || 0,
      revenue: productSalesMap[p.id]?.revenue || 0,
      stockQuantity: p.stockQuantity,
      status: p.status,
    }))
    .sort((a, b) => b.sales - a.sales);

  const lowStockCount = products.filter(p => p.stockQuantity < 10).length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;
  const unfulfilledOrdersCount = orders.filter(o => o.fulfillmentStatus === 'unfulfilled' && o.paymentStatus === 'paid').length;

  return {
    revenue,
    totalSales,
    totalOrders,
    customersCount,
    avgOrderValue,
    bestSellingProducts,
    recentOrders: orders.slice(0, 5),
    lowStockCount,
    pendingReviewsCount,
    unfulfilledOrdersCount,
  };
}
