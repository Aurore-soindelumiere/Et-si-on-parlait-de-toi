# Guide de mise en ligne — « Et si on parlait de toi ? »

Ce guide est fait pour être suivi **une étape à la fois**. Chaque étape se termine par un petit point de contrôle « ✅ C’est bon si… ». Si quelque chose ne ressemble pas à ce qui est décrit, arrête-toi et demande-moi : on regarde ensemble.

Tu n’as **rien à installer sur ton ordinateur**. Tout se fait dans ton navigateur, sur GitHub et sur Cloudflare.

---

## Vue d’ensemble (pour comprendre, rien à faire)

| Élément | Rôle |
|---|---|
| **GitHub** | Range le code de l’application (ce dépôt). |
| **Cloudflare Pages** | Met l’application en ligne, gratuitement. Chaque modification sur GitHub est publiée automatiquement. |
| **Cloudflare D1** | La base de données : les questionnaires et, séparément, la liste d’attente. |
| **Cloudflare Access** | Le « portier » de ton espace privé `/admin` : il t’envoie un code par email, et seule ton adresse est acceptée. |

Tout cela reste dans l’offre **gratuite** de Cloudflare pour un questionnaire de cette taille.

---

## Étape 1 — Valider le code sur GitHub

Le code se trouve sur la branche `claude/et-si-on-parlait-de-toi-0ryepy` de ton dépôt.

1. Ouvre ton dépôt sur github.com.
2. Un bandeau jaune propose **« Compare & pull request »** pour cette branche. Clique dessus, puis sur **« Create pull request »**, puis sur **« Merge pull request »** et **« Confirm merge »**.
   *(Tu peux aussi me demander de préparer cette « pull request » pour toi.)*

✅ C’est bon si, sur la page d’accueil du dépôt (branche `main`), tu vois les dossiers `public`, `functions`, `migrations` et `docs`.

---

## Étape 2 — Créer la base de données (D1)

1. Connecte-toi sur **dash.cloudflare.com**.
2. Dans le menu de gauche : **Stockage et bases de données → D1** (en anglais : *Storage & Databases → D1 SQL Database*).
3. Clique sur **Créer** (*Create*). Nom : `et-si-on-parlait-de-toi`. Emplacement : laisse le choix automatique ou choisis l’Europe (*Western Europe*). Valide.
4. Dans ta nouvelle base, ouvre l’onglet **Console**.
5. Ouvre dans GitHub le fichier `migrations/console-cloudflare.sql` (version sur une seule ligne, prévue pour la console), copie **tout** son contenu, colle-le dans la console Cloudflare et clique sur **Exécuter** (*Execute*).
6. Sur la page de la base, repère le **Database ID** (une longue suite de lettres et chiffres, du type `a1b2c3d4-…`).

👉 **Envoie-moi ce Database ID** : je l’ajoute dans le fichier `wrangler.toml` à ta place.
*(Si tu préfères le faire toi-même : sur GitHub, ouvre `wrangler.toml`, clique sur le crayon ✏️, remplace `REMPLACER_PAR_L_ID_DE_TA_BASE_D1` par ton ID, puis « Commit changes ».)*

✅ C’est bon si, dans l’onglet **Tables** de ta base, tu vois `survey_responses` et `waitlist`.

---

## Étape 3 — Mettre l’application en ligne (Cloudflare Pages)

1. Dans Cloudflare : **Workers & Pages → Créer** (*Create*) → onglet **Pages** → **Connecter à Git** (*Connect to Git*).
2. Autorise Cloudflare à accéder à GitHub si on te le demande, puis choisis le dépôt **Et-si-on-parlait-de-toi**.
3. Réglages de la construction :
   - **Nom du projet** : `et-si-on-parlait-de-toi` (il deviendra l’adresse `et-si-on-parlait-de-toi.pages.dev`)
   - **Branche de production** : `main`
   - **Framework preset** : `None`
   - **Commande de build** : *laisser vide*
   - **Répertoire de sortie** (*Build output directory*) : `public`
4. Clique sur **Enregistrer et déployer** (*Save and Deploy*).

La base de données est reliée automatiquement grâce au fichier `wrangler.toml` (c’est pour cela que l’ID de l’étape 2 est nécessaire).

✅ C’est bon si l’adresse `https://et-si-on-parlait-de-toi.pages.dev` affiche l’écran d’accueil, et que l’adresse `…pages.dev/admin` affiche **« Accès réservé. »** (c’est normal : l’espace privé est verrouillé tant que l’étape 4 n’est pas faite).

> Tu pourras plus tard utiliser ton propre nom de domaine (ex. `parenthese.tondomaine.fr`) dans l’onglet **Domaines personnalisés** du projet. Dis-le-moi avant : il faudra adapter l’étape 4.

---

## Étape 4 — Sécuriser ton espace administrateur (Cloudflare Access)

### 4a. Activer Zero Trust (une seule fois)
1. Dans Cloudflare, menu de gauche : **Zero Trust**.
2. Choisis un **nom d’équipe** (ex. `aurore`). Ton adresse d’équipe sera `aurore.cloudflareaccess.com` — **note-la**.
3. Choisis l’offre **Free** (gratuite, jusqu’à 50 utilisatrices). Cloudflare peut demander une carte bancaire pour valider le compte : l’offre reste à 0 €.

### 4b. Créer le « portier »
1. Dans Zero Trust : **Access → Applications → Ajouter une application** → **Self-hosted**.
2. Nom : `Espace privé questionnaire`.
3. Ajoute **deux** destinations (*Public hostname*) :
   - domaine `et-si-on-parlait-de-toi.pages.dev`, chemin `admin`
   - domaine `et-si-on-parlait-de-toi.pages.dev`, chemin `api/admin`
4. Crée une **règle** (*policy*) : nom `Moi uniquement`, action **Allow**, règle **Emails** = ton adresse mail.
5. Méthode de connexion : **One-time PIN** (un code envoyé par email) suffit.
6. Enregistre. Puis ouvre l’application créée et copie son **Application Audience (AUD) Tag** (une longue suite de caractères).

### 4c. Donner ces informations à l’application
Dans **Workers & Pages → et-si-on-parlait-de-toi → Paramètres → Variables et secrets** (*Settings → Variables and Secrets*), pour l’environnement **Production**, ajoute ces 3 valeurs en choisissant le type **Secret** (important : comme le projet contient un fichier `wrangler.toml`, les simples « variables texte » ajoutées dans le tableau de bord sont effacées à chaque mise en ligne ; les secrets, eux, sont conservés) :

| Nom | Valeur |
|---|---|
| `ACCESS_TEAM_DOMAIN` | ton adresse d’équipe, ex. `aurore.cloudflareaccess.com` |
| `ACCESS_AUD` | l’AUD Tag copié à l’étape 4b |
| `ADMIN_EMAILS` | ton adresse mail (plusieurs adresses possibles, séparées par des virgules) |

Puis : onglet **Déploiements** → sur le dernier déploiement, **⋯ → Réessayer le déploiement** (*Retry deployment*) pour que les variables soient prises en compte.

✅ C’est bon si :
- en ouvrant `…pages.dev/admin`, Cloudflare te demande ton email, t’envoie un code, puis affiche ton tableau de bord ;
- dans une **fenêtre de navigation privée**, `…pages.dev/api/admin/stats` ne montre aucune donnée.

> 🔐 Double sécurité : même si le « portier » était mal réglé, le serveur vérifie lui-même la signature de Cloudflare Access **et** ton adresse mail. Sans ces trois variables, l’espace privé reste fermé à tout le monde.
> Aucune clé secrète n’est stockée dans GitHub : il n’y en a pas besoin.

---

## Étape 5 — Compléter la page de confidentialité

Le fichier `public/confidentialite.html` contient des passages **[À COMPLÉTER]** : identité, adresse, email de contact, durée de conservation de la liste d’attente, date.
Envoie-moi ces informations et je les intègre (ou modifie le fichier sur GitHub avec le crayon ✏️). Je n’ai rien inventé.

---

## Étape 6 — Tester avant de partager le lien

Fais ces vérifications depuis **ton téléphone**, idéalement en ouvrant le lien **depuis Instagram** (envoie-le-toi en message privé) :

1. Le questionnaire s’affiche bien, les textes sont lisibles, les boutons faciles à toucher.
2. Questions à plusieurs choix : la limite (« 3 / 3 choisies ») bloque gentiment au-delà.
3. « Aucune de ces peurs » décoche les autres réponses (et inversement).
4. « Autre » ouvre un petit champ de texte.
5. Ferme l’application au milieu, rouvre le lien : on te propose de **reprendre**.
6. Question 14 : seules tes 3 thématiques de la question 13 sont proposées.
7. Passe en **mode avion** juste avant « Valider mes réponses » : le message rassurant apparaît. Réactive le réseau, réessaie : ça passe, sans doublon.
8. Termine, inscris-toi à la liste d’attente avec ton adresse.
9. Dans `/admin`, vérifie que ton questionnaire et ton inscription apparaissent, puis teste les trois exports.
10. **Supprime ensuite tes réponses de test** (rubrique « Les mots » → « Supprimer tout ce questionnaire », et « Liste d’attente » → « Supprimer »). Pour repartir d’une base vide, tu peux aussi exécuter dans la console D1 : `DELETE FROM survey_responses; DELETE FROM waitlist;`

⏱️ **Durée réelle** : demande à 3 ou 4 personnes de confiance de chronométrer leur parcours. L’accueil annonce « Environ 15 minutes » : donne-moi les vrais temps et j’ajuste. Si c’est trop long, je te proposerai des allègements **avant** de supprimer des questions importantes.

---

## Étape 7 — Consulter et exporter tes résultats

Rends-toi sur `https://et-si-on-parlait-de-toi.pages.dev/admin` :

| Rubrique | Ce que tu y trouves |
|---|---|
| **Vue d’ensemble** | nombre de questionnaires, chapitres complémentaires, inscriptions, réponses du jour et des 7 derniers jours, graphique par jour |
| **Univers prioritaires** | Classement A (question 13 : les 3 priorités), Classement B (question 14 : LA priorité) et un tableau « populaire ou vraiment prioritaire ? » |
| **Toutes les réponses** | chaque question, avec le nombre de répondantes et de personnes l’ayant passée |
| **Les mots** | les réponses libres (question 20 et « Autre »), recherche, suppression d’un texte |
| **Formats préférés** | durées, moments, habitudes d’écoute, attentes, freins, fonctionnalités |
| **Modèle économique** | achat, abonnements, budgets (intentions déclarées, pas des prévisions de ventes) |
| **Liste d’attente** | adresses, dates, consentement, désinscription, suppression, export |
| **Exports** | 3 fichiers CSV (+ un export des seuls textes libres) |

Les fichiers CSV s’ouvrent directement dans Excel (double-clic), Numbers ou Google Sheets.

---

## Plus tard

- **Fin de la conservation (6 mois)** : exporte d’abord les statistiques, puis demande-moi la commande de suppression des réponses individuelles (ou exécute dans la console D1 : `DELETE FROM survey_responses WHERE created_at < '2027-07-01';` en adaptant la date).
- **Protection anti-abus renforcée (facultatif)** : dans Cloudflare → ton domaine → *Security → WAF → Rate limiting rules*, une règle gratuite peut limiter le nombre d’envois par minute sur `/api/`. Ce n’est utile que si tu constates des envois anormaux.
- **Modifier un texte du questionnaire** : tout est dans `public/js/questions.js`. On peut changer les textes affichés librement, mais **pas les identifiants** (`id`) une fois le questionnaire publié.
