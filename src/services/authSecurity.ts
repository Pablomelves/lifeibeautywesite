// Secure server/edge session token management for Li Fei Beauty Admin Portal

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'superadmin';
  exp: number;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(
  user: { id?: string; email: string; name?: string; role?: 'superadmin' },
  secret: string
): Promise<string> {
  const payload: AdminSessionPayload = {
    id: user.id || 'ADMIN-01',
    email: user.email.trim().toLowerCase(),
    name: user.name || 'Store Owner',
    role: user.role || 'superadmin',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  const payloadStr = toBase64Url(JSON.stringify(payload));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadStr));
  const sigBytes = new Uint8Array(sigBuffer);
  let sigHex = '';
  for (let i = 0; i < sigBytes.length; i++) {
    sigHex += sigBytes[i].toString(16).padStart(2, '0');
  }

  return `${payloadStr}.${sigHex}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
  secret: string
): Promise<{ valid: boolean; payload?: AdminSessionPayload }> {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadStr, sigHex] = parts;
  if (!payloadStr || !sigHex) {
    return { valid: false };
  }

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadStr));
    const expectedSigBytes = new Uint8Array(expectedSigBuffer);
    let expectedSigHex = '';
    for (let i = 0; i < expectedSigBytes.length; i++) {
      expectedSigHex += expectedSigBytes[i].toString(16).padStart(2, '0');
    }

    if (!timingSafeEqual(expectedSigHex, sigHex)) {
      return { valid: false };
    }

    const payload: AdminSessionPayload = JSON.parse(fromBase64Url(payloadStr));
    if (!payload || !payload.exp || payload.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((part) => {
    const [rawKey, ...valParts] = part.trim().split('=');
    if (rawKey) {
      cookies[rawKey.trim()] = decodeURIComponent(valParts.join('='));
    }
  });
  return cookies;
}
