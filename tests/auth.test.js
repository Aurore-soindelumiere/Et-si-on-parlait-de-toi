// Vérifie que l'espace admin refuse tout jeton Cloudflare Access invalide.
import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../functions/_lib/auth.js';

const TEAM = 'exemple.cloudflareaccess.com';
const AUD = 'aud-tag-123';
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: 'aurore@exemple.fr' };

const { privateKey, publicKey } = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true, ['sign', 'verify'],
);
const jwk = { ...(await crypto.subtle.exportKey('jwk', publicKey)), kid: 'k1' };
globalThis.fetch = async (url) => {
  assert.equal(url, `https://${TEAM}/cdn-cgi/access/certs`);
  return new Response(JSON.stringify({ keys: [jwk] }));
};

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
async function makeJwt(payload, key = privateKey, kid = 'k1') {
  const head = b64({ alg: 'RS256', kid, typ: 'JWT' });
  const body = b64(payload);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${Buffer.from(sig).toString('base64url')}`;
}
const now = Math.floor(Date.now() / 1000);
const good = { aud: [AUD], iss: `https://${TEAM}`, exp: now + 600, iat: now, email: 'Aurore@exemple.fr' };
const req = (token, host = 'monsite.pages.dev') => new Request(`https://${host}/api/admin/stats`, token ? { headers: { 'Cf-Access-Jwt-Assertion': token } } : {});

test('jeton valide accepté', async () => {
  assert.deepEqual(await requireAdmin(req(await makeJwt(good)), env), { email: 'aurore@exemple.fr' });
});
test('sans jeton : refus', async () => {
  assert.equal(await requireAdmin(req(null), env), null);
});
test('mauvaise audience : refus', async () => {
  assert.equal(await requireAdmin(req(await makeJwt({ ...good, aud: ['autre'] })), env), null);
});
test('jeton expiré : refus', async () => {
  assert.equal(await requireAdmin(req(await makeJwt({ ...good, exp: now - 10 })), env), null);
});
test('adresse non autorisée : refus', async () => {
  assert.equal(await requireAdmin(req(await makeJwt({ ...good, email: 'pirate@exemple.fr' })), env), null);
});
test('signature falsifiée : refus', async () => {
  const other = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign']);
  assert.equal(await requireAdmin(req(await makeJwt(good, other.privateKey)), env), null);
});
test('configuration absente : refus', async () => {
  assert.equal(await requireAdmin(req(await makeJwt(good)), {}), null);
});
test('mode test local ignoré en ligne', async () => {
  assert.equal(await requireAdmin(req(null), { ...env, ADMIN_DEV_BYPASS: 'true' }), null);
  assert.ok(await requireAdmin(req(null, 'localhost:8788'), { ...env, ADMIN_DEV_BYPASS: 'true' }));
});
