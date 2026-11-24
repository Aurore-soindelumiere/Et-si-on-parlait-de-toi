// Petits utilitaires HTTP communs aux fonctions serveur.

const MAX_BODY = 32 * 1024; // 32 Ko : largement suffisant pour un questionnaire

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function error(status, code) {
  return json({ ok: false, error: code }, status);
}

/** Refuse les requêtes envoyées depuis un autre site (protection basique anti-abus). */
export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // certains navigateurs intégrés n'envoient pas l'en-tête
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

/** Lit le corps JSON en limitant sa taille. Renvoie null si invalide. */
export async function readJson(request) {
  const type = request.headers.get('Content-Type') || '';
  if (!type.toLowerCase().includes('application/json')) return null;
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    const data = JSON.parse(text);
    return typeof data === 'object' && data !== null && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/** Journalisation SANS aucune donnée personnelle ni contenu de réponse. */
export function logError(where, err) {
  console.error(`[${where}] ${err && err.name ? err.name : 'Error'}`);
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Comparaison à temps constant de deux chaînes hexadécimales. */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
