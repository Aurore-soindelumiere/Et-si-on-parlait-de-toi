// GET /api/admin/export/reponses.csv | statistiques.csv | textes.csv | liste-attente.csv
import { QUESTIONS } from '../../../../public/js/questions.js';
import { loadResponses, computeQuestionStats, answersOf, collectTexts } from '../../../_lib/stats.js';
import { toCsv, csvResponse, formatNumberFr } from '../../../_lib/csv.js';
import { error, logError } from '../../../_lib/http.js';

const STATUS_FR = { not_started: 'non commencé', declined: 'refusé', completed: 'complété' };

const hasOther = (q) => !q.source && q.options.some((o) => o.other);

/** Date lisible, heure de Paris : 2027-01-15 21:04 */
function parisDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

function labelOf(options, id) {
  const o = options.find((x) => x.id === id);
  return o ? o.label : id;
}

function responsesCsv(rows) {
  const header = ['identifiant', 'date (heure de Paris)', 'version', 'chapitre_complementaire'];
  for (const q of QUESTIONS) {
    if (q.type === 'text') header.push(`Q${q.number} (texte libre)`);
    else if (q.type === 'budget') for (const p of q.parts) header.push(`Q${q.number} ${p.id === 'monthly' ? 'A mensuel' : 'B achat'}`);
    else {
      header.push(`Q${q.number}`);
      if (hasOther(q)) header.push(`Q${q.number} autre (texte)`);
    }
  }
  const lines = rows.map((row) => {
    const a = answersOf(row);
    const line = [row.id, parisDate(row.created_at), row.survey_version, STATUS_FR[row.extra_status] || row.extra_status];
    for (const q of QUESTIONS) {
      const v = a[q.id];
      if (q.type === 'text') line.push(v ? v.text : '');
      else if (q.type === 'budget') for (const p of q.parts) line.push(v && v[p.id] ? labelOf(p.options, v[p.id]) : '');
      else {
        line.push(v ? v.selected.map((id) => labelOf([...q.options, ...(q.legacyOptions || [])], id)).join(' | ') : '');
        if (hasOther(q)) line.push(v && v.other ? v.other : '');
      }
    }
    return line;
  });
  return toCsv(header, lines);
}

function statsCsv(rows) {
  const header = ['question', 'intitule', 'option', 'libelle', 'selections', 'pourcentage', 'repondantes', 'question_passee', 'base'];
  const lines = [];
  for (const s of computeQuestionStats(rows)) {
    if (s.type === 'text') {
      lines.push([`Q${s.number}`, s.title, '', '(réponse libre)', s.respondents, '', s.respondents, s.skipped, s.base]);
      continue;
    }
    for (const o of s.options) {
      lines.push([s.id.replace(/^q/, 'Q'), s.title, o.id, o.label, o.count, formatNumberFr(o.percent), s.respondents, s.skipped, s.base]);
    }
  }
  return toCsv(header, lines);
}

export async function onRequestGet({ params, env }) {
  const date = new Date().toISOString().slice(0, 10);
  try {
    if (params.file === 'reponses.csv') {
      return csvResponse(`reponses-${date}.csv`, responsesCsv(await loadResponses(env)));
    }
    if (params.file === 'statistiques.csv') {
      return csvResponse(`statistiques-${date}.csv`, statsCsv(await loadResponses(env)));
    }
    if (params.file === 'textes.csv') {
      const texts = collectTexts(await loadResponses(env));
      const csv = toCsv(
        ['date', 'question', 'type', 'intitule', 'texte', 'identifiant_questionnaire'],
        texts.map((t) => [parisDate(t.createdAt), `Q${t.number}`, t.kind === 'other' ? 'Autre' : 'Réponse libre', t.questionTitle, t.text, t.responseId]),
      );
      return csvResponse(`textes-libres-${date}.csv`, csv);
    }
    if (params.file === 'liste-attente.csv') {
      const { results } = await env.DB.prepare(
        'SELECT email, created_at, consent_at, consent_version, status FROM waitlist ORDER BY created_at ASC',
      ).all();
      const csv = toCsv(
        ['email', 'date_inscription', 'date_consentement', 'version_consentement', 'statut'],
        (results || []).map((r) => [r.email, parisDate(r.created_at), parisDate(r.consent_at), r.consent_version, r.status === 'active' ? 'inscrite' : 'désinscrite']),
      );
      return csvResponse(`liste-attente-${date}.csv`, csv);
    }
    return error(404, 'not_found');
  } catch (err) {
    logError('admin/export', err);
    return error(500, 'server');
  }
}
