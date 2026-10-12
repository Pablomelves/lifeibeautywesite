interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Server-side sliding-window rate limiter
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  cleanupStaleEntries();
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterSec: 0 };
}

/**
 * Extract client IP from Request or Node incoming message
 */
export function getClientIp(req: any): string {
  if (req && typeof req.headers?.get === 'function') {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
  } else if (req && req.headers) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0].trim();
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') return realIp.trim();
    if (req.socket?.remoteAddress) return req.socket.remoteAddress;
  }
  return '127.0.0.1';
}

/**
 * Standard HTTP security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * Cloudflare Turnstile server-side verification
 */
export async function verifyTurnstile(token: string, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If not configured, pass-through
    return { success: true };
  }
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'CAPTCHA verification token is missing' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(5000),
    });

    const result = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!result.success) {
      return {
        success: false,
        error: `CAPTCHA verification failed: ${(result['error-codes'] || []).join(', ') || 'invalid token'}`,
      };
    }
    return { success: true };
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return { success: false, error: 'CAPTCHA verification service error' };
  }
}
