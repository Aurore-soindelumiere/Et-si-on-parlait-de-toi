// GET  /api/admin/waitlist — liste d'attente (jamais croisée avec les questionnaires).
// POST /api/admin/waitlist — { action: 'delete' | 'unsubscribe' | 'reactivate', id }
import { json, error, readJson, sameOrigin, logError } from '../../_lib/http.js';

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, email, created_at, consent_at, consent_version, status FROM waitlist ORDER BY created_at DESC',
    ).all();
    return json({ ok: true, entries: results || [] });
  } catch (err) {
    logError('admin/waitlist', err);
    return error(500, 'server');
  }
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error(403, 'origin');
  const body = await readJson(request);
  if (!body || !Number.isInteger(body.id)) return error(400, 'invalid');
  try {
    if (body.action === 'delete') {
      await env.DB.prepare('DELETE FROM waitlist WHERE id = ?1').bind(body.id).run();
    } else if (body.action === 'unsubscribe' || body.action === 'reactivate') {
      const status = body.action === 'unsubscribe' ? 'unsubscribed' : 'active';
      await env.DB.prepare('UPDATE waitlist SET status = ?2 WHERE id = ?1').bind(body.id, status).run();
    } else {
      return error(400, 'invalid');
    }
    return json({ ok: true });
  } catch (err) {
    logError('admin/waitlist/update', err);
    return error(500, 'server');
  }
}
