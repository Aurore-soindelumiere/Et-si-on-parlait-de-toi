// Vérification côté serveur de l'accès administrateur.
//
// L'espace /admin et les API /api/admin/* sont protégés par Cloudflare Access.
// Cloudflare Access ajoute à chaque requête autorisée un jeton signé
// (en-tête "Cf-Access-Jwt-Assertion"). Ici, on VÉRIFIE ce jeton :
// signature, audience, émetteur, date d'expiration et adresse autorisée.
// Sans jeton valide → accès refusé (même si Access était mal configuré).
//
// Variables nécessaires (dans Cloudflare Pages → Settings → Variables) :
//   ACCESS_TEAM_DOMAIN  ex. "aurore.cloudflareaccess.com"
//   ACCESS_AUD          le "Application Audience (AUD) Tag" de l'application Access
//   ADMIN_EMAILS        ton/tes adresses autorisées, séparées par des virgules

let certCache = { domain: null, keys: null, fetchedAt: 0 };

function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlToJson(str) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(str)));
}

async function getKeys(teamDomain) {
  const now = Date.now();
  if (certCache.domain === teamDomain && certCache.keys && now - certCache.fetchedAt < 60 * 60 * 1000) {
    return certCache.keys;
  }
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('certs');
  const data = await res.json();
  certCache = { domain: teamDomain, keys: data.keys || [], fetchedAt: now };
  return certCache.keys;
}

function normalizeDomain(value) {
  return String(value || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

async function verifyAccessJwt(token, env) {
  const teamDomain = normalizeDomain(env.ACCESS_TEAM_DOMAIN);
  const aud = String(env.ACCESS_AUD || '').trim();
  if (!teamDomain || !aud) return null; // configuration absente → refus

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const header = b64urlToJson(parts[0]);
  const payload = b64urlToJson(parts[1]);
  if (header.alg !== 'RS256') return null;

  const keys = await getKeys(teamDomain);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audList.includes(aud)) return null;
  if (payload.iss !== `https://${teamDomain}`) return null;
  if (typeof payload.exp !== 'number' || payload.exp < now) return null;
  if (typeof payload.nbf === 'number' && payload.nbf > now + 60) return null;

  const allowed = String(env.ADMIN_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const email = String(payload.email || '').toLowerCase();
  if (allowed.length === 0 || !allowed.includes(email)) return null;

  return { email };
}

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

/**
 * Renvoie { email } si la requête vient bien de l'administratrice, sinon null.
 */
export async function requireAdmin(request, env) {
  // Mode test LOCAL uniquement (jamais actif en ligne : limité à localhost).
  const url = new URL(request.url);
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (isLocal && env.ADMIN_DEV_BYPASS === 'true') return { email: 'local-dev' };

  const token = request.headers.get('Cf-Access-Jwt-Assertion') || getCookie(request, 'CF_Authorization');
  if (!token) return null;
  try {
    return await verifyAccessJwt(token, env);
  } catch {
    return null;
  }
}
