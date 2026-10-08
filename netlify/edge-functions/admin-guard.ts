import type { Config, Context } from '@netlify/edge-functions';
import { verifySessionToken } from '../../src/services/authSecurity.ts';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathname = url.pathname.toLowerCase();

  // Exclude /admin/login from the guard so the store owner can reach the login interface
  if (
    pathname === '/admin/login' || 
    pathname === '/admin/login/' ||
    url.searchParams.get('login') === 'admin'
  ) {
    return;
  }

  const secret = 
    Netlify.env.get('SESSION_SECRET') || 
    'lifei_beauty_super_secure_session_secret_hmac_2026_salt';

  // Read session cookie
  const sessionCookie = context.cookies.get('lifei_admin_session');
  const authHeader = req.headers.get('authorization');
  const token = sessionCookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  const verification = await verifySessionToken(token, secret);

  // If unauthenticated or token is invalid/expired, deny access and redirect to storefront
  if (!verification.valid || !verification.payload) {
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('unauthorized', 'admin_access_denied');

    // Return forbidden/unauthorized redirect response
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        // Clear any stale invalid cookie
        'Set-Cookie': 'lifei_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
        'X-Admin-Access': 'Denied',
      },
    });
  }

  // Access granted for authenticated store admin
  return;
};

export const config: Config = {
  path: ['/admin', '/admin/*'],
  excludedPath: ['/admin/login', '/admin/login/*'],
};
