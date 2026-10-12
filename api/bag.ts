import { createHash, randomBytes, createHmac } from 'node:crypto';
import { validateBagLines, type BagLine } from '../netlify/lib/storefront-bag.js';
import { checkRateLimit, getClientIp, getSecurityHeaders } from './lib/security.js';

interface StoredBag {
  lines: BagLine[];
  revision: number;
  expiresAt: number;
}

// In-memory bag store with LRU/TTL expiration
const bagMemoryStore = new Map<string, StoredBag>();
const MAX_BAG_ITEMS = 5000;

function cleanupExpiredBags() {
  const now = Date.now();
  for (const [id, bag] of bagMemoryStore.entries()) {
    if (bag.expiresAt <= now) {
      bagMemoryStore.delete(id);
    }
  }
}

// Secret for cookie payload signing
const BAG_SIGNING_SECRET = process.env.BAG_SECRET || 'lifei-beauty-secure-bag-secret-2026';

function signState(data: string): string {
  const hmac = createHmac('sha256', BAG_SIGNING_SECRET).update(data).digest('base64url');
  return `${data}.${hmac}`;
}

function verifyAndExtractState(signed: string): StoredBag | null {
  try {
    const parts = signed.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expected = createHmac('sha256', BAG_SIGNING_SECRET).update(data).digest('base64url');
    if (signature !== expected) return null;
    const json = Buffer.from(data, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.lines) || typeof parsed.revision !== 'number') return null;
    return {
      lines: validateBagLines(parsed.lines),
      revision: parsed.revision,
      expiresAt: parsed.expiresAt || Date.now() + 30 * 24 * 3600 * 1000,
    };
  } catch {
    return null;
  }
}

export async function processBagRequest(options: {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: string | Record<string, unknown>;
  clientIp?: string;
}): Promise<{
  status: number;
  headers: Record<string, string>;
  body: unknown;
}> {
  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie',
    ...getSecurityHeaders(),
  };

  const { method, url, clientIp } = options;

  // Rate Limiting per IP
  if (clientIp) {
    const rateCheck = checkRateLimit(`bag:${clientIp}`, 90, 60000);
    if (!rateCheck.allowed) {
      return {
        status: 429,
        headers: {
          ...responseHeaders,
          'Retry-After': String(rateCheck.retryAfterSec),
        },
        body: { error: 'Too many cart requests. Please slow down.' },
      };
    }
  }

  if (!['GET', 'PUT'].includes(method)) {
    return {
      status: 405,
      headers: { ...responseHeaders, Allow: 'GET, PUT' },
      body: { error: 'Method not allowed.' },
    };
  }

  // Cross-Site Request Forgery Protection
  const originHeader = options.headers['origin'];
  const origin = typeof originHeader === 'string' ? originHeader : Array.isArray(originHeader) ? originHeader[0] : null;
  const secFetchSite = options.headers['sec-fetch-site'];

  let requestUrl: URL;
  try {
    requestUrl = new URL(url, 'https://lifeibeauty.com');
  } catch {
    requestUrl = new URL('https://lifeibeauty.com/api/bag');
  }

  if (
    (origin && origin !== requestUrl.origin && !requestUrl.hostname.includes('localhost') && !requestUrl.hostname.includes('run.app')) ||
    secFetchSite === 'cross-site'
  ) {
    return {
      status: 403,
      headers: responseHeaders,
      body: { error: 'Cross-site bag access is not allowed.' },
    };
  }

  // Cookie parsing
  const cookieHeader = options.headers['cookie'];
  const rawCookie = typeof cookieHeader === 'string' ? cookieHeader : Array.isArray(cookieHeader) ? cookieHeader.join('; ') : '';
  const cookies: Record<string, string> = {};
  for (const part of rawCookie.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k && v) cookies[k] = v;
  }

  let session = cookies['lifei_bag'];
  if (!session || !/^[a-f0-9]{64}$/.test(session)) {
    if (method === 'PUT') {
      return {
        status: 428,
        headers: responseHeaders,
        body: { error: 'Reload your bag before saving it.' },
      };
    }
    session = randomBytes(32).toString('hex');
  }

  const isHttps = requestUrl.protocol === 'https:' || options.headers['x-forwarded-proto'] === 'https';
  responseHeaders['Set-Cookie'] = `lifei_bag=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${isHttps ? '; Secure' : ''}`;

  const sessionId = createHash('sha256').update(session).digest('hex');

  // Periodic cleanup
  cleanupExpiredBags();

  try {
    if (method === 'GET') {
      // 1. Check in-memory store
      let stored = bagMemoryStore.get(sessionId);

      // 2. If not found in memory, check signed backup cookie
      if (!stored && cookies['lifei_bag_state']) {
        const decoded = verifyAndExtractState(cookies['lifei_bag_state']);
        if (decoded && decoded.expiresAt > Date.now()) {
          stored = decoded;
          bagMemoryStore.set(sessionId, decoded);
        }
      }

      if (stored && stored.expiresAt > Date.now()) {
        return {
          status: 200,
          headers: responseHeaders,
          body: { lines: stored.lines, revision: stored.revision },
        };
      }

      return {
        status: 200,
        headers: responseHeaders,
        body: { lines: [], revision: 0 },
      };
    }

    // PUT Handler
    const contentType = options.headers['content-type'];
    const ct = typeof contentType === 'string' ? contentType : Array.isArray(contentType) ? contentType[0] : '';
    if (!ct || !ct.startsWith('application/json')) {
      return {
        status: 415,
        headers: responseHeaders,
        body: { error: 'A JSON bag is required.' },
      };
    }

    let rawText = '';
    if (typeof options.body === 'string') {
      rawText = options.body;
    } else if (options.body && typeof options.body === 'object') {
      rawText = JSON.stringify(options.body);
    }

    if (rawText.length > 32000) {
      return {
        status: 413,
        headers: responseHeaders,
        body: { error: 'The bag request is too large.' },
      };
    }

    let lines: BagLine[];
    let incomingRevision: number;

    try {
      const parsed = JSON.parse(rawText || '{}');
      lines = validateBagLines(parsed.lines);
      incomingRevision = parsed.revision;
      if (!Number.isInteger(incomingRevision) || incomingRevision < 0) {
        throw new Error('Invalid bag revision.');
      }
    } catch {
      return {
        status: 400,
        headers: responseHeaders,
        body: { error: 'Your bag contains an invalid variant, quantity, or revision.' },
      };
    }

    // Read current state
    let current = bagMemoryStore.get(sessionId);
    if (!current && cookies['lifei_bag_state']) {
      const decoded = verifyAndExtractState(cookies['lifei_bag_state']);
      if (decoded && decoded.expiresAt > Date.now()) {
        current = decoded;
      }
    }

    const currentRev = current ? current.revision : 0;
    if (currentRev !== incomingRevision) {
      return {
        status: 409,
        headers: responseHeaders,
        body: { error: 'Your bag changed in another tab. Retry saving to keep the items currently shown.' },
      };
    }

    const newRevision = incomingRevision + 1;
    const expiresAt = Date.now() + 30 * 24 * 3600 * 1000;

    // Check memory size cap
    if (bagMemoryStore.size >= MAX_BAG_ITEMS) {
      const oldestKey = bagMemoryStore.keys().next().value;
      if (oldestKey) bagMemoryStore.delete(oldestKey);
    }

    const newEntry: StoredBag = { lines, revision: newRevision, expiresAt };
    bagMemoryStore.set(sessionId, newEntry);

    // Also embed signed backup state in cookie for cross-serverless resilience
    const statePayload = Buffer.from(JSON.stringify({ lines, revision: newRevision, expiresAt })).toString('base64url');
    const signedCookie = signState(statePayload);
    // Append secondary cookie
    const stateCookie = `lifei_bag_state=${signedCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${isHttps ? '; Secure' : ''}`;
    responseHeaders['Set-Cookie'] = `${responseHeaders['Set-Cookie']}, ${stateCookie}`;

    return {
      status: 200,
      headers: responseHeaders,
      body: { revision: newRevision },
    };
  } catch (err) {
    console.error('Bag processing error:', err);
    return {
      status: 503,
      headers: responseHeaders,
      body: { error: 'Your bag could not be saved. Your current items are still available for checkout. Please retry.' },
    };
  }
}

export async function handleBagWebRequest(req: Request): Promise<Response> {
  const method = req.method;
  let body: string | undefined;
  if (method === 'PUT') {
    try {
      body = await req.text();
    } catch {
      body = '';
    }
  }

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const clientIp = getClientIp(req);
  const result = await processBagRequest({
    method,
    url: req.url,
    headers,
    body,
    clientIp,
  });

  const res = Response.json(result.body, {
    status: result.status,
  });

  for (const [key, val] of Object.entries(result.headers)) {
    if (key.toLowerCase() === 'set-cookie') {
      const cookies = val.split(', ');
      for (const cookie of cookies) {
        res.headers.append('Set-Cookie', cookie);
      }
    } else {
      res.headers.set(key, val);
    }
  }

  return res;
}

export async function handleBagNodeRequest(req: any, res: any): Promise<void> {
  const method = req.method || 'GET';
  let body: any = req.body;
  if (method === 'PUT' && typeof body === 'undefined') {
    body = await new Promise<string>((resolve) => {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => resolve(data));
      req.on('error', () => resolve(''));
    });
  }

  const clientIp = getClientIp(req);
  const headers: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    headers[k.toLowerCase()] = v as any;
  }

  const proto = req.headers?.['x-forwarded-proto'] || (req.connection?.encrypted ? 'https' : 'http');
  const host = req.headers?.['host'] || 'lifeibeauty.com';
  const url = `${proto}://${host}${req.url || '/api/bag'}`;

  const result = await processBagRequest({
    method,
    url,
    headers,
    body,
    clientIp,
  });

  for (const [key, val] of Object.entries(result.headers)) {
    if (key.toLowerCase() === 'set-cookie') {
      const cookies = val.split(', ');
      res.setHeader('Set-Cookie', cookies);
    } else {
      res.setHeader(key, val);
    }
  }

  res.status(result.status).json(result.body);
}

export async function GET(req: Request): Promise<Response> {
  return handleBagWebRequest(req);
}

export async function PUT(req: Request): Promise<Response> {
  return handleBagWebRequest(req);
}

export default async function handler(req: any, res?: any): Promise<Response | void> {
  if (res && typeof res.status === 'function') {
    return handleBagNodeRequest(req, res);
  }
  return handleBagWebRequest(req);
}
