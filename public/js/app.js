// =====================================================================
//  ET SI ON PARLAIT DE TOI ? — Application publique
// =====================================================================

import {
  SURVEY_VERSION, ESTIMATED_DURATION, LIMITS, CHAPTERS, MAIN_QUESTIONS, EXTRA_QUESTIONS,
  getQuestion, getChapter, WAITLIST_CONSENT_TEXT,
} from './questions.js';

const STORAGE_KEY = 'esopdt-progress';
const TECH_ERROR = 'Un petit souci technique est survenu. Tes réponses sont toujours là. Tu peux réessayer de les envoyer.';
const TOTAL_MAIN = MAIN_QUESTIONS.length;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

// ---------- Icônes ----------
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 7 5 11.4 12 12-7 .6-11.4 5-12 12-.6-7-5-11.4-12-12 7-.6 11.4-5 12-12z"/></svg>';
const MOON = `<svg class="ornament moon" viewBox="0 0 92 60" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">
  <path d="M52 8a22 22 0 1 0 0 44 18 18 0 1 1 0-44z" fill="rgba(230,199,154,.18)"/>
  <path fill="currentColor" stroke="none" d="M74 14c.3 3.4 2.4 5.5 5.8 5.8-3.4.3-5.5 2.4-5.8 5.8-.3-3.4-2.4-5.5-5.8-5.8 3.4-.3 5.5-2.4 5.8-5.8zM16 36c.2 2.3 1.6 3.7 3.9 3.9-2.3.2-3.7 1.6-3.9 3.9-.2-2.3-1.6-3.7-3.9-3.9 2.3-.2 3.7-1.6 3.9-3.9zM82 40c.15 1.6 1.1 2.6 2.7 2.7-1.6.15-2.6 1.1-2.7 2.7-.15-1.6-1.1-2.6-2.7-2.7 1.6-.15 2.6-1.1 2.7-2.7z"/>
</svg>`;
const SPRIG = `<svg class="ornament sprig" viewBox="0 0 120 34" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
  <path d="M8 26C30 24 52 18 72 12s30-6 40-4"/>
  <path d="M26 24.5c-3-5-1.5-9 3-11 1 4.5-.2 8.4-3 11zM26 24.5c4.5 1 8.5-.6 10.5-4.5-4.4-.8-8.2.6-10.5 4.5z" fill="rgba(230,199,154,.25)"/>
  <path d="M48 19c-2.6-5.4-.6-9.4 4-11 .6 4.8-1 8.6-4 11zM48 19c4.6.6 8.4-1.4 10-5.4-4.6-.4-8.2 1.4-10 5.4z" fill="rgba(230,199,154,.25)"/>
  <path d="M70 12.5c-1.8-5.6.6-9.4 5.3-10.5.2 4.8-1.7 8.4-5.3 10.5zM70 12.5c4.6 0 8.2-2.4 9.4-6.6-4.7 0-8 2.4-9.4 6.6z" fill="rgba(230,199,154,.25)"/>
  <circle cx="113" cy="8" r="1.6" fill="currentColor"/>
</svg>`;
const ARROW_LEFT = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 3 5 8l5 5"/></svg>';

// ---------- Sauvegarde locale (protégée : certains navigateurs la bloquent) ----------
function storageGet() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.v === SURVEY_VERSION ? data : null;
  } catch { return null; }
}
function storageSet(data) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignoré */ }
}
function storageClear() {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignoré */ }
}

// ---------- État ----------
function freshState() {
  return { v: SURVEY_VERSION, phase: 'welcome', step: 0, answers: {}, id: null, token: null, extraStep: 0, extraAnswers: {} };
}
let state = freshState();
const saved = storageGet();

function persist() {
  if (state.phase === 'main') {
    storageSet({ v: state.v, phase: 'main', step: state.step, answers: state.answers, id: state.id, token: state.token });
  } else if (state.phase === 'extra-intro' || state.phase === 'extra') {
    // Le questionnaire principal est enregistré : on ne garde plus ses réponses sur l'appareil.
    storageSet({ v: state.v, phase: state.phase, id: state.id, token: state.token, extraStep: state.extraStep, extraAnswers: state.extraAnswers });
  } else {
    storageClear();
  }
}

// Parcours principal : écrans de chapitre + questions
const MAIN_FLOW = [];
for (const q of MAIN_QUESTIONS) {
  const prev = MAIN_FLOW.length ? MAIN_FLOW[MAIN_FLOW.length - 1] : null;
  const prevChapter = prev ? (prev.kind === 'chapter' ? prev.chapter : getQuestion(prev.id).chapter) : null;
  if (q.chapter !== prevChapter) MAIN_FLOW.push({ kind: 'chapter', chapter: q.chapter });
  MAIN_FLOW.push({ kind: 'question', id: q.id });
}

// ---------- Utilitaires ----------
const app = document.getElementById('app');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function postJson(url, data) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: ctrl.signal,
      credentials: 'same-origin',
    });
    let body = null;
    try { body = await res.json(); } catch { /* ignoré */ }
    return { ok: res.ok && body && body.ok === true, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: null };
  } finally {
    clearTimeout(timer);
  }
}

let transitioning = false;
function show(html, after) {
  const swap = () => {
    app.innerHTML = `<div class="screen">${html}</div>`;
    app.classList.remove('leaving');
    window.scrollTo(0, 0);
    const focusTarget = app.querySelector('[data-focus]');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    if (after) after();
    transitioning = false;
  };
  if (reduceMotion || !app.firstElementChild) { swap(); return; }
  transitioning = true;
  app.classList.add('leaving');
  setTimeout(swap, 170);
}

function divider() { return `<div class="divider" aria-hidden="true">${STAR}</div>`; }

// ---------- Ciel étoilé ----------
(function sky() {
  const el = document.getElementById('sky');
  const spots = [[6, 8, 9], [91, 12, 7], [14, 46, 6], [88, 52, 10], [4, 82, 8], [94, 86, 6], [50, 3, 6], [72, 96, 7]];
  el.innerHTML = spots.map(([x, y, s], i) =>
    `<span class="s" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${i * 0.9}s">${STAR}</span>`).join('');
  document.querySelectorAll('.corner').forEach((c) => { c.innerHTML = STAR; });
})();

// =====================================================================
//  ÉCRAN D'ACCUEIL
// =====================================================================
function renderWelcome() {
  const canResume = saved && (saved.phase === 'main' || saved.phase === 'extra-intro' || saved.phase === 'extra');
  const resumeLabel = saved && saved.phase !== 'main'
    ? 'Tes réponses principales sont bien enregistrées. Tu peux reprendre là où tu t’étais arrêtée.'
    : 'Tu avais commencé ta parenthèse. Tes réponses t’attendent sur cet appareil.';

  show(`
    <p class="eyebrow">Les coulisses de 2027</p>
    ${MOON}
    <h1 class="title-main" tabindex="-1" data-focus>Et si on parlait de toi&nbsp;?</h1>
    <p class="subtitle">Et si tes mots m’aidaient à écrire la suite&nbsp;?</p>
    ${divider()}
    <div class="letter">
      <p>2027 se prépare doucement dans les coulisses, et j’ai envie que tu en fasses partie, à ta manière.</p>
      <p>J’ai des idées, des envies, des projets. Mais avant de leur donner vie, j’aimerais prendre le temps de comprendre ce dont tu as réellement besoin.</p>
      <p class="soft">Pas ce que tu devrais ressentir.</p>
      <p class="soft">Pas ce que les autres attendent de toi.</p>
      <p class="soft" style="margin-bottom:1em">Mais ce que tu aimerais profondément voir changer à l’intérieur de toi.</p>
      <p>Alors, pendant quelques minutes, j’aimerais que tu penses uniquement à toi.</p>
      <p>Réponds avec tes ressentis, sans chercher les bonnes réponses. Il n’y en a pas.</p>
      <p>Merci de m’aider à construire la suite. 🤎</p>
      <p class="signature">Avec toute ma douceur,<span class="name">Aurore</span></p>
    </div>
    ${canResume ? `
      <div class="resume-box">
        <p>${resumeLabel}</p>
        <button class="btn btn-primary btn-block" data-action="resume">Reprendre ma parenthèse</button>
        <button class="btn-link" data-action="restart">Recommencer et effacer mes réponses</button>
      </div>` : `
      <div class="cta">
        <button class="btn btn-primary btn-block" data-action="start">Je prends ce moment pour moi</button>
      </div>`}
    <p class="duration">${esc(ESTIMATED_DURATION)}</p>
    <p class="reassure">Sans inscription<span class="dot">•</span>Réponses sans nom ni adresse mail<span class="dot">•</span>À ton rythme</p>
    <p class="footer-link"><a href="/confidentialite.html">Confidentialité et utilisation de tes réponses</a></p>
  `, () => {
    app.querySelector('[data-action="start"]')?.addEventListener('click', () => {
      state = freshState();
      state.phase = 'main';
      persist();
      renderMain();
    });
    app.querySelector('[data-action="resume"]')?.addEventListener('click', () => {
      state = { ...freshState(), ...saved };
      if (state.phase === 'main') renderMain();
      else if (state.phase === 'extra-intro') renderExtraIntro();
      else renderExtra();
    });
    app.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
      if (!window.confirm('Effacer les réponses enregistrées sur cet appareil et recommencer depuis le début ?')) return;
      storageClear();
      state = freshState();
      state.phase = 'main';
      persist();
      renderMain();
    });
  });
}

// =====================================================================
//  PARCOURS PRINCIPAL
// =====================================================================
function renderMain() {
  state.step = Math.max(0, Math.min(state.step, MAIN_FLOW.length - 1));
  persist();
  const item = MAIN_FLOW[state.step];
  if (item.kind === 'chapter') { renderChapter(item.chapter); return; }
  const isLast = state.step === MAIN_FLOW.length - 1;
  renderQuestion(getQuestion(item.id), state.answers, {
    // Dernière question (Q20) : bouton de validation et envoi au serveur.
    nextLabel: isLast ? 'Valider mes réponses' : null,
    onBack: () => { state.step--; renderMain(); },
    onNext: (btn) => {
      if (isLast) { submitMain(btn); return; }
      state.step++; renderMain();
    },
    onChange: () => persist(),
  });
}

function renderChapter(chapterId) {
  const ch = getChapter(chapterId);
  show(`
    ${SPRIG}
    <div class="chapter-screen">
      <p class="chapter-num">Chapitre ${ROMAN[ch.number]}</p>
      <h2 class="chapter-title" tabindex="-1" data-focus>${esc(ch.title)}</h2>
      ${divider()}
      <div class="chapter-intro">${ch.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <div class="spacer"></div>
    <nav class="q-nav">
      <button class="btn-link back" data-action="back">${ARROW_LEFT}Retour</button>
      <button class="btn btn-primary" data-action="next">Continuer</button>
    </nav>
  `, () => {
    app.querySelector('[data-action="next"]').addEventListener('click', () => { state.step++; renderMain(); });
    app.querySelector('[data-action="back"]').addEventListener('click', () => {
      if (state.step === 0) { renderWelcome(); return; }
      state.step--; renderMain();
    });
  });
}

// ---------- Logique des réponses ----------
function getSelected(answers, qid) {
  const a = answers[qid];
  return a && Array.isArray(a.selected) ? a.selected : [];
}

/** Options visibles (question 14 dynamique, question 22 adaptée). */
function visibleOptions(q, answers) {
  if (q.source) {
    const src = getSelected(answers, q.source);
    if (src.length) {
      const srcAnswer = answers[q.source] || {};
      return q.options.filter((o) => src.includes(o.id)).map((o) =>
        (o.other && srcAnswer.other ? { ...o, label: `Autre : ${srcAnswer.other}` } : { ...o, other: false }));
    }
    return q.options.map((o) => ({ ...o, other: false }));
  }
  const adapt = activeAdapt(q, answers);
  if (adapt && adapt.hideOptions) return q.options.filter((o) => !adapt.hideOptions.includes(o.id));
  return q.options;
}

function activeAdapt(q, answers) {
  if (!q.adapt) return null;
  const sel = getSelected(answers, q.adapt.when.question);
  return sel.some((id) => q.adapt.when.anyOf.includes(id)) ? q.adapt : null;
}

function hasAnswer(q, answers) {
  const a = answers[q.id];
  if (!a) return false;
  if (q.type === 'text') return !!(a.text && a.text.trim());
  if (q.type === 'budget') return !!(a.monthly || a.purchase);
  return Array.isArray(a.selected) && a.selected.length > 0;
}

/** Garde la question 14 cohérente avec la question 13. */
function syncDependents(answers) {
  const q14 = MAIN_QUESTIONS.find((q) => q.source);
  if (!q14) return;
  const src = getSelected(answers, q14.source);
  const cur = getSelected(answers, q14.id);
  if (cur.length && src.length && !src.includes(cur[0])) delete answers[q14.id];
}

function prepareQuestion(q, answers) {
  // Q14 : présélection si une seule thématique choisie à la Q13.
  if (q.source) {
    const src = getSelected(answers, q.source);
    if (src.length === 1 && !hasAnswer(q, answers)) answers[q.id] = { selected: [src[0]] };
  }
  // Q22 : retire une option masquée éventuellement cochée.
  const adapt = activeAdapt(q, answers);
  if (adapt && adapt.hideOptions && answers[q.id]) {
    answers[q.id].selected = getSelected(answers, q.id).filter((id) => !adapt.hideOptions.includes(id));
  }
}

// =====================================================================
//  ÉCRAN DE QUESTION (commun au parcours principal et complémentaire)
// =====================================================================
function renderQuestion(q, answers, opts) {
  prepareQuestion(q, answers);
  const isExtra = q.chapter === 'extra';
  const ch = getChapter(q.chapter);
  const adapt = activeAdapt(q, answers);
  const title = adapt ? adapt.title : q.title;
  let hint = adapt ? adapt.hint : q.hint;
  const src = q.source ? getSelected(answers, q.source) : [];
  const note = q.source ? (src.length ? q.note : q.noteWhenSkipped) : q.note;

  let total; let index;
  if (isExtra) { total = EXTRA_QUESTIONS.length; index = EXTRA_QUESTIONS.indexOf(q) + 1; }
  else { total = TOTAL_MAIN; index = q.number; }
  const progress = isExtra ? (index - 1) / total : (index - 1) / total;
  const chapLabel = isExtra ? ch.title : `Chapitre ${ch.number} · ${ch.title}`;
  const countLabel = isExtra ? `Bonus ${index} / ${total}` : `Question ${index} / ${total}`;

  let body = '';
  if (q.type === 'text') {
    const value = (answers[q.id] && answers[q.id].text) || '';
    body = `
      <div class="free-text">
        <label class="sr-only" for="free">${esc(title)}</label>
        <textarea id="free" maxlength="${q.maxLength}" placeholder="${esc(q.placeholder)}" rows="7">${esc(value)}</textarea>
        <div class="field-help"><span></span><span data-count>${value.length} / ${q.maxLength}</span></div>
      </div>`;
    hint = '';
  } else if (q.type === 'budget') {
    const val = answers[q.id] || {};
    body = q.parts.map((part, i) => `
      <div class="part">
        <h3 class="part-title" id="part-${part.id}"><span class="letter-tag">${i === 0 ? 'A.' : 'B.'}</span> ${esc(part.title)}</h3>
        <div class="options" role="radiogroup" aria-labelledby="part-${part.id}">
          ${part.options.map((o) => optionHtml(o, 'single', val[part.id] === o.id, `data-part="${part.id}"`)).join('')}
        </div>
      </div>`).join('');
  } else {
    const sel = getSelected(answers, q.id);
    const options = visibleOptions(q, answers);
    const otherText = (answers[q.id] && answers[q.id].other) || '';
    body = `<div class="options" role="${q.type === 'single' ? 'radiogroup' : 'group'}" aria-labelledby="q-title">
      ${options.map((o) => optionHtml(o, q.type, sel.includes(o.id)) + (o.other ? `
        <div class="other-field ${sel.includes(o.id) ? 'open' : ''}">
          <label class="sr-only" for="other-${q.id}">Précise si tu le souhaites</label>
          <textarea id="other-${q.id}" maxlength="${LIMITS.otherText}" rows="2" placeholder="Si tu le souhaites, dis-m’en un peu plus…">${esc(otherText)}</textarea>
          <div class="field-help"><span>Sans nom ni détail permettant de t’identifier.</span><span data-other-count>${otherText.length} / ${LIMITS.otherText}</span></div>
        </div>` : '')).join('')}
    </div>`;
  }

  const lead = q.lead ? `<div class="q-lead">${q.lead.map((l) => `<p>${esc(l)}</p>`).join('')}</div>` : '';
  const counter = q.max ? `<span class="counter" data-counter aria-live="polite"></span>` : '';

  show(`
    <header class="q-head">
      <div class="progress" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${index - 1}">
        <div class="progress-fill" style="width:${(progress * 100).toFixed(1)}%"></div>
        <span class="progress-star" style="left:${(progress * 100).toFixed(1)}%">${STAR}</span>
      </div>
      <div class="q-meta"><span class="chap">${esc(chapLabel)}</span><span class="count">${countLabel}</span></div>
    </header>
    <h2 class="q-title" id="q-title" tabindex="-1" data-focus>${esc(title)}</h2>
    ${lead}
    ${note ? `<p class="q-note">${esc(note)}</p>` : ''}
    ${hint || counter ? `<p class="q-hint"><span>${esc(hint || '')}</span>${counter}</p>` : ''}
    ${q.max ? '<p class="gentle" data-gentle aria-live="polite"></p>' : ''}
    ${body}
    <div data-alert></div>
    <div class="spacer"></div>
    <nav class="q-nav">
      <button class="btn-link back" data-action="back">${ARROW_LEFT}Retour</button>
      <button class="btn btn-primary" data-action="next"></button>
    </nav>
  `, () => bindQuestion(q, answers, opts));
}

function optionHtml(o, type, on, extra = '') {
  const role = type === 'single' ? `role="radio" aria-checked="${on}"` : `aria-pressed="${on}"`;
  return `<button type="button" class="opt ${type} ${on ? 'is-on' : ''} ${o.exclusive ? 'exclusive' : ''}" data-id="${esc(o.id)}" ${role} ${extra}>
    <span class="opt-mark" aria-hidden="true">${STAR}</span><span class="opt-label">${esc(o.label)}</span>
  </button>`;
}

function bindQuestion(q, answers, opts) {
  const nextBtn = app.querySelector('[data-action="next"]');
  const backBtn = app.querySelector('[data-action="back"]');
  const counter = app.querySelector('[data-counter]');
  const gentle = app.querySelector('[data-gentle]');
  let gentleTimer = null;

  const refresh = () => {
    const answered = hasAnswer(q, answers);
    if (opts.nextLabel) nextBtn.textContent = opts.nextLabel;
    else nextBtn.textContent = answered ? 'Continuer' : 'Passer cette question';
    if (q.type === 'multi' || q.type === 'single') {
      const sel = getSelected(answers, q.id);
      app.querySelectorAll('.opt').forEach((btn) => {
        const on = sel.includes(btn.dataset.id);
        btn.classList.toggle('is-on', on);
        btn.setAttribute(q.type === 'single' ? 'aria-checked' : 'aria-pressed', String(on));
        btn.classList.toggle('is-muted', !!q.max && sel.length >= q.max && !on);
      });
      const otherField = app.querySelector('.other-field');
      if (otherField) otherField.classList.toggle('open', sel.includes('other'));
      if (counter) {
        counter.textContent = `${sel.length} / ${q.max} choisie${sel.length > 1 ? 's' : ''}`;
        counter.classList.toggle('full', sel.length >= q.max);
      }
    }
    if (q.type === 'budget') {
      const val = answers[q.id] || {};
      app.querySelectorAll('.opt').forEach((btn) => {
        const on = val[btn.dataset.part] === btn.dataset.id;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-checked', String(on));
      });
    }
  };

  const sayGently = (msg) => {
    if (!gentle) return;
    gentle.textContent = msg;
    clearTimeout(gentleTimer);
    gentleTimer = setTimeout(() => { gentle.textContent = ''; }, 4000);
  };

  app.querySelectorAll('.opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (q.type === 'budget') {
        const val = { ...(answers[q.id] || {}) };
        const part = btn.dataset.part;
        if (val[part] === id) delete val[part]; else val[part] = id;
        if (Object.keys(val).length) answers[q.id] = val; else delete answers[q.id];
      } else if (q.type === 'single') {
        const cur = getSelected(answers, q.id);
        if (cur[0] === id) delete answers[q.id];
        else answers[q.id] = { selected: [id] };
      } else {
        const prev = answers[q.id] || { selected: [] };
        let sel = [...prev.selected];
        const option = q.options.find((o) => o.id === id);
        if (sel.includes(id)) {
          sel = sel.filter((x) => x !== id);
        } else if (option.exclusive) {
          sel = [id];
        } else {
          const exclusives = q.options.filter((o) => o.exclusive).map((o) => o.id);
          sel = sel.filter((x) => !exclusives.includes(x));
          if (q.max && sel.length >= q.max) {
            sayGently(`Tu as déjà choisi ${q.max} réponses. Retire-en une pour en choisir une autre.`);
            return;
          }
          sel.push(id);
        }
        if (sel.length) {
          answers[q.id] = { selected: sel };
          if (sel.includes('other') && prev.other) answers[q.id].other = prev.other;
        } else delete answers[q.id];
        if (q.id === 'q13') syncDependents(answers);
        if (sel.includes('other') && id === 'other') {
          setTimeout(() => app.querySelector('.other-field textarea')?.focus({ preventScroll: true }), 60);
        }
      }
      refresh();
      opts.onChange();
    });
  });

  const otherArea = app.querySelector('.other-field textarea');
  if (otherArea) {
    const count = app.querySelector('[data-other-count]');
    otherArea.addEventListener('input', () => {
      const v = otherArea.value.slice(0, LIMITS.otherText);
      if (answers[q.id]) {
        if (v.trim()) answers[q.id].other = v; else delete answers[q.id].other;
      }
      count.textContent = `${v.length} / ${LIMITS.otherText}`;
      opts.onChange();
    });
  }

  const free = app.querySelector('#free');
  if (free) {
    const count = app.querySelector('[data-count]');
    free.addEventListener('input', () => {
      const v = free.value.slice(0, q.maxLength);
      if (v.trim()) answers[q.id] = { text: v }; else delete answers[q.id];
      count.textContent = `${v.length} / ${q.maxLength}`;
      refresh();
      opts.onChange();
    });
  }

  nextBtn.addEventListener('click', () => { if (!transitioning) opts.onNext(nextBtn); });
  backBtn.addEventListener('click', () => { if (!transitioning) opts.onBack(); });
  refresh();
  if (opts.afterBind) opts.afterBind(nextBtn);
}

function cleanAnswers(answers) {
  const out = {};
  for (const [qid, a] of Object.entries(answers)) {
    const q = getQuestion(qid);
    if (!q || !hasAnswer(q, answers)) continue;
    if (q.type === 'text') out[qid] = { text: a.text.trim() };
    else if (q.type === 'budget') out[qid] = { ...a };
    else {
      const item = { selected: [...a.selected] };
      if (a.selected.includes('other') && a.other && a.other.trim() && !q.source) item.other = a.other.trim();
      out[qid] = item;
    }
  }
  return out;
}

function showAlert(message, actions = '') {
  const box = app.querySelector('[data-alert]');
  if (!box) return;
  box.innerHTML = `<div class="alert" role="alert"><p>${esc(message)}</p>${actions}</div>`;
  box.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
}

let submitting = false;
async function submitMain(btn) {
  if (submitting) return;
  submitting = true;
  // Identifiant et jeton créés UNE fois, puis réutilisés à chaque nouvel essai (pas de doublon).
  if (!state.id || !state.token) { state.id = uuid(); state.token = randomToken(); }
  persist();
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  app.querySelector('[data-alert]').innerHTML = '';

  const payload = { id: state.id, token: state.token, version: SURVEY_VERSION, answers: cleanAnswers(state.answers) };
  let res = await postJson('/api/survey/submit', payload);
  if (!res.ok && res.status === 409) {
    // Identifiant déjà pris par une autre participante (extrêmement rare) : on en génère un nouveau.
    state.id = uuid(); state.token = randomToken(); persist();
    res = await postJson('/api/survey/submit', { ...payload, id: state.id, token: state.token });
  }
  submitting = false;

  if (res.ok) {
    state.answers = {};
    state.phase = 'extra-intro';
    persist();
    renderExtraIntro();
    return;
  }
  btn.disabled = false;
  btn.textContent = 'Réessayer l’envoi';
  showAlert(TECH_ERROR);
}

// =====================================================================
//  CHAPITRE COMPLÉMENTAIRE
// =====================================================================
function renderExtraIntro() {
  state.phase = 'extra-intro';
  persist();
  const ch = getChapter('extra');
  show(`
    ${SPRIG}
    <div class="chapter-screen">
      <p class="chapter-num">Tes réponses sont bien enregistrées 🤎</p>
      <h2 class="chapter-title" tabindex="-1" data-focus>${esc(ch.title)}</h2>
      ${divider()}
      <div class="chapter-intro">${ch.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="cta" style="display:flex;flex-direction:column;gap:12px">
        <button class="btn btn-primary btn-block" data-action="continue">Je continue</button>
        <button class="btn btn-outline btn-block" data-action="stop">Je préfère terminer ici</button>
      </div>
    </div>
  `, () => {
    app.querySelector('[data-action="continue"]').addEventListener('click', () => {
      state.phase = 'extra';
      state.extraStep = 0;
      persist();
      renderExtra();
    });
    app.querySelector('[data-action="stop"]').addEventListener('click', () => {
      // On le signale au serveur sans bloquer la participante.
      fetch('/api/survey/extra', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ id: state.id, token: state.token, status: 'declined' }),
      }).catch(() => {});
      finish();
    });
  });
}

function renderExtra() {
  state.phase = 'extra';
  state.extraStep = Math.max(0, Math.min(state.extraStep, EXTRA_QUESTIONS.length - 1));
  persist();
  const q = EXTRA_QUESTIONS[state.extraStep];
  const isLast = state.extraStep === EXTRA_QUESTIONS.length - 1;
  renderQuestion(q, state.extraAnswers, {
    nextLabel: isLast ? 'Terminer ma parenthèse' : null,
    onBack: () => {
      if (state.extraStep === 0) { renderExtraIntro(); return; }
      state.extraStep--; renderExtra();
    },
    onNext: (btn) => {
      if (isLast) { submitExtra(btn); return; }
      state.extraStep++; renderExtra();
    },
    onChange: () => persist(),
  });
}

async function submitExtra(btn) {
  if (submitting) return;
  submitting = true;
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  app.querySelector('[data-alert]').innerHTML = '';
  const res = await postJson('/api/survey/extra', {
    id: state.id, token: state.token, status: 'completed', answers: cleanAnswers(state.extraAnswers),
  });
  submitting = false;
  if (res.ok) { finish(); return; }
  btn.disabled = false;
  btn.textContent = 'Réessayer l’envoi';
  showAlert(TECH_ERROR, '<button class="btn-link" data-action="skip-extra">Terminer sans envoyer ces dernières réponses</button>');
  app.querySelector('[data-action="skip-extra"]')?.addEventListener('click', finish);
}

// =====================================================================
//  REMERCIEMENTS + LISTE D'ATTENTE
// =====================================================================
function finish() {
  state = freshState();
  state.phase = 'thanks';
  storageClear();
  renderThanks();
}

function renderThanks() {
  const stars = [[50, 8, 22, 0.2], [30, 40, 12, 0.7], [70, 34, 14, 1.1], [18, 70, 8, 1.6], [82, 72, 9, 1.9], [42, 78, 7, 2.3], [60, 82, 8, 2.6]];
  show(`
    <div class="thanks">
      <div class="glow-wrap" aria-hidden="true">
        <span class="glow"></span>
        ${stars.map(([x, y, s, d]) => `<span class="st" style="left:calc(${x}% - ${s / 2}px);top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s">${STAR}</span>`).join('')}
      </div>
      <h1 tabindex="-1" data-focus>Merci de m’avoir confié un petit bout de toi.</h1>
      ${divider()}
      <div class="letter">
        <p>Derrière chacune de tes réponses, il y a une histoire, des ressentis, des envies et peut-être des choses que tu portes depuis bien longtemps.</p>
        <p>J’espère que ces quelques minutes t’auront aussi permis de réaliser ce dont tu as besoin, toi.</p>
        <p class="soft" style="margin-bottom:1em">Parce qu’on prend tellement rarement le temps de se poser cette question.</p>
        <p>Tes réponses vont m’aider à donner vie à certaines des idées qui grandissent dans ma tête pour 2027.</p>
        <p>Je ne peux pas encore tout te dévoiler, mais j’ai vraiment hâte de te partager la suite.</p>
        <p>Merci de faire partie de cette aventure. 🤎</p>
        <p class="signature">Avec toute ma douceur,<span class="name">Aurore</span></p>
      </div>

      <section class="waitlist" aria-labelledby="wl-title">
        <div data-wl>
          <h2 id="wl-title">Une petite place dans les coulisses&nbsp;?</h2>
          ${divider()}
          <p class="wl-intro">Tu es curieuse de découvrir ce qui se prépare ?</p>
          <p class="wl-intro">Si tu souhaites faire partie des premières personnes à découvrir ce nouveau projet lorsqu’il prendra vie, tu peux me laisser ton adresse mail.</p>
          <p class="wl-intro" style="font-style:italic">Aucune obligation. Juste une petite place dans les coulisses de ce qui se prépare pour 2027.</p>
          <form novalidate data-wl-form>
            <label class="field-label" for="wl-email">Ton adresse mail</label>
            <input id="wl-email" type="email" name="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="prenom@exemple.fr" required>
            <div class="hp" aria-hidden="true"><label>Ne pas remplir <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
            <label class="consent">
              <input type="checkbox" name="consent" required>
              <span>${esc(WAITLIST_CONSENT_TEXT)}</span>
            </label>
            <button class="btn btn-primary btn-block" type="submit">Je veux découvrir la suite</button>
            <p class="form-msg" data-wl-msg aria-live="polite"></p>
          </form>
        </div>
      </section>
      <p class="footer-link"><a href="/confidentialite.html">Confidentialité et utilisation de tes réponses</a></p>
    </div>
  `, bindWaitlist);
}

function bindWaitlist() {
  const form = app.querySelector('[data-wl-form]');
  const msg = app.querySelector('[data-wl-msg]');
  let sending = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const email = form.email.value.trim();
    msg.textContent = '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = 'Il semble manquer quelque chose à ton adresse mail.'; form.email.focus(); return; }
    if (!form.consent.checked) { msg.textContent = 'Pour te garder une place, j’ai besoin de ton accord en cochant la case.'; return; }
    sending = true;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    const res = await postJson('/api/waitlist', { email, consent: true, website: form.website.value });
    sending = false;
    if (res.ok) {
      app.querySelector('[data-wl]').innerHTML = `
        <div class="wl-done" role="status">
          <h3 tabindex="-1">Te voilà dans les coulisses&nbsp;!</h3>
          ${divider()}
          <p>Je viendrai te retrouver dans ta boîte mail lorsque le moment sera venu de te dévoiler la suite.</p>
          <p>Merci pour ta confiance. 🤎</p>
        </div>`;
      app.querySelector('.wl-done h3').focus({ preventScroll: true });
      return;
    }
    btn.disabled = false;
    btn.textContent = 'Je veux découvrir la suite';
    msg.textContent = res.body && res.body.error === 'email'
      ? 'Il semble manquer quelque chose à ton adresse mail.'
      : 'Un petit souci technique est survenu. Tu peux réessayer dans un instant.';
  });
}

// ---------- Démarrage ----------
renderWelcome();
