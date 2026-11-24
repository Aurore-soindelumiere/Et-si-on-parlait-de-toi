// GET /api/admin/overview — vue d'ensemble (protégé par le middleware).
import { loadResponses, computeOverview } from '../../_lib/stats.js';
import { json, error, logError } from '../../_lib/http.js';

export async function onRequestGet({ env }) {
  try {
    const rows = await loadResponses(env);
    const w = await env.DB.prepare("SELECT COUNT(*) AS n FROM waitlist WHERE status = 'active'").first();
    return json({ ok: true, overview: computeOverview(rows, w ? w.n : 0) });
  } catch (err) {
    logError('admin/overview', err);
    return error(500, 'server');
  }
}
