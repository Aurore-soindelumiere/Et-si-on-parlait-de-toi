// GET  /api/admin/texts — toutes les réponses libres (question 20 + champs « Autre »).
// POST /api/admin/texts — supprime UN texte libre (ex. information personnelle donnée par erreur).
//      corps : { responseId, questionId }
import { loadResponses, collectTexts } from '../../_lib/stats.js';
import { getQuestion } from '../../../public/js/questions.js';
import { json, error, readJson, sameOrigin, logError } from '../../_lib/http.js';

export async function onRequestGet({ env }) {
  try {
    const rows = await loadResponses(env);
    return json({ ok: true, texts: collectTexts(rows) });
  } catch (err) {
    logError('admin/texts', err);
    return error(500, 'server');
  }
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error(403, 'origin');
  const body = await readJson(request);
  if (!body || typeof body.responseId !== 'string' || typeof body.questionId !== 'string') return error(400, 'invalid');
  const q = getQuestion(body.questionId);
  if (!q) return error(400, 'invalid');
  try {
    const row = await env.DB.prepare('SELECT main_answers, extra_answers FROM survey_responses WHERE id = ?1')
      .bind(body.responseId).first();
    if (!row) return error(404, 'not_found');
    const isExtra = q.chapter === 'extra';
    const answers = JSON.parse((isExtra ? row.extra_answers : row.main_answers) || '{}');
    const a = answers[q.id];
    if (!a) return json({ ok: true });
    if (q.type === 'text') delete answers[q.id];
    else delete a.other;
    const now = new Date().toISOString();
    if (isExtra) {
      await env.DB.prepare('UPDATE survey_responses SET extra_answers = ?2, updated_at = ?3 WHERE id = ?1')
        .bind(body.responseId, JSON.stringify(answers), now).run();
    } else {
      await env.DB.prepare(
        `UPDATE survey_responses SET main_answers = ?2, updated_at = ?3,
           free_text = CASE WHEN ?4 = 'q20' THEN NULL ELSE free_text END
         WHERE id = ?1`,
      ).bind(body.responseId, JSON.stringify(answers), now, q.id).run();
    }
    return json({ ok: true });
  } catch (err) {
    logError('admin/texts/delete', err);
    return error(500, 'server');
  }
}
