// POST /api/waitlist — inscription à la liste d'attente.
// Table séparée, AUCUN lien avec les questionnaires (pas d'identifiant de questionnaire).
// Réponse identique que l'adresse soit nouvelle ou déjà inscrite (pas de fuite d'information).

import { WAITLIST_CONSENT_VERSION } from '../../public/js/questions.js';
import { normalizeEmail, ValidationError } from '../_lib/validate.js';
import { json, error, readJson, sameOrigin, logError } from '../_lib/http.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error(403, 'origin');
  const body = await readJson(request);
  if (!body) return error(400, 'invalid');
  if (body.website) return json({ ok: true });

  let email;
  try {
    if (body.consent !== true) throw new ValidationError('consent');
    email = normalizeEmail(body.email);
  } catch (err) {
    if (err instanceof ValidationError) return error(400, err.message === 'consent' ? 'consent' : 'email');
    throw err;
  }

  try {
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO waitlist (email, created_at, consent_at, consent_version, status)
       VALUES (?1, ?2, ?2, ?3, 'active')
       ON CONFLICT(email) DO UPDATE SET
         status = 'active', consent_at = excluded.consent_at, consent_version = excluded.consent_version
       WHERE waitlist.status = 'unsubscribed'`,
    ).bind(email, now, WAITLIST_CONSENT_VERSION).run();
    return json({ ok: true });
  } catch (err) {
    logError('waitlist', err);
    return error(500, 'server');
  }
}
