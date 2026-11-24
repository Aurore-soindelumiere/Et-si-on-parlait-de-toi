// S'exécute avant chaque requête dynamique (voir public/_routes.json).
// 1. Protège /admin et /api/admin/* (vérification serveur du jeton Cloudflare Access).
// 2. Ajoute des en-têtes de sécurité.

import { requireAdmin } from './_lib/auth.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

function isProtected(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin');
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (isProtected(url.pathname)) {
    const admin = await requireAdmin(request, env);
    if (!admin) {
      const isApi = url.pathname.startsWith('/api/');
      return new Response(
        isApi ? JSON.stringify({ ok: false, error: 'unauthorized' }) : 'Accès réservé.',
        {
          status: 403,
          headers: {
            'Content-Type': isApi ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            ...SECURITY_HEADERS,
          },
        },
      );
    }
    context.data.admin = admin;
  }

  const response = await context.next();
  const res = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  if (isProtected(url.pathname)) {
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}
