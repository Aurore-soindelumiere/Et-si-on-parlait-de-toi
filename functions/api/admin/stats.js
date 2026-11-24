// GET /api/admin/stats — statistiques agrégées de toutes les questions.
import { loadResponses, computeQuestionStats } from '../../_lib/stats.js';
import { json, error, logError } from '../../_lib/http.js';

export async function onRequestGet({ env }) {
  try {
    const rows = await loadResponses(env);
    const questions = computeQuestionStats(rows);
    return json({
      ok: true,
      total: rows.length,
      extraCompleted: rows.filter((r) => r.extra_status === 'completed').length,
      questions,
    });
  } catch (err) {
    logError('admin/stats', err);
    return error(500, 'server');
  }
}
