import type { Config, Context } from '@netlify/functions';
import { createSessionToken, verifySessionToken, timingSafeEqual } from '../../src/services/authSecurity.ts';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const action = context.params.action || url.pathname.split('/').pop() || '';
  const method = req.method.toUpperCase();

  const secret = 
    Netlify.env.get('SESSION_SECRET') || 
    process.env.SESSION_SECRET || 
    'lifei_beauty_super_secure_session_secret_hmac_2026_salt';

  const expectedEmail = (
    Netlify.env.get('ADMIN_EMAIL') || 
    process.env.ADMIN_EMAIL || 
    'admin@lifeibeauty.com'
  ).trim().toLowerCase();

  const expectedPass = 
    Netlify.env.get('ADMIN_PASSWORD') || 
    process.env.ADMIN_PASSWORD || 
    'admin123';

  // 1. POST /api/auth/login
  if (method === 'POST' && (action === 'login' || url.pathname.endsWith('/login'))) {
    try {
      const body = await req.json();
      const inputEmail = (body.email || '').trim().toLowerCase();
      const inputPass = String(body.pass || '');

      const isEmailValid = inputEmail === expectedEmail;
      const isPassValid = timingSafeEqual(inputPass, expectedPass);

      if (!isEmailValid || !isPassValid) {
        return Response.json(
          { success: false, error: 'Invalid store owner credentials' },
          { status: 401 }
        );
      }

      const user = {
        id: 'ADMIN-01',
        email: expectedEmail,
        name: 'Pablo Kelvin (Store Owner)',
        role: 'superadmin' as const,
      };

      const token = await createSessionToken(user, secret);

      // Set secure HTTP-only session cookie
      context.cookies.set({
        name: 'lifei_admin_session',
        value: token,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60,
      });

      return Response.json({
        success: true,
        token,
        user,
      });
    } catch {
      return Response.json(
        { success: false, error: 'Malformed request body' },
        { status: 400 }
      );
    }
  }

  // 2. GET /api/auth/verify or GET /api/auth/me
  if (
    method === 'GET' && 
    (action === 'verify' || action === 'me' || url.pathname.endsWith('/verify') || url.pathname.endsWith('/me'))
  ) {
    const sessionCookie = context.cookies.get('lifei_admin_session');
    const authHeader = req.headers.get('authorization');
    const token = sessionCookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

    const verification = await verifySessionToken(token, secret);

    if (!verification.valid || !verification.payload) {
      return Response.json(
        { authenticated: false, error: 'Unauthorized: Store admin session invalid or expired' },
        { status: 401 }
      );
    }

    return Response.json({
      authenticated: true,
      user: {
        id: verification.payload.id,
        email: verification.payload.email,
        name: verification.payload.name,
        role: verification.payload.role,
      },
    });
  }

  // 3. POST /api/auth/logout
  if (method === 'POST' && (action === 'logout' || url.pathname.endsWith('/logout'))) {
    context.cookies.delete('lifei_admin_session');
    return Response.json({ success: true, message: 'Signed out of admin session' });
  }

  return Response.json({ error: 'Endpoint not found' }, { status: 404 });
};

export const config: Config = {
  path: ['/api/auth/:action', '/api/auth'],
};
