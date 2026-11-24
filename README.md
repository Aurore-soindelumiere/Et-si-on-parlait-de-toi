# Et si on parlait de toi ?

*Et si tes mots m’aidaient à écrire la suite ?*

Mini-application de questionnaire introspectif (19 à 23 questions selon les réponses, environ 10 minutes), pensée pour le navigateur d’Instagram, avec un espace administrateur privé.

👉 **Pour la mise en ligne, suis le guide pas à pas : [`docs/GUIDE.md`](docs/GUIDE.md).**

## Organisation des fichiers

```
public/                      ← ce que voient les participantes (HTML, CSS, JS, polices)
  index.html                 ← l’application
  confidentialite.html       ← page de confidentialité (passages [À COMPLÉTER])
  js/questions.js            ← TOUT le contenu du questionnaire (textes + identifiants stables)
  js/app.js                  ← fonctionnement des écrans
  css/style.css              ← direction artistique
  admin/                     ← ton espace privé (protégé)
functions/                   ← fonctions serveur (Cloudflare Pages Functions)
  _middleware.js             ← verrou de l’espace admin + en-têtes de sécurité
  api/survey/submit.js       ← enregistrement du questionnaire
  api/survey/extra.js        ← ancien chapitre facultatif (versions 2027-v1/v2 uniquement)
  api/waitlist.js            ← liste d’attente (table séparée)
  api/admin/*                ← statistiques, textes, liste d’attente, exports CSV
  _lib/                      ← validation, authentification, statistiques, CSV
migrations/0001_init.sql     ← création de la base D1
tests/                       ← tests automatiques
wrangler.toml                ← configuration Cloudflare (ID de la base D1)
```

## Variables d’environnement (Cloudflare Pages → Paramètres → Variables, type **Secret**)

À enregistrer comme *secrets* : avec un `wrangler.toml` présent, les variables texte du tableau de bord sont écrasées au déploiement.

| Nom | Exemple | Rôle |
|---|---|---|
| `ACCESS_TEAM_DOMAIN` | `aurore.cloudflareaccess.com` | domaine de ton équipe Cloudflare Access |
| `ACCESS_AUD` | `4f8a…` | « Application Audience Tag » de l’application Access |
| `ADMIN_EMAILS` | `toi@exemple.fr` | adresse(s) autorisée(s) dans l’admin |

Aucun secret n’est nécessaire dans le code ni dans GitHub. Liaison base de données : `DB` (définie dans `wrangler.toml`).

## Pour une développeuse / un développeur

```bash
npm install
cp .dev.vars.example .dev.vars        # active l’admin en local (localhost uniquement)
npm run db:local                      # crée la base locale
npm run dev                           # http://localhost:8788  —  admin : /admin/
npm test                              # tests (validation, auth Access, CSV)
```

Choix techniques : HTML/CSS/JS sans framework ni étape de build ; polices auto-hébergées (aucun appel à Google) ; aucun traceur ; réponses stockées en JSON avec identifiants stables ; idempotence par identifiant + jeton générés côté appareil (seule l’empreinte SHA-256 du jeton est stockée) ; aucune IP enregistrée ; journaux sans contenu de réponse.
