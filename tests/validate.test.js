import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAnswers, normalizeEmail } from '../functions/_lib/validate.js';
import { MAIN_QUESTIONS, EXTRA_QUESTIONS, QUESTIONS } from '../public/js/questions.js';
import { toCsv } from '../functions/_lib/csv.js';

const MAIN = MAIN_QUESTIONS.map((q) => q.id);
const LEGACY_EXTRA = ['q21', 'q22', 'q23', 'q24', 'q25'];

test('identifiants de questions et d’options uniques', () => {
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (const q of QUESTIONS) {
    const opts = q.parts ? q.parts.flatMap((p) => p.options.map((o) => p.id + o.id)) : [...(q.options || []), ...(q.legacyOptions || [])].map((o) => o.id);
    assert.equal(new Set(opts).size, opts.length, q.id);
  }
  assert.equal(MAIN.length, 23); // dont 4 approfondissements conditionnels
  assert.equal(EXTRA_QUESTIONS.length, 0);
  assert.ok(!MAIN.includes('q8') && !MAIN.includes('q12') && !MAIN.includes('q19'));
});
test('réponses valides acceptées, questions passées ignorées', () => {
  const r = validateAnswers({ q1: { selected: ['compare', 'other'], other: '  un mot  ' }, q2: { selected: [] }, q17: { selected: ['m5_10'] } }, MAIN);
  assert.deepEqual(r, { q1: { selected: ['compare', 'other'], other: 'un mot' }, q17: { selected: ['m5_10'] } });
});
test('limites, exclusivité, Q14 dynamique', () => {
  assert.throws(() => validateAnswers({ q4: { selected: ['autopilot', 'stagnate', 'transition', 'lost_joy'] } }, MAIN));
  assert.throws(() => validateAnswers({ q12: { selected: ['joy'] } }, MAIN)); // question retirée
  assert.throws(() => validateAnswers({ q16: { selected: ['nothing', 'time'] } }, MAIN));
  assert.throws(() => validateAnswers({ q17: { selected: ['m5_10', 'lt5'] } }, MAIN));
  assert.throws(() => validateAnswers({ q13: { selected: ['joy'] }, q14: { selected: ['grief'] } }, MAIN));
  assert.ok(validateAnswers({ q14: { selected: ['grief'] } }, MAIN).q14); // Q13 passée → liste complète
  assert.throws(() => validateAnswers({ q1: { selected: ['inconnue'] } }, MAIN));
  assert.throws(() => validateAnswers({ q20: { text: 'x'.repeat(1501) } }, MAIN));
  assert.ok(validateAnswers({ q24: { selected: ['hybrid'] } }, MAIN).q24); // désormais dans le parcours principal
});
test('budget en deux parties indépendantes', () => {
  assert.deepEqual(validateAnswers({ q25: { monthly: 'lt10' } }, MAIN), { q25: { monthly: 'lt10' } });
  assert.throws(() => validateAnswers({ q25: { monthly: 'lt15' } }, MAIN));
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

test('approfondissements : gardés seulement si la thématique est choisie', () => {
  const r = validateAnswers({
    q13: { selected: ['money', 'joy'] },
    q9: { selected: ['fear_lack'] },      // argent choisi → gardé
    q10: { selected: ['accept'] },        // corps non choisi → ignoré
    q11: { selected: ['grounded'] },      // intuition non choisie → ignorée
  }, MAIN);
  assert.ok(r.q9);
  assert.equal(r.q10, undefined);
  assert.equal(r.q11, undefined);
  const r2 = validateAnswers({ q13: { selected: ['hypersensitivity'] }, q11: { selected: ['grounded'] } }, MAIN);
  assert.ok(r2.q11);
});

test('anciennes versions : anciennes questions et réponses acceptées', () => {
  const LEGACY_MAIN = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20'];
  const r = validateAnswers({ q8: { selected: ['trust'] }, q5: { selected: ['judged'] }, q19: { selected: ['notes'] }, q10: { selected: ['accept'] } }, LEGACY_MAIN, { legacy: true });
  assert.ok(r.q8 && r.q5 && r.q19 && r.q10);
  assert.throws(() => validateAnswers({ q5: { selected: ['judged'] } }, MAIN)); // refusé en version actuelle
  assert.ok(validateAnswers({ q23: { selected: ['favorites', 'journal'] } }, LEGACY_EXTRA, { legacy: true }).q23);
});
