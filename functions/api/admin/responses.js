// POST /api/admin/responses — supprime entièrement un questionnaire.  corps : { responseId }
import { json, error, readJson, sameOrigin, logError } from '../../_lib/http.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error(403, 'origin');
  const body = await readJson(request);
  if (!body || typeof body.responseId !== 'string' || body.responseId.length > 64) return error(400, 'invalid');
  try {
    await env.DB.prepare('DELETE FROM survey_responses WHERE id = ?1').bind(body.responseId).run();
    return json({ ok: true });
  } catch (err) {
    logError('admin/responses/delete', err);
    return error(500, 'server');
  }
}
