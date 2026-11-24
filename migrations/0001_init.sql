-- =====================================================================
--  ET SI ON PARLAIT DE TOI ? — Base de données Cloudflare D1
--  Deux tables totalement indépendantes, sans aucun lien entre elles.
-- =====================================================================

-- Table 1 : les questionnaires (aucune donnée d'identité)
CREATE TABLE IF NOT EXISTS survey_responses (
  id                 TEXT PRIMARY KEY,          -- identifiant aléatoire (UUID)
  edit_token_hash    TEXT NOT NULL,             -- empreinte du jeton permettant de compléter le chapitre facultatif
  created_at         TEXT NOT NULL,             -- date d'enregistrement (UTC, ISO 8601)
  updated_at         TEXT NOT NULL,
  survey_version     TEXT NOT NULL,             -- version du questionnaire
  main_answers       TEXT NOT NULL,             -- réponses aux questions 1 à 20 (JSON)
  extra_answers      TEXT,                      -- réponses aux questions 21 à 25 (JSON)
  free_text          TEXT,                      -- réponse libre de la question 20
  top_priorities     TEXT,                      -- les 3 thématiques prioritaires (question 13, JSON)
  absolute_priority  TEXT,                      -- la thématique prioritaire absolue (question 14)
  budget_monthly     TEXT,                      -- question 25 A
  budget_purchase    TEXT,                      -- question 25 B
  extra_status       TEXT NOT NULL DEFAULT 'not_started'  -- not_started | declined | completed
    CHECK (extra_status IN ('not_started', 'declined', 'completed')),
  extra_completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_survey_created ON survey_responses (created_at);

-- Table 2 : la liste d'attente (aucun lien avec les questionnaires)
CREATE TABLE IF NOT EXISTS waitlist (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  email            TEXT NOT NULL UNIQUE,         -- en minuscules, sans doublon
  created_at       TEXT NOT NULL,                -- date d'inscription
  consent_at       TEXT NOT NULL,                -- date du consentement
  consent_version  TEXT NOT NULL,                -- version du texte de consentement
  status           TEXT NOT NULL DEFAULT 'active' -- active | unsubscribed
    CHECK (status IN ('active', 'unsubscribed'))
);
