import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAnswers, normalizeEmail } from '../functions/_lib/validate.js';
import { MAIN_QUESTIONS, EXTRA_QUESTIONS, QUESTIONS } from '../public/js/questions.js';
import { toCsv } from '../functions/_lib/csv.js';

const MAIN = MAIN_QUESTIONS.map((q) => q.id);
const EXTRA = EXTRA_QUESTIONS.map((q) => q.id);

test('identifiants de questions et d’options uniques', () => {
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (const q of QUESTIONS) {
    const opts = q.parts ? q.parts.flatMap((p) => p.options.map((o) => p.id + o.id)) : (q.options || []).map((o) => o.id);
    assert.equal(new Set(opts).size, opts.length, q.id);
  }
  assert.equal(MAIN.length, 20);
  assert.equal(EXTRA.length, 5);
});
test('réponses valides acceptées, questions passées ignorées', () => {
  const r = validateAnswers({ q1: { selected: ['compare', 'other'], other: '  un mot  ' }, q2: { selected: [] }, q17: { selected: ['m5_10'] } }, MAIN);
  assert.deepEqual(r, { q1: { selected: ['compare', 'other'], other: 'un mot' }, q17: { selected: ['m5_10'] } });
});
test('limites, exclusivité, Q14 dynamique', () => {
  assert.throws(() => validateAnswers({ q12: { selected: ['love_self', 'confidence', 'value', 'choose_self', 'take_place', 'joy'] } }, MAIN));
  assert.throws(() => validateAnswers({ q16: { selected: ['nothing', 'time'] } }, MAIN));
  assert.throws(() => validateAnswers({ q17: { selected: ['m5_10', 'lt5'] } }, MAIN));
  assert.throws(() => validateAnswers({ q13: { selected: ['joy'] }, q14: { selected: ['grief'] } }, MAIN));
  assert.ok(validateAnswers({ q14: { selected: ['grief'] } }, MAIN).q14); // Q13 passée → liste complète
  assert.throws(() => validateAnswers({ q1: { selected: ['inconnue'] } }, MAIN));
  assert.throws(() => validateAnswers({ q20: { text: 'x'.repeat(1501) } }, MAIN));
  assert.throws(() => validateAnswers({ q24: { selected: ['hybrid'] } }, MAIN));
});
test('budget en deux parties indépendantes', () => {
  assert.deepEqual(validateAnswers({ q25: { monthly: 'lt10' } }, EXTRA), { q25: { monthly: 'lt10' } });
  assert.throws(() => validateAnswers({ q25: { monthly: 'lt15' } }, EXTRA));
});
test('emails', () => {
  assert.equal(normalizeEmail(' Aurore@Exemple.FR '), 'aurore@exemple.fr');
  assert.throws(() => normalizeEmail('pas-un-mail'));
});
test('CSV protégé contre les formules', () => {
  const csv = toCsv(['a'], [['=1+1'], ['+33 6'], ['@SUM'], ['texte; avec "guillemets"']]);
  assert.ok(csv.startsWith('﻿'));
  assert.ok(csv.includes("'=1+1") && csv.includes("'+33 6") && csv.includes("'@SUM"));
  assert.ok(csv.includes('"texte; avec ""guillemets"""'));
});

test('Q17 : anciennes réponses refusées à l’envoi mais conservées dans les statistiques', async () => {
  const { computeQuestionStats } = await import('../functions/_lib/stats.js');
  assert.throws(() => validateAnswers({ q17: { selected: ['m6_10'] } }, MAIN));
  const rows = [
    { main: { q17: { selected: ['m6_10'] } }, extra: {}, extra_status: 'not_started' },
    { main: { q17: { selected: ['m5_10'] } }, extra: {}, extra_status: 'not_started' },
  ];
  const q17 = computeQuestionStats(rows).find((q) => q.id === 'q17');
  assert.equal(q17.respondents, 2);
  assert.equal(q17.options.find((o) => o.id === 'm6_10').count, 1);
  assert.equal(q17.options.find((o) => o.id === 'm5_10').count, 1);
  assert.ok(!q17.options.some((o) => o.id === 'm3_5')); // ancienne option jamais choisie : masquée
});
