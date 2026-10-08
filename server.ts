import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  INITIAL_ADMIN_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_DISCOUNTS, 
  INITIAL_REVIEWS_MODERATION, 
  INITIAL_CONTENT_SETTINGS, 
  DEFAULT_ADMIN_USER 
} from './src/data/initialAdminData.ts';
import { 
  createSessionToken, 
  verifySessionToken, 
  timingSafeEqual, 
  parseCookies 
} from './src/services/authSecurity.ts';

// Load environment variables if available
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  if (typeof (process as any).loadEnvFile === 'function') {
    (process as any).loadEnvFile(envPath);
  }
}

const app = express();
const httpServer = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);
const DB_FILE = path.resolve(process.cwd(), 'data/store_db.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Memory + File DB helper
interface DBState {
  products: any[];
  orders: any[];
  customers: any[];
  discounts: any[];
  reviews: any[];
  content: any;
  users: any[];
}

function loadDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.discounts && parsed.discounts.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
  }

  // Seed with rich default store data
  const initial: DBState = {
    products: INITIAL_ADMIN_PRODUCTS,
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    discounts: INITIAL_DISCOUNTS,
    reviews: INITIAL_REVIEWS_MODERATION,
    content: INITIAL_CONTENT_SETTINGS,
    users: [
      {
        ...DEFAULT_ADMIN_USER,
      }
    ],
  };

  saveDB(initial);
  return initial;
}

function saveDB(state: DBState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
  }
}

let db = loadDB();

// Environment helpers for secure admin authentication
function getAdminCredentials() {
  const secret = process.env.SESSION_SECRET || 'lifei_beauty_super_secure_session_secret_hmac_2026_salt';
  const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@lifeibeauty.com').trim().toLowerCase();
  const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';
  return { secret, expectedEmail, expectedPass };
}

// Helper: extract token from cookie or Authorization header
function extractToken(req: Request): string | null {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies['lifei_admin_session'];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

// Admin-only middleware to protect API routes
async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { secret } = getAdminCredentials();
  const token = extractToken(req);

  const verification = await verifySessionToken(token, secret);
  if (!verification.valid || !verification.payload) {
    res.status(401).json({ 
      error: 'Unauthorized: Store admin credentials required', 
      authenticated: false 
    });
    return;
  }

  (req as any).adminUser = verification.payload;
  next();
}

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: '15mb' }));

// ----------------------------------------------------------------------
// URL Route Guard for /admin pages (Server-side protection)
// ----------------------------------------------------------------------
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const reqPath = req.path.toLowerCase();

  // Protect /admin and any subpaths, except /admin/login which is the login interface
  if (
    reqPath === '/admin' || 
    reqPath === '/admin/' || 
    (reqPath.startsWith('/admin/') && reqPath !== '/admin/login' && reqPath !== '/admin/login/')
  ) {
    const { secret } = getAdminCredentials();
    const token = extractToken(req);
    const verification = await verifySessionToken(token, secret);

    if (!verification.valid || !verification.payload) {
      // Forbidden: redirect to normal storefront with unauthorized query parameter
      res.status(403).redirect('/?unauthorized=admin_access_denied');
      return;
    }
  }

  next();
});

// ----------------------------------------------------------------------
// 1. Authentication
// ----------------------------------------------------------------------
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, pass } = req.body;
  const { secret, expectedEmail, expectedPass } = getAdminCredentials();

  const cleanEmail = (email || '').trim().toLowerCase();
  const inputPass = String(pass || '');

  const isEmailValid = cleanEmail === expectedEmail;
  const isPassValid = timingSafeEqual(inputPass, expectedPass);

  if (!isEmailValid || !isPassValid) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid store owner credentials' 
    });
    return;
  }

  const user = {
    id: 'ADMIN-01',
    email: expectedEmail,
    name: 'Pablo Kelvin (Store Owner)',
    role: 'superadmin' as const,
  };

  const token = await createSessionToken(user, secret);

  // Set secure HTTP-only session cookie
  res.cookie('lifei_admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    token,
    user,
  });
});

app.get('/api/auth/verify', async (req: Request, res: Response) => {
  const { secret } = getAdminCredentials();
  const token = extractToken(req);

  const verification = await verifySessionToken(token, secret);
  if (!verification.valid || !verification.payload) {
    res.status(401).json({
      authenticated: false,
      error: 'Unauthorized: Store admin session invalid or expired'
    });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: verification.payload.id,
      email: verification.payload.email,
      name: verification.payload.name,
      role: verification.payload.role,
    }
  });
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  const { secret } = getAdminCredentials();
  const token = extractToken(req);

  const verification = await verifySessionToken(token, secret);
  if (!verification.valid || !verification.payload) {
    res.status(401).json({
      authenticated: false,
      error: 'Unauthorized: Store admin session invalid or expired'
    });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: verification.payload.id,
      email: verification.payload.email,
      name: verification.payload.name,
      role: verification.payload.role,
    }
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('lifei_admin_session', { path: '/' });
  res.json({ success: true, message: 'Signed out of store admin' });
});

// ----------------------------------------------------------------------
// 2. Products API
// ----------------------------------------------------------------------
// Public: Customers and storefront can view active products
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ products: db.products });
});

// Protected: Only authorized admin can add products
app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const newProduct = req.body;
  const nextId = db.products.length > 0 ? Math.max(...db.products.map((p: any) => p.id)) + 1 : 1;
  const item = { ...newProduct, id: nextId };
  db.products.unshift(item);
  saveDB(db);
  res.json({ product: item });
});

// Protected: Only authorized admin can update products
app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updates = req.body;
  db.products = db.products.map((p: any) => p.id === id ? { ...p, ...updates } : p);
  saveDB(db);
  res.json({ success: true, product: db.products.find((p: any) => p.id === id) });
});

// Protected: Only authorized admin can delete products
app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  db.products = db.products.filter((p: any) => p.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// Protected: Only authorized admin can batch sync products
app.post('/api/products/sync', requireAdmin, (req: Request, res: Response) => {
  if (Array.isArray(req.body.products)) {
    db.products = req.body.products;
    saveDB(db);
  }
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 3. Orders API
// ----------------------------------------------------------------------
// Protected: Only authorized admin can view complete orders list
app.get('/api/orders', requireAdmin, (_req: Request, res: Response) => {
  res.json({ orders: db.orders });
});

// Dedicated Public Track My Order endpoint (Customers can look up their own order)
app.get('/api/orders/track', (req: Request, res: Response) => {
  const queryParam = ((req.query.orderNumber || req.query.q) as string || '').trim().toUpperCase();
  const emailParam = (req.query.email as string || '').trim().toLowerCase();

  if (!queryParam) {
    res.status(400).json({ found: false, error: 'Please provide an order number or tracking number' });
    return;
  }

  const cleanInput = queryParam.replace(/^#/, '');

  const matched = (db.orders || []).find((o: any) => {
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

    if (emailParam) {
      return (o.customer?.email || '').toLowerCase() === emailParam;
    }
    return true;
  });

  if (matched) {
    res.json({ found: true, order: matched });
  } else {
    res.json({ 
      found: false, 
      error: emailParam 
        ? `No order found matching "${queryParam}" with email "${emailParam}".` 
        : `No order found matching "${queryParam}".` 
    });
  }
});

// Email Notification Simulation Endpoint
app.post('/api/notifications/email', (req: Request, res: Response) => {
  const { to, subject, type, orderNumber } = req.body;
  console.log(`[Seoul Mail Server] Sent ${type || 'notification'} to ${to} for Order ${orderNumber}: "${subject}"`);
  res.json({ 
    success: true, 
    deliveredAt: new Date().toISOString(),
    message: `Email notification sent to ${to}` 
  });
});

// Public: Customer checkout order creation
app.post('/api/orders', (req: Request, res: Response) => {
  const order = req.body;
  db.orders.unshift(order);
  saveDB(db);
  res.json({ success: true, order });
});

// Protected: Only admin can update order fulfillment/status
app.put('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  db.orders = db.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o);
  saveDB(db);
  res.json({ success: true, order: db.orders.find((o: any) => o.id === id) });
});

// Protected: Only admin can sync orders
app.post('/api/orders/sync', requireAdmin, (req: Request, res: Response) => {
  if (Array.isArray(req.body.orders)) {
    db.orders = req.body.orders;
    saveDB(db);
  }
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 4. Customers API
// ----------------------------------------------------------------------
// Protected: Customers list is accessible to admin only
app.get('/api/customers', requireAdmin, (_req: Request, res: Response) => {
  res.json({ customers: db.customers });
});

app.put('/api/customers/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  db.customers = db.customers.map((c: any) => c.id === id ? { ...c, ...updates } : c);
  saveDB(db);
  res.json({ success: true, customer: db.customers.find((c: any) => c.id === id) });
});

// ----------------------------------------------------------------------
// 5. Discounts API
// ----------------------------------------------------------------------
// Public: Discount rules lookup / validation
app.get('/api/discounts', (_req: Request, res: Response) => {
  res.json({ discounts: db.discounts });
});

app.post('/api/discounts/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const clean = (code || '').trim().toUpperCase();
  const disc = db.discounts.find((d: any) => d.code === clean);

  if (!disc || !disc.active) {
    res.json({ valid: false, message: 'Invalid or inactive promo code' });
    return;
  }
  if (subtotal < disc.minPurchase) {
    res.json({ valid: false, message: `Minimum purchase of $${disc.minPurchase} required` });
    return;
  }

  const discountAmount = disc.type === 'percentage' 
    ? (subtotal * disc.value) / 100 
    : Math.min(disc.value, subtotal);

  res.json({
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100,
    message: `${disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`} applied!`,
    discount: disc,
  });
});

// ----------------------------------------------------------------------
// 6. Reviews API
// ----------------------------------------------------------------------
// Public: Reviews display
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json({ reviews: db.reviews });
});

// Protected: Review moderation
app.put('/api/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updates = req.body;
  db.reviews = db.reviews.map((r: any) => r.id === id ? { ...r, ...updates } : r);
  saveDB(db);
  res.json({ success: true });
});

// Public: Customer review submission (pending moderation)
app.post('/api/reviews', (req: Request, res: Response) => {
  const newRev = req.body;
  const nextId = db.reviews.length > 0 ? Math.max(...db.reviews.map((r: any) => r.id)) + 1 : 1;
  const review = {
    ...newRev,
    id: nextId,
    status: 'pending',
    date: 'Just now',
  };
  db.reviews.unshift(review);
  saveDB(db);
  res.json({ success: true, review });
});

// ----------------------------------------------------------------------
// 7. Store Content Settings
// ----------------------------------------------------------------------
// Public: Storefront content
app.get('/api/content', (_req: Request, res: Response) => {
  res.json({ content: db.content });
});

// Protected: Only admin can publish content updates
app.post('/api/content/sync', requireAdmin, (req: Request, res: Response) => {
  db.content = req.body.settings || req.body;
  saveDB(db);
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 8. Stats / Analytics (Admin only)
// ----------------------------------------------------------------------
app.get('/api/stats', requireAdmin, (_req: Request, res: Response) => {
  const orders = db.orders || [];
  const paidOrders = orders.filter((o: any) => o.paymentStatus === 'paid');
  const revenue = paidOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const customersCount = (db.customers || []).length;
  const avgOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

  res.json({
    revenue,
    totalOrders,
    customersCount,
    avgOrderValue,
  });
});

// ----------------------------------------------------------------------
// 9. Image Upload (Protected - Admin only)
// ----------------------------------------------------------------------
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    res.status(400).json({ error: 'Missing dataUrl' });
    return;
  }

  try {
    const uploadDir = path.resolve(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = dataUrl.includes('image/webp') ? 'webp' : dataUrl.includes('image/png') ? 'png' : 'jpg';
    const cleanFilename = (filename || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_') + `.${ext}`;
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(path.join(uploadDir, cleanFilename), buffer);
    res.json({
      success: true,
      url: `/uploads/${cleanFilename}`,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// ----------------------------------------------------------------------
// 10. AI Recommendations API (Public for customer consultation)
// ----------------------------------------------------------------------
app.post('/api/gemini/recommendations', async (req: Request, res: Response) => {
  try {
    const { profileInfo, products } = req.body;

    if (!profileInfo || !products || !Array.isArray(products)) {
      res.status(400).json({ error: 'Missing profileInfo or products' });
      return;
    }

    const { skinGoal, skinType } = profileInfo;

    const productContext = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      skinType: p.skinType,
      benefits: p.benefits,
      fullDescription: p.fullDescription
    }));

    const prompt = `
      Based on the following user skin profile and product catalog, recommend the top 3 products that would best help the user achieve their skin goals.

      USER PROFILE:
      - Skin Goal: ${skinGoal || 'General glow'}
      - Skin Type: ${skinType || 'Not specified'}

      PRODUCT CATALOG:
      ${JSON.stringify(productContext, null, 2)}

      Provide your recommendations as a JSON array of product IDs only, sorted by most relevant to least relevant.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.NUMBER,
          }
        }
      }
    });

    const recommendedIds = JSON.parse(response.text || '[]');
    res.json({ recommendedIds });
  } catch (err: any) {
    console.error('Gemini Recommendation Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations', message: err.message });
  }
});

// ----------------------------------------------------------------------
// Vite Middleware mounting
// ----------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
          clientPort: 443,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Li Fei Beauty Store & Admin API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
