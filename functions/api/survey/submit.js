// POST /api/survey/submit — enregistre le questionnaire principal (questions 1 à 20).
// Idempotent : si la même participante renvoie (même identifiant + même jeton),
// on ne crée pas de doublon et on confirme simplement l'enregistrement.

import { MAIN_QUESTIONS } from '../../../public/js/questions.js';
import { validateAnswers, validateIdAndToken, ValidationError } from '../../_lib/validate.js';
import { json, error, readJson, sameOrigin, logError, sha256Hex, safeEqual } from '../../_lib/http.js';

const MAIN_IDS = MAIN_QUESTIONS.map((q) => q.id);
const VERSION_RE = /^[A-Za-z0-9._-]{1,30}$/;

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error(403, 'origin');
  const body = await readJson(request);
  if (!body) return error(400, 'invalid');

  // Champ piège invisible : rempli uniquement par les robots.
  if (body.website) return json({ ok: true });

  let answers;
  try {
    validateIdAndToken(body.id, body.token);
    if (typeof body.version !== 'string' || !VERSION_RE.test(body.version)) throw new ValidationError('version');
    answers = validateAnswers(body.answers, MAIN_IDS);
  } catch (err) {
    if (err instanceof ValidationError) return error(400, 'invalid');
    throw err;
  }

  try {
    const tokenHash = await sha256Hex(body.token);
    const now = new Date().toISOString();
    const result = await env.DB.prepare(
      `INSERT INTO survey_responses
        (id, edit_token_hash, created_at, updated_at, survey_version, main_answers,
         free_text, top_priorities, absolute_priority, extra_status)
       VALUES (?1, ?2, ?3, ?3, ?4, ?5, ?6, ?7, ?8, 'not_started')
       ON CONFLICT(id) DO NOTHING`,
    ).bind(
      body.id,
      tokenHash,
      now,
      body.version,
      JSON.stringify(answers),
      answers.q20 ? answers.q20.text : null,
      answers.q13 ? JSON.stringify(answers.q13.selected) : null,
      answers.q14 ? answers.q14.selected[0] : null,
    ).run();

    if (!result.meta || result.meta.changes === 0) {
      // Déjà enregistré (nouvel essai après une coupure réseau, par exemple).
      const row = await env.DB.prepare('SELECT edit_token_hash FROM survey_responses WHERE id = ?1')
        .bind(body.id).first();
      if (!row || !safeEqual(row.edit_token_hash, tokenHash)) return error(409, 'conflict');
    }
    return json({ ok: true });
  } catch (err) {
    logError('survey/submit', err);
    return error(500, 'server');
  }
}
