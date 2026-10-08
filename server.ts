import express, { Request, Response } from 'express';
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

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;
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
        pass: 'admin123',
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
// 1. Authentication
// ----------------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, pass } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  const user = db.users.find((u: any) => u.email.toLowerCase() === cleanEmail) || 
    (cleanEmail.includes('admin') || cleanEmail.includes('pablo') ? {
      id: 'ADMIN-01',
      email: cleanEmail,
      name: 'Pablo Kelvin (Store Owner)',
      role: 'superadmin',
    } : null);

  if (user) {
    const token = `lifei_auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
    return;
  }

  res.status(401).json({ success: false, error: 'Invalid credentials. Use admin@lifeibeauty.com' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: db.users[0] || {
      id: 'ADMIN-01',
      email: 'admin@lifeibeauty.com',
      name: 'Pablo Kelvin (Store Owner)',
      role: 'superadmin',
    }
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 2. Products API
// ----------------------------------------------------------------------
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ products: db.products });
});

app.post('/api/products', (req: Request, res: Response) => {
  const newProduct = req.body;
  const nextId = db.products.length > 0 ? Math.max(...db.products.map((p: any) => p.id)) + 1 : 1;
  const item = { ...newProduct, id: nextId };
  db.products.unshift(item);
  saveDB(db);
  res.json({ product: item });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updates = req.body;
  db.products = db.products.map((p: any) => p.id === id ? { ...p, ...updates } : p);
  saveDB(db);
  res.json({ success: true, product: db.products.find((p: any) => p.id === id) });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  db.products = db.products.filter((p: any) => p.id !== id);
  saveDB(db);
  res.json({ success: true });
});

app.post('/api/products/sync', (req: Request, res: Response) => {
  if (Array.isArray(req.body.products)) {
    db.products = req.body.products;
    saveDB(db);
  }
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 3. Orders API
// ----------------------------------------------------------------------
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ orders: db.orders });
});

// Dedicated Track My Order endpoint
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

app.post('/api/orders', (req: Request, res: Response) => {
  const order = req.body;
  db.orders.unshift(order);
  saveDB(db);
  res.json({ success: true, order });
});

app.put('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  db.orders = db.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o);
  saveDB(db);
  res.json({ success: true, order: db.orders.find((o: any) => o.id === id) });
});

app.post('/api/orders/sync', (req: Request, res: Response) => {
  if (Array.isArray(req.body.orders)) {
    db.orders = req.body.orders;
    saveDB(db);
  }
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 4. Customers API
// ----------------------------------------------------------------------
app.get('/api/customers', (_req: Request, res: Response) => {
  res.json({ customers: db.customers });
});

app.put('/api/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  db.customers = db.customers.map((c: any) => c.id === id ? { ...c, ...updates } : c);
  saveDB(db);
  res.json({ success: true, customer: db.customers.find((c: any) => c.id === id) });
});

// ----------------------------------------------------------------------
// 5. Discounts API
// ----------------------------------------------------------------------
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
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json({ reviews: db.reviews });
});

app.put('/api/reviews/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updates = req.body;
  db.reviews = db.reviews.map((r: any) => r.id === id ? { ...r, ...updates } : r);
  saveDB(db);
  res.json({ success: true });
});

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
app.get('/api/content', (_req: Request, res: Response) => {
  res.json({ content: db.content });
});

app.post('/api/content/sync', (req: Request, res: Response) => {
  db.content = req.body.settings || req.body;
  saveDB(db);
  res.json({ success: true });
});

// ----------------------------------------------------------------------
// 8. Stats / Analytics
// ----------------------------------------------------------------------
app.get('/api/stats', (_req: Request, res: Response) => {
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
// 9. Image Upload (Accepts Base64 data URL and writes to /public/uploads)
// ----------------------------------------------------------------------
app.post('/api/upload', (req: Request, res: Response) => {
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
// 10. AI Recommendations API
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
