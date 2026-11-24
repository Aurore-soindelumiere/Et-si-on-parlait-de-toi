// Validation stricte des réponses reçues par le serveur.
// Tout ce qui ne correspond pas exactement au questionnaire est refusé.

import { LIMITS, getQuestion, isShown } from '../../public/js/questions.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const ID_RE = /^[a-z0-9_]{1,40}$/;

function cleanText(value, max) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new ValidationError('Texte invalide');
  // Supprime les caractères de contrôle (sauf retours à la ligne / tabulations)
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (cleaned.length > max) throw new ValidationError('Texte trop long');
  return cleaned;
}

/** Options visibles pour une question (gère la question 14, qui dépend de la 13). */
function allowedOptionIds(question, answers, legacy) {
  if (question.source) {
    const src = answers[question.source];
    if (src && Array.isArray(src.selected) && src.selected.length > 0) return new Set(src.selected);
  }
  const opts = legacy ? [...question.options, ...(question.legacyOptions || [])] : question.options;
  return new Set(opts.map((o) => o.id));
}

function validateChoice(question, raw, answers, legacy) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new ValidationError('Format invalide');
  const selected = raw.selected;
  if (!Array.isArray(selected)) throw new ValidationError('Format invalide');
  if (selected.length === 0) return null; // question passée

  const allowed = allowedOptionIds(question, answers, legacy);
  const unique = [...new Set(selected)];
  if (unique.length !== selected.length) throw new ValidationError('Doublon');
  for (const id of unique) {
    if (typeof id !== 'string' || !ID_RE.test(id) || !allowed.has(id)) throw new ValidationError('Option inconnue');
  }

  if (question.type === 'single' && unique.length !== 1) throw new ValidationError('Une seule réponse');
  if (question.max && unique.length > question.max) throw new ValidationError('Trop de réponses');

  const exclusiveIds = question.options.filter((o) => o.exclusive).map((o) => o.id);
  if (unique.length > 1 && unique.some((id) => exclusiveIds.includes(id))) {
    throw new ValidationError('Réponse exclusive combinée');
  }

  const result = { selected: unique };
  const hasOther = question.options.some((o) => o.other) && unique.includes('other');
  if (hasOther) {
    const other = cleanText(raw.other, LIMITS.otherText);
    if (other) result.other = other;
  }
  return result;
}

function validateBudget(question, raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new ValidationError('Format invalide');
  const result = {};
  for (const part of question.parts) {
    const value = raw[part.id];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value !== 'string' || !part.options.some((o) => o.id === value)) throw new ValidationError('Budget invalide');
    result[part.id] = value;
  }
  return Object.keys(result).length ? result : null;
}

/**
 * Valide un ensemble de réponses pour une liste d'identifiants de questions autorisées.
 * @returns {object} réponses nettoyées (questions passées = absentes)
 */
export function validateAnswers(rawAnswers, allowedQuestionIds, { legacy = false } = {}) {
  if (typeof rawAnswers !== 'object' || rawAnswers === null || Array.isArray(rawAnswers)) {
    throw new ValidationError('Réponses invalides');
  }
  for (const key of Object.keys(rawAnswers)) {
    if (!allowedQuestionIds.includes(key)) throw new ValidationError('Question inconnue');
  }
  const clean = {};
  // Ordre important : la question 13 doit être validée avant la 14.
  for (const qid of allowedQuestionIds) {
    const raw = rawAnswers[qid];
    if (raw === undefined || raw === null) continue;
    const question = getQuestion(qid);
    // Question d'approfondissement non concernée : réponse ignorée (version actuelle).
    if (!legacy && !isShown(question, clean)) continue;
    let value = null;
    if (question.type === 'multi' || question.type === 'single') value = validateChoice(question, raw, clean, legacy);
    else if (question.type === 'text') {
      if (typeof raw !== 'object' || Array.isArray(raw)) throw new ValidationError('Format invalide');
      const text = cleanText(raw.text, question.maxLength || LIMITS.freeText);
      value = text ? { text } : null;
    } else if (question.type === 'budget') value = validateBudget(question, raw);
    if (value) clean[qid] = value;
  }
  return clean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;

export function validateIdAndToken(id, token) {
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new ValidationError('Identifiant invalide');
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) throw new ValidationError('Jeton invalide');
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function normalizeEmail(email) {
  if (typeof email !== 'string') throw new ValidationError('Adresse invalide');
  const e = email.trim().toLowerCase();
  if (e.length < 6 || e.length > 254 || !EMAIL_RE.test(e)) throw new ValidationError('Adresse invalide');
  return e;
}
