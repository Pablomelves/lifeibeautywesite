import { createHash, randomBytes } from 'node:crypto';

export interface BagLine {
  productId: number;
  variantId: string;
  quantity: number;
}

export interface BagStore {
  read: (id: string) => Promise<{ lines: BagLine[]; revision: number } | null>;
  save: (id: string, lines: BagLine[], revision: number) => Promise<number | null>;
}

export function validateBagLines(value: unknown): BagLine[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Your bag can contain up to 100 different items.');
  const variants = new Set<string>();
  return value.map(line => {
    if (!line || !Number.isSafeInteger(line.productId) || line.productId <= 0 || typeof line.variantId !== 'string' || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(line.variantId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 999 || variants.has(line.variantId)) {
      throw new Error('Your bag contains an invalid variant or quantity.');
    }
    variants.add(line.variantId);
    return { productId: line.productId, variantId: line.variantId, quantity: line.quantity };
  });
}

export function createBagHandler(store: BagStore) {
  return async (request: Request) => {
    const headers: Record<string, string> = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
    if (!['GET', 'PUT'].includes(request.method)) return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: { ...headers, Allow: 'GET, PUT' } });
    const origin = request.headers.get('Origin');
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') return Response.json({ error: 'Cross-site bag access is not allowed.' }, { status: 403, headers });
    let session = request.headers.get('Cookie')?.split(';').map(cookie => cookie.trim()).find(cookie => cookie.startsWith('lifei_bag='))?.slice('lifei_bag='.length);
    if (!session || !/^[a-f0-9]{64}$/.test(session)) {
      if (request.method === 'PUT') return Response.json({ error: 'Reload your bag before saving it.' }, { status: 428, headers });
      session = randomBytes(32).toString('hex');
    }
    headers['Set-Cookie'] = `lifei_bag=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
    const id = createHash('sha256').update(session).digest('hex');
    try {
      if (request.method === 'GET') return Response.json(await store.read(id) || { lines: [], revision: 0 }, { headers });
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return Response.json({ error: 'A JSON bag is required.' }, { status: 415, headers });
      const text = await request.text();
      if (text.length > 32000) return Response.json({ error: 'The bag request is too large.' }, { status: 413, headers });
      let lines: BagLine[];
      let revision: number;
      try {
        const body = JSON.parse(text);
        lines = validateBagLines(body.lines);
        revision = body.revision;
        if (!Number.isInteger(revision) || revision < 0) throw new Error('Invalid bag revision.');
      } catch {
        return Response.json({ error: 'Your bag contains an invalid variant, quantity, or revision.' }, { status: 400, headers });
      }
      const saved = await store.save(id, lines, revision);
      if (saved === null) return Response.json({ error: 'Your bag changed in another tab. Retry saving to keep the items currently shown.' }, { status: 409, headers });
      return Response.json({ revision: saved }, { headers });
    } catch {
      return Response.json({ error: 'Your bag could not be saved. Your current items are still available for checkout. Please retry.' }, { status: 503, headers });
    }
  };
}
