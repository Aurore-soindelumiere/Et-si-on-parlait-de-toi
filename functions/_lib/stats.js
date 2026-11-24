// Calcul des statistiques à partir des questionnaires enregistrés.
// Règle : pour chaque question, le pourcentage = nombre de sélections ÷ nombre
// de personnes AYANT RÉPONDU à cette question (pas le total des sélections).

import { QUESTIONS, CHAPTERS } from '../../public/js/questions.js';

export async function loadResponses(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, survey_version, main_answers, extra_answers, extra_status, extra_completed_at
       FROM survey_responses ORDER BY created_at ASC`,
  ).all();
  return (results || []).map((r) => ({
    ...r,
    main: safeParse(r.main_answers),
    extra: safeParse(r.extra_answers),
  }));
}

function safeParse(text) {
  if (!text) return {};
  try { return JSON.parse(text) || {}; } catch { return {}; }
}

export function answersOf(row) {
  return { ...row.main, ...row.extra };
}

function pct(count, base) {
  return base > 0 ? Math.round((count / base) * 1000) / 10 : 0;
}

function choiceStats(question, rows, base, idSuffix = '', partId = null) {
  const current = partId ? question.parts.find((p) => p.id === partId).options : question.options;
  const legacy = partId ? [] : (question.legacyOptions || []);
  const allOptions = [...current, ...legacy];
  const counts = Object.fromEntries(allOptions.map((o) => [o.id, 0]));
  let respondents = 0;
  let otherTexts = 0;
  for (const row of rows) {
    const a = answersOf(row)[question.id];
    if (!a) continue;
    if (partId) {
      const v = a[partId];
      if (!v) continue;
      respondents++;
      if (v in counts) counts[v]++;
    } else {
      if (!Array.isArray(a.selected) || a.selected.length === 0) continue;
      respondents++;
      for (const id of a.selected) if (id in counts) counts[id]++;
      if (a.other) otherTexts++;
    }
  }
  const part = partId ? question.parts.find((p) => p.id === partId) : null;
  return {
    id: question.id + idSuffix,
    number: question.number,
    chapter: question.chapter,
    type: partId ? 'single' : question.type,
    title: part ? `${question.title} — ${part.title}` : question.title,
    max: question.max || null,
    base,
    respondents,
    skipped: Math.max(0, base - respondents),
    otherTexts,
    // Les anciennes options n'apparaissent que si quelqu'un les a choisies.
    options: [...current, ...legacy.filter((o) => counts[o.id] > 0)]
      .map((o) => ({
        id: o.id,
        label: o.label,
        exclusive: !!o.exclusive,
        count: counts[o.id],
        percent: pct(counts[o.id], respondents),
      }))
      .sort((a, b) => b.count - a.count),
  };
}

export function computeQuestionStats(rows) {
  const total = rows.length;
  const extraRows = rows.filter((r) => r.extra_status === 'completed');
  const out = [];
  for (const q of QUESTIONS) {
    const isExtra = q.chapter === 'extra';
    const pool = isExtra ? extraRows : rows;
    const base = pool.length;
    if (q.type === 'text') {
      const respondents = pool.filter((r) => {
        const a = answersOf(r)[q.id];
        return a && a.text;
      }).length;
      out.push({
        id: q.id, number: q.number, chapter: q.chapter, type: 'text', title: q.title,
        base, respondents, skipped: base - respondents, options: [],
      });
    } else if (q.type === 'budget') {
      for (const part of q.parts) out.push(choiceStats(q, pool, base, `_${part.id}`, part.id));
    } else {
      out.push(choiceStats(q, pool, base));
    }
  }
  return out;
}

function parisDay(iso) {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(iso));
}

export function computeOverview(rows, waitlistCount) {
  const now = Date.now();
  const today = parisDay(new Date(now).toISOString());
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const byDay = {};
  let todayCount = 0;
  let weekCount = 0;
  for (const r of rows) {
    const d = parisDay(r.created_at);
    byDay[d] = (byDay[d] || 0) + 1;
    if (d === today) todayCount++;
    if (Date.parse(r.created_at) >= weekAgo) weekCount++;
  }
  // Série des 30 derniers jours (jours sans réponse inclus).
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const d = parisDay(new Date(now - i * 24 * 3600 * 1000).toISOString());
    daily.push({ day: d, count: byDay[d] || 0 });
  }
  return {
    total: rows.length,
    extraCompleted: rows.filter((r) => r.extra_status === 'completed').length,
    extraDeclined: rows.filter((r) => r.extra_status === 'declined').length,
    waitlist: waitlistCount,
    today: todayCount,
    last7days: weekCount,
    daily,
  };
}

/** Toutes les réponses libres : question 20 + champs « Autre ». */
export function collectTexts(rows) {
  const texts = [];
  for (const row of rows) {
    const answers = answersOf(row);
    for (const q of QUESTIONS) {
      const a = answers[q.id];
      if (!a) continue;
      if (q.type === 'text' && a.text) {
        texts.push({ responseId: row.id, createdAt: row.created_at, questionId: q.id, number: q.number, kind: 'free', questionTitle: q.title, text: a.text });
      } else if (a.other) {
        texts.push({ responseId: row.id, createdAt: row.created_at, questionId: q.id, number: q.number, kind: 'other', questionTitle: q.title, text: a.other });
      }
    }
  }
  return texts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function chapterTitle(id) {
  const c = CHAPTERS.find((x) => x.id === id);
  return c ? c.title : '';
}
