// POST /api/survey/extra — complète le questionnaire existant avec le chapitre facultatif
// (questions 21 à 25), ou note que la participante a préféré s'arrêter.
// Aucun nouveau questionnaire n'est créé : on met à jour la même ligne.

import { EXTRA_QUESTIONS } from '../../../public/js/questions.js';
import { validateAnswers, validateIdAndToken, ValidationError } from '../../_lib/validate.js';
import { json, error, readJson, sameOrigin, logError, sha256Hex, safeEqual } from '../../_lib/http.js';

const EXTRA_IDS = EXTRA_QUESTIONS.map((q) => q.id);

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error(403, 'origin');
  const body = await readJson(request);
  if (!body) return error(400, 'invalid');
  if (body.website) return json({ ok: true });

  let answers = null;
  try {
    validateIdAndToken(body.id, body.token);
    if (body.status !== 'completed' && body.status !== 'declined') throw new ValidationError('status');
    if (body.status === 'completed') answers = validateAnswers(body.answers, EXTRA_IDS);
  } catch (err) {
    if (err instanceof ValidationError) return error(400, 'invalid');
    throw err;
  }

  try {
    const row = await env.DB.prepare('SELECT edit_token_hash FROM survey_responses WHERE id = ?1')
      .bind(body.id).first();
    if (!row) return error(404, 'not_found');
    const tokenHash = await sha256Hex(body.token);
    if (!safeEqual(row.edit_token_hash, tokenHash)) return error(403, 'forbidden');

    const now = new Date().toISOString();
    if (body.status === 'declined') {
      await env.DB.prepare(
        `UPDATE survey_responses SET extra_status = 'declined', updated_at = ?2
         WHERE id = ?1 AND extra_status = 'not_started'`,
      ).bind(body.id, now).run();
    } else {
      await env.DB.prepare(
        `UPDATE survey_responses
           SET extra_answers = ?2, budget_monthly = ?3, budget_purchase = ?4,
               extra_status = 'completed', extra_completed_at = COALESCE(extra_completed_at, ?5), updated_at = ?5
         WHERE id = ?1`,
      ).bind(
        body.id,
        JSON.stringify(answers),
        answers.q25 && answers.q25.monthly ? answers.q25.monthly : null,
        answers.q25 && answers.q25.purchase ? answers.q25.purchase : null,
        now,
      ).run();
    }
    return json({ ok: true });
  } catch (err) {
    logError('survey/extra', err);
    return error(500, 'server');
  }
}
