// Espace administrateur — lecture seule des statistiques + suppression ponctuelle.
// Toutes les données viennent d'API protégées côté serveur (Cloudflare Access).

import { getQuestion } from '/js/questions.js';

const view = document.getElementById('view');
const cache = {};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtPct = (p) => `${String(p).replace('.', ',')} %`;
const fmtDate = (iso) => new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' });

async function api(path, options = {}) {
  const res = await fetch(path, { credentials: 'same-origin', ...options });
  if (res.status === 403 || res.status === 401) throw new Error('auth');
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.ok) throw new Error('server');
  return data;
}
async function post(path, body) {
  return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
async function load(key, path, force) {
  if (!cache[key] || force) cache[key] = await api(path);
  return cache[key];
}

function errorBox(err) {
  return `<p class="error">${err.message === 'auth'
    ? 'Accès refusé. Reconnecte-toi via Cloudflare Access (recharge la page).'
    : 'Impossible de charger les données pour le moment. Réessaie dans un instant.'}</p>`;
}

// ---------- Composants ----------
function bars(options, { rank = false } = {}) {
  const max = Math.max(1, ...options.map((o) => o.count));
  return `<div class="bars">${options.map((o, i) => `
    <div class="bar-row ${o.count === 0 ? 'zero' : ''} ${o.exclusive ? 'excl' : ''}" title="${esc(o.label)} : ${o.count} (${fmtPct(o.percent)})">
      <span class="lab">${rank ? `<span class="rank">${i + 1}.</span>` : ''}${esc(o.label)}</span>
      <span class="val"><b>${o.count}</b> · ${fmtPct(o.percent)}</span>
      <span class="track"><span class="fill" style="width:${(o.count / max) * 100}%"></span></span>
    </div>`).join('')}</div>`;
}

function questionCard(s, note = '') {
  const label = s.id.startsWith('q25_') ? `Question 25 ${s.id.endsWith('monthly') ? 'A' : 'B'}` : `Question ${s.number}`;
  const base = s.chapter === 'extra' ? 'ayant complété le chapitre facultatif' : 'au total';
  const limits = s.max ? ` · ${s.max} réponses max.` : '';
  if (s.type === 'text') {
    return `<div class="card"><p class="eyebrow">${label}</p><h3>${esc(s.title)}</h3>
      <p class="meta">${s.respondents} réponse(s) écrite(s) · ${s.skipped} question(s) passée(s) sur ${s.base} ${base}.
      Les textes sont dans la rubrique « Les mots ».</p></div>`;
  }
  return `<div class="card">
    <p class="eyebrow">${label}</p>
    <h3>${esc(s.title)}</h3>
    <p class="meta"><b>${s.respondents}</b> personne(s) ont répondu · <b>${s.skipped}</b> ont passé la question (sur ${s.base} ${base})${limits}${s.otherTexts ? ` · ${s.otherTexts} précision(s) « Autre »` : ''}
    ${s.type === 'multi' ? '<br>Plusieurs choix possibles : les pourcentages (calculés sur les répondantes) peuvent dépasser 100 % au total.' : ''}${note}</p>
    ${s.respondents ? bars(s.options) : '<p class="muted">Pas encore de réponse.</p>'}
  </div>`;
}

// ---------- Rubriques ----------
const TABS = {
  async overview(force) {
    const { overview: o } = await load('overview', '/api/admin/overview', force);
    const max = Math.max(1, ...o.daily.map((d) => d.count));
    const short = (d) => d.slice(8, 10) + '/' + d.slice(5, 7);
    return `
      <h2 class="section-title">Vue d’ensemble</h2>
      <div class="tiles">
        <div class="tile"><div class="n">${o.total}</div><div class="l">questionnaires enregistrés</div></div>
        <div class="tile"><div class="n">${o.extraCompleted}</div><div class="l">avec chapitre complémentaire</div></div>
        <div class="tile"><div class="n">${o.waitlist}</div><div class="l">inscriptions liste d’attente</div></div>
        <div class="tile"><div class="n">${o.today}</div><div class="l">réponses aujourd’hui</div></div>
        <div class="tile"><div class="n">${o.last7days}</div><div class="l">réponses ces 7 derniers jours</div></div>
      </div>
      <div class="card">
        <h3>Réponses par jour (30 derniers jours)</h3>
        <div class="daily" role="img" aria-label="Nombre de réponses par jour sur les 30 derniers jours">
          ${o.daily.map((d) => `<span class="d" style="height:${(d.count / max) * 100}%" title="${short(d.day)} : ${d.count} réponse(s)"></span>`).join('')}
        </div>
        <div class="daily-axis"><span>${short(o.daily[0].day)}</span><span>${short(o.daily[o.daily.length - 1].day)}</span></div>
        <details style="margin-top:12px"><summary class="muted">Voir le tableau</summary>
          <div class="table-scroll"><table><thead><tr><th>Jour</th><th class="num">Réponses</th></tr></thead><tbody>
          ${o.daily.filter((d) => d.count).map((d) => `<tr><td>${short(d.day)}</td><td class="num">${d.count}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">Aucune réponse sur la période.</td></tr>'}
          </tbody></table></div>
        </details>
      </div>
      <p class="note">${o.extraDeclined} participante(s) ont préféré s’arrêter avant le chapitre complémentaire.</p>`;
  },

  async priorities(force) {
    const data = await load('stats', '/api/admin/stats', force);
    const a = data.questions.find((q) => q.id === 'q13');
    const b = data.questions.find((q) => q.id === 'q14');
    const bById = Object.fromEntries(b.options.map((o) => [o.id, o]));
    const compare = a.options.filter((o) => o.count > 0).map((o) => {
      const bo = bById[o.id] || { count: 0, percent: 0 };
      return { ...o, bCount: bo.count, bPct: bo.percent, conv: o.count ? Math.round((bo.count / o.count) * 100) : 0 };
    });
    return `
      <h2 class="section-title">Les univers prioritaires</h2>
      <p class="note">Classement A = « populaire » (dans les 3 priorités). Classement B = « vraiment prioritaire » (LE besoin n°1). Les deux ne sont jamais mélangés.</p>
      <div class="grid2">
        <div class="card"><p class="eyebrow">Classement A · Question 13</p><h3>Les trois besoins prioritaires</h3>
          <p class="meta">${a.respondents} participante(s) ont répondu · % = part des répondantes ayant sélectionné la thématique.</p>
          ${a.respondents ? bars(a.options, { rank: true }) : '<p class="muted">Pas encore de réponse.</p>'}</div>
        <div class="card"><p class="eyebrow">Classement B · Question 14</p><h3>Le besoin prioritaire absolu</h3>
          <p class="meta">${b.respondents} participante(s) ont répondu · % = part des répondantes l’ayant choisie comme priorité n°1.</p>
          ${b.respondents ? bars(b.options, { rank: true }) : '<p class="muted">Pas encore de réponse.</p>'}</div>
      </div>
      <div class="card"><h3>Populaire ou vraiment prioritaire ?</h3>
        <p class="meta">« Taux de priorité » : parmi les personnes qui ont mis la thématique dans leurs 3 priorités, combien en ont fait LA priorité absolue. Un taux élevé signale un besoin profond.</p>
        <div class="table-scroll"><table><thead><tr><th>Thématique</th><th class="num">A · sélections</th><th class="num">A · %</th><th class="num">B · priorité n°1</th><th class="num">B · %</th><th class="num">Taux de priorité</th></tr></thead>
        <tbody>${compare.map((o) => `<tr><td>${esc(o.label)}</td><td class="num">${o.count}</td><td class="num">${fmtPct(o.percent)}</td><td class="num">${o.bCount}</td><td class="num">${fmtPct(o.bPct)}</td><td class="num">${o.conv} %</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Pas encore de données.</td></tr>'}</tbody></table></div>
      </div>`;
  },

  async all(force) {
    const data = await load('stats', '/api/admin/stats', force);
    return `<h2 class="section-title">Toutes les réponses</h2>
      <p class="note">${data.total} questionnaire(s) · ${data.extraCompleted} avec chapitre complémentaire. « Passée » = la participante n’a rien sélectionné (différent d’une réponse négative comme « Aucune de ces phrases », affichée en italique).</p>
      ${data.questions.map((s) => questionCard(s)).join('')}`;
  },

  async texts(force) {
    const data = await load('texts', '/api/admin/texts', force);
    const qids = [...new Set(data.texts.map((t) => t.questionId))];
    return `<h2 class="section-title">Les mots de ma communauté</h2>
      <p class="note">${data.texts.length} texte(s). Si un texte contient une information personnelle (nom, coordonnées, détail identifiant), supprime-le.</p>
      <div class="filters">
        <select id="f-q"><option value="">Toutes les questions</option>${qids.map((id) => `<option value="${id}">Question ${getQuestion(id)?.number ?? id}</option>`).join('')}</select>
        <input id="f-s" type="search" placeholder="Rechercher un mot…">
        <a class="btn-ghost" href="/api/admin/export/textes.csv" download>Exporter les textes (CSV)</a>
      </div>
      <div id="texts-list">${renderTexts(data.texts)}</div>`;
  },

  async formats(force) {
    const data = await load('stats', '/api/admin/stats', force);
    const pick = (id) => data.questions.find((q) => q.id === id);
    const groups = [
      ['Les durées préférées', 'q17'], ['Les moments de la journée', 'q18'],
      ['Les habitudes d’écoute', 'q21'], ['Les attentes envers les audios', 'q22'],
      ['Ce qu’elles attendent d’un moment pour soi', 'q15'], ['Les freins du quotidien', 'q16'],
      ['Les fonctionnalités souhaitées', 'q23'], ['Parcours guidés ou utilisation libre', 'q19'],
    ];
    return `<h2 class="section-title">Les formats préférés</h2>
      ${groups.map(([t, id]) => `<p class="eyebrow" style="margin-top:22px">${t}</p>${questionCard(pick(id), id === 'q22' ? '<br>Les personnes n’ayant jamais utilisé d’audios ont vu une formulation adaptée (« Qu’est-ce qui pourrait te donner envie… »).' : '')}`).join('')}`;
  },

  async business(force) {
    const data = await load('stats', '/api/admin/stats', force);
    const q24 = data.questions.find((q) => q.id === 'q24');
    const by = Object.fromEntries(q24.options.map((o) => [o.id, o]));
    const tile = (id, l) => `<div class="tile"><div class="n">${by[id].count}</div><div class="l">${l}<br><b>${fmtPct(by[id].percent)}</b></div></div>`;
    return `<h2 class="section-title">Le futur modèle économique</h2>
      <p class="note">⚠️ Ce sont des intentions déclarées, pas des prévisions de ventes.</p>
      <div class="tiles">
        ${tile('buy_themes', 'achat individuel')}${tile('monthly', 'abonnement mensuel')}${tile('yearly', 'abonnement annuel')}
        ${tile('hybrid', 'modèle hybride')}${tile('free_first', 'découvrir gratuitement d’abord')}${tile('no_pay', 'ne souhaitent pas payer')}
      </div>
      ${questionCard(q24)}
      ${questionCard(data.questions.find((q) => q.id === 'q25_monthly'))}
      ${questionCard(data.questions.find((q) => q.id === 'q25_purchase'))}`;
  },

  async waitlist(force) {
    const data = await load('waitlist', '/api/admin/waitlist', force);
    const active = data.entries.filter((e) => e.status === 'active').length;
    return `<h2 class="section-title">Liste d’attente</h2>
      <p class="note">${active} inscription(s) active(s) · ${data.entries.length} au total. Ces adresses ne sont reliées à aucune réponse.</p>
      <p><a class="btn" href="/api/admin/export/liste-attente.csv" download>Exporter ma liste d’attente</a></p>
      <div class="card table-scroll"><table>
        <thead><tr><th>Adresse mail</th><th>Inscription</th><th>Consentement</th><th>Statut</th><th></th></tr></thead>
        <tbody>${data.entries.map((e) => `<tr>
          <td>${esc(e.email)}</td><td>${fmtDate(e.created_at)}</td>
          <td>${fmtDate(e.consent_at)}<br><span class="muted" style="font-size:12px">${esc(e.consent_version)}</span></td>
          <td><span class="pill ${e.status === 'active' ? '' : 'off'}">${e.status === 'active' ? 'inscrite' : 'désinscrite'}</span></td>
          <td><div class="row-actions">
            <button class="btn-ghost" data-wl="${e.status === 'active' ? 'unsubscribe' : 'reactivate'}" data-id="${e.id}">${e.status === 'active' ? 'Marquer désinscrite' : 'Réactiver'}</button>
            <button class="btn-danger" data-wl="delete" data-id="${e.id}">Supprimer</button>
          </div></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Aucune inscription pour le moment.</td></tr>'}</tbody>
      </table></div>`;
  },

  async exports() {
    return `<h2 class="section-title">Exports</h2>
      <p class="note">Fichiers CSV (UTF-8, séparateur « ; ») : ils s’ouvrent directement dans Excel, Numbers ou Google Sheets.</p>
      <div class="export-list">
        <div><a class="btn" href="/api/admin/export/reponses.csv" download>Exporter toutes les réponses</a><p>Une ligne par questionnaire, avec toutes les réponses et les textes libres.</p></div>
        <div><a class="btn" href="/api/admin/export/statistiques.csv" download>Exporter les statistiques</a><p>Résultats agrégés par question et par option.</p></div>
        <div><a class="btn" href="/api/admin/export/liste-attente.csv" download>Exporter ma liste d’attente</a><p>Fichier séparé : adresses mail et informations de consentement uniquement.</p></div>
        <div><a class="btn-ghost" href="/api/admin/export/textes.csv" download>Exporter uniquement les textes libres</a></div>
      </div>`;
  },
};

function renderTexts(texts) {
  if (!texts.length) return '<p class="muted">Aucun texte pour le moment.</p>';
  return texts.map((t) => `<div class="text-item">
    <div class="info">Question ${t.number}${t.kind === 'other' ? ' · « Autre »' : ''} · ${fmtDate(t.createdAt)}</div>
    <div class="t">${esc(t.text)}</div>
    <div class="row-actions">
      <button class="btn-danger" data-del-text data-r="${esc(t.responseId)}" data-q="${esc(t.questionId)}">Supprimer ce texte</button>
      <button class="btn-danger" data-del-resp data-r="${esc(t.responseId)}">Supprimer tout ce questionnaire</button>
    </div>
  </div>`).join('');
}

// ---------- Navigation ----------
let current = 'overview';
async function open(tab, force = false) {
  current = tab;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  try {
    view.innerHTML = await TABS[tab](force);
  } catch (err) {
    view.innerHTML = errorBox(err);
  }
  bindView();
}

function bindView() {
  const fq = document.getElementById('f-q');
  const fs = document.getElementById('f-s');
  if (fq && fs) {
    const apply = () => {
      const s = fs.value.trim().toLowerCase();
      const list = cache.texts.texts.filter((t) => (!fq.value || t.questionId === fq.value) && (!s || t.text.toLowerCase().includes(s)));
      document.getElementById('texts-list').innerHTML = renderTexts(list);
    };
    fq.addEventListener('change', apply);
    fs.addEventListener('input', apply);
  }
}

view.addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  try {
    if (t.hasAttribute('data-del-text')) {
      if (!confirm('Supprimer définitivement ce texte ? Les autres réponses de ce questionnaire sont conservées.')) return;
      await post('/api/admin/texts', { responseId: t.dataset.r, questionId: t.dataset.q });
      Object.keys(cache).forEach((k) => delete cache[k]);
      open('texts', true);
    } else if (t.hasAttribute('data-del-resp')) {
      if (!confirm('Supprimer définitivement TOUT ce questionnaire (toutes ses réponses) ?')) return;
      await post('/api/admin/responses', { responseId: t.dataset.r });
      Object.keys(cache).forEach((k) => delete cache[k]);
      open('texts', true);
    } else if (t.dataset.wl) {
      if (t.dataset.wl === 'delete' && !confirm('Supprimer définitivement cette adresse de la liste d’attente ?')) return;
      await post('/api/admin/waitlist', { action: t.dataset.wl, id: Number(t.dataset.id) });
      delete cache.waitlist; delete cache.overview;
      open('waitlist', true);
    }
  } catch (err) {
    alert(err.message === 'auth' ? 'Accès refusé : recharge la page pour te reconnecter.' : 'L’opération n’a pas pu aboutir. Réessaie.');
  }
});

document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => open(b.dataset.tab)));
document.getElementById('refresh').addEventListener('click', () => {
  Object.keys(cache).forEach((k) => delete cache[k]);
  open(current, true);
});
open('overview');
