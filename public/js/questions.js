// =====================================================================
//  ET SI ON PARLAIT DE TOI ? — Contenu du questionnaire
// ---------------------------------------------------------------------
//  Ce fichier est partagé par l'application publique ET par le serveur
//  (qui s'en sert pour vérifier les réponses).
//
//  ⚠️ Les "id" (q1, compare, other…) sont des identifiants techniques
//  stables : ils servent aux statistiques. Tu peux corriger le TEXTE
//  affiché ("label", "title"…) sans risque, mais ne modifie pas les id
//  une fois le questionnaire publié.
// =====================================================================

export const SURVEY_VERSION = '2027-v1';

// Durée affichée sur l'écran d'accueil (à ajuster après tes tests).
export const ESTIMATED_DURATION = 'Environ 10 minutes';

// Limites de longueur (vérifiées aussi côté serveur).
export const LIMITS = {
  otherText: 300,   // champ « Autre »
  freeText: 1500,   // question 20
};

// Textes « Autre » : options dont le choix ouvre un petit champ libre.
const OTHER = { id: 'other', label: 'Autre', other: true };

export const CHAPTERS = [
  {
    id: 'c1',
    number: 1,
    title: 'Ce que tu vis à l’intérieur',
    intro: [
      'On commence par toi.',
      'Par la façon dont tu te regardes, la place que tu t’accordes et toutes ces petites choses que tu ressens au quotidien, parfois sans même t’en rendre compte.',
    ],
  },
  {
    id: 'c2',
    number: 2,
    title: 'Ce qui te retient',
    intro: [
      'Il y a parfois des choses que l’on aimerait faire, dire ou changer, mais quelque chose nous retient.',
      'Une peur, une habitude, une croyance, une expérience passée…',
      'J’aimerais comprendre ce qui prend de la place chez toi aujourd’hui.',
    ],
  },
  {
    id: 'c3',
    number: 3,
    title: 'Ce que tu aimerais t’autoriser',
    intro: [
      'Et si on parlait maintenant de toutes ces choses auxquelles tu aimerais te donner accès ?',
      'Recevoir davantage, t’écouter, te sentir bien dans ton corps, faire confiance à tes ressentis…',
      'Qu’est-ce qui compte vraiment pour toi ?',
    ],
  },
  {
    id: 'c4',
    number: 4,
    title: 'Ce dont tu as réellement besoin',
    intro: [
      'Tu t’es peut-être reconnue dans beaucoup de choses depuis le début de cette parenthèse.',
      'Mais parmi tout cela, qu’est-ce qui ferait réellement la différence dans ta vie aujourd’hui ?',
    ],
  },
  {
    id: 'c5',
    number: 5,
    title: 'Ta réalité au quotidien',
    intro: [
      'Parce que prendre soin de soi, c’est bien joli sur le papier…',
      'Mais entre le travail, les enfants, les obligations, la fatigue et tout ce qu’il y a à gérer, ce n’est pas toujours aussi simple.',
      'J’aimerais aussi comprendre ta réalité.',
    ],
  },
  {
    id: 'c6',
    number: 6,
    title: 'Les mots que tu n’as peut-être jamais posés',
    intro: [
      'Une dernière question, peut-être la plus précieuse.',
      'Prends le temps qu’il te faut.',
    ],
  },
  {
    id: 'extra',
    number: null,
    title: 'Encore un petit instant ?',
    intro: [
      'Merci de m’avoir partagé tout ça.',
      'Si tu as encore deux petites minutes, j’aimerais te poser quelques questions supplémentaires pour m’aider à imaginer la suite.',
      'J’ai envie de créer quelque chose qui puisse réellement trouver sa place dans ton quotidien, et pas quelque chose que tu laisserais de côté au bout de quelques jours.',
    ],
  },
];

// Thématiques de la question 13 (réutilisées par la question 14).
const Q13_OPTIONS = [
  { id: 'confidence', label: 'La confiance en moi.' },
  { id: 'self_esteem', label: 'L’estime et l’amour de moi.' },
  { id: 'others_judgment', label: 'Le regard et le jugement des autres.' },
  { id: 'childhood_wounds', label: 'Les blessures de mon enfance.' },
  { id: 'past_wounds', label: 'Les blessures émotionnelles du passé.' },
  { id: 'fears', label: 'Mes peurs et mes insécurités.' },
  { id: 'limiting_beliefs', label: 'Mes croyances limitantes.' },
  { id: 'family_patterns', label: 'Mes schémas familiaux répétitifs.' },
  { id: 'relationships', label: 'Mes relations affectives.' },
  { id: 'emotions', label: 'La gestion de mes émotions.' },
  { id: 'calm_mind', label: 'L’apaisement de mon mental.' },
  { id: 'letting_go', label: 'Le lâcher-prise.' },
  { id: 'guilt', label: 'La culpabilité.' },
  { id: 'boundaries', label: 'L’affirmation de soi et les limites.' },
  { id: 'money', label: 'Ma relation à l’argent et à l’abondance.' },
  { id: 'body', label: 'Ma relation à mon corps et à ma féminité.' },
  { id: 'intuition', label: 'Mon intuition et ma spiritualité.' },
  { id: 'action', label: 'Ma capacité à avancer et à passer à l’action.' },
  { id: 'joy', label: 'Ma joie de vivre.' },
  { id: 'reconnection', label: 'Ma reconnexion à moi-même.' },
  { id: 'hypersensitivity', label: 'Mon hypersensibilité.' },
  { id: 'grief', label: 'Le deuil et l’absence.' },
  { id: 'rest', label: 'Le repos et l’équilibre de mon quotidien.' },
  OTHER,
];

export const QUESTIONS = [
  // ───────────── CHAPITRE 1 ─────────────
  {
    id: 'q1', number: 1, chapter: 'c1', type: 'multi',
    title: 'Quel regard portes-tu sur toi aujourd’hui ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'compare', label: 'Je me compare constamment aux autres.' },
      { id: 'never_enough', label: 'Je ne me sens jamais assez bien.' },
      { id: 'self_doubt', label: 'Je doute de moi et de mes capacités.' },
      { id: 'minimize', label: 'Je minimise mes réussites.' },
      { id: 'not_legit', label: 'Je ne me sens pas légitime.' },
      { id: 'own_value', label: 'J’ai du mal à reconnaître ma propre valeur.' },
      { id: 'too_hard', label: 'Je suis beaucoup trop dure avec moi-même.' },
      { id: 'not_interesting', label: 'Je ne me trouve pas assez intéressante.' },
      { id: 'body', label: 'J’ai du mal à accepter mon corps.' },
      { id: 'who_am_i', label: 'Je ne sais plus vraiment qui je suis.' },
      { id: 'feel_good', label: 'Je me sens plutôt bien avec moi-même.' },
      OTHER,
    ],
  },
  {
    id: 'q2', number: 2, chapter: 'c1', type: 'multi',
    title: 'Quelle place t’accordes-tu dans ta vie ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'others_first', label: 'Je fais toujours passer les autres avant moi.' },
      { id: 'guilt_me_time', label: 'Je culpabilise lorsque je prends du temps pour moi.' },
      { id: 'say_no', label: 'J’ai du mal à dire non.' },
      { id: 'disappoint', label: 'J’ai peur de décevoir.' },
      { id: 'validation', label: 'J’ai besoin de la validation des autres.' },
      { id: 'adapt', label: 'Je m’adapte constamment aux personnes qui m’entourent.' },
      { id: 'express', label: 'Je n’ose pas exprimer ce que je ressens vraiment.' },
      { id: 'responsible', label: 'Je me sens responsable du bonheur des autres.' },
      { id: 'bother', label: 'J’ai peur de déranger.' },
      { id: 'give_more', label: 'Je donne beaucoup plus que je ne reçois.' },
      { id: 'no_desire', label: 'Je ne sais même plus ce dont j’ai envie.' },
      { id: 'respect_needs', label: 'Je parviens à respecter mes besoins.' },
      OTHER,
    ],
  },
  {
    id: 'q3', number: 3, chapter: 'c1', type: 'multi',
    title: 'Qu’est-ce qui te pèse émotionnellement ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'mind_nonstop', label: 'Mon mental ne s’arrête jamais.' },
      { id: 'always_strong', label: 'Je suis fatiguée de devoir toujours être forte.' },
      { id: 'intense', label: 'Je ressens les émotions très intensément.' },
      { id: 'overwhelmed', label: 'Je me sens facilement submergée.' },
      { id: 'others_emotions', label: 'J’ai l’impression de porter les émotions des autres.' },
      { id: 'worry', label: 'Je ressens souvent une inquiétude sans savoir pourquoi.' },
      { id: 'control', label: 'J’ai besoin de tout contrôler.' },
      { id: 'lonely', label: 'Je me sens seule, même entourée.' },
      { id: 'hold_in', label: 'Je retiens beaucoup de choses en moi.' },
      { id: 'anger', label: 'J’ai du mal à exprimer ma colère.' },
      { id: 'present', label: 'Je n’arrive pas à profiter pleinement du moment présent.' },
      { id: 'emptiness', label: 'Je ressens une forme de vide intérieur.' },
      { id: 'evening_calm', label: 'J’ai du mal à trouver le calme le soir.' },
      { id: 'peaceful', label: 'Je me sens plutôt apaisée.' },
      OTHER,
    ],
  },
  {
    id: 'q4', number: 4, chapter: 'c1', type: 'multi', max: 3,
    title: 'Comment te sens-tu dans ta vie actuellement ?',
    hint: 'Trois réponses maximum.',
    options: [
      { id: 'autopilot', label: 'J’ai l’impression d’être en pilote automatique.' },
      { id: 'must_change', label: 'Je sens que quelque chose doit changer, mais je ne sais pas quoi.' },
      { id: 'out_of_place', label: 'Je ne me sens pas à ma place.' },
      { id: 'stagnate', label: 'J’ai l’impression de stagner.' },
      { id: 'transition', label: 'Je traverse une période de transition.' },
      { id: 'disconnected', label: 'Je me sens déconnectée de moi-même.' },
      { id: 'lost_joy', label: 'J’ai perdu une partie de ma joie de vivre.' },
      { id: 'low_energy', label: 'Je manque d’énergie et d’élan.' },
      { id: 'dare_change', label: 'J’ai envie de changement, mais je n’ose pas.' },
      { id: 'fulfilled', label: 'Je me sens épanouie, mais j’ai envie de continuer à évoluer.' },
      OTHER,
    ],
  },

  // ───────────── CHAPITRE 2 ─────────────
  {
    id: 'q5', number: 5, chapter: 'c2', type: 'multi',
    title: 'Quelles peurs prennent le plus de place dans ta vie ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'others_gaze', label: 'La peur du regard des autres.' },
      { id: 'judged', label: 'La peur d’être jugée.' },
      { id: 'rejected', label: 'La peur d’être rejetée.' },
      { id: 'abandoned', label: 'La peur d’être abandonnée.' },
      { id: 'unloved', label: 'La peur de ne pas être aimée.' },
      { id: 'failure', label: 'La peur d’échouer.' },
      { id: 'success', label: 'La peur de réussir.' },
      { id: 'lack', label: 'La peur de manquer.' },
      { id: 'lose_control', label: 'La peur de perdre le contrôle.' },
      { id: 'unknown', label: 'La peur de l’inconnu.' },
      { id: 'wrong_decision', label: 'La peur de prendre une mauvaise décision.' },
      { id: 'alone', label: 'La peur de me retrouver seule.' },
      { id: 'no_place', label: 'La peur de ne jamais trouver ma place.' },
      { id: 'show_self', label: 'La peur de montrer qui je suis vraiment.' },
      { id: 'not_up_to', label: 'La peur de ne pas être à la hauteur.' },
      { id: 'none', label: 'Aucune de ces peurs particulièrement.', exclusive: true },
      OTHER,
    ],
  },
  {
    id: 'q6', number: 6, chapter: 'c2', type: 'multi',
    title: 'Quelles phrases résonnent le plus en toi ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'be_strong', label: 'Je dois être forte.' },
      { id: 'earn_love', label: 'Je dois mériter l’amour.' },
      { id: 'not_enough', label: 'Je ne suis pas assez.' },
      { id: 'prove', label: 'Je dois faire mes preuves.' },
      { id: 'only_me', label: 'Je ne peux compter que sur moi-même.' },
      { id: 'perfect', label: 'Je dois être parfaite pour être appréciée.' },
      { id: 'selfish', label: 'Si je pense à moi, je suis égoïste.' },
      { id: 'deserve_less', label: 'Je ne mérite pas autant que les autres.' },
      { id: 'work_hard', label: 'Je dois travailler dur pour mériter ce que je reçois.' },
      { id: 'not_capable', label: 'Je ne suis pas capable.' },
      { id: 'no_mistake', label: 'Je n’ai pas le droit à l’erreur.' },
      { id: 'manage_all', label: 'Je dois tout gérer.' },
      { id: 'happiness_ends', label: 'Le bonheur ne dure jamais.' },
      { id: 'be_myself_risk', label: 'Je ne peux pas être pleinement moi-même sans risquer de perdre quelqu’un.' },
      { id: 'be_useful', label: 'Je dois être utile pour avoir de la valeur.' },
      { id: 'no_slowing', label: 'Je ne peux pas me permettre de ralentir.' },
      { id: 'none', label: 'Aucune de ces phrases.', exclusive: true },
      OTHER,
    ],
  },
  {
    id: 'q7', number: 7, chapter: 'c2', type: 'multi', optional: true,
    title: 'Y a-t-il des choses du passé dont tu ressens encore le poids ?',
    hint: 'Question facultative. Plusieurs réponses possibles.',
    note: 'Tu n’as pas besoin de raconter ton histoire.',
    options: [
      { id: 'childhood', label: 'Certaines expériences de mon enfance.' },
      { id: 'parents', label: 'Ma relation avec mes parents.' },
      { id: 'recognition', label: 'Le manque de reconnaissance que j’ai reçu.' },
      { id: 'words', label: 'Des paroles qui m’ont profondément marquée.' },
      { id: 'past_love', label: 'Des relations amoureuses passées.' },
      { id: 'betrayal', label: 'Des trahisons ou des déceptions.' },
      { id: 'loss', label: 'La perte d’une personne que j’aime.' },
      { id: 'regrets', label: 'Des choix que je regrette.' },
      { id: 'self_forgive', label: 'Des choses que je n’arrive pas à me pardonner.' },
      { id: 'family_patterns', label: 'Des schémas familiaux que je reproduis.' },
      { id: 'unexpressed', label: 'Des émotions que je n’ai jamais vraiment exprimées.' },
      { id: 'unsure', label: 'Je ne sais pas exactement, mais je sens que quelque chose me retient.' },
      { id: 'at_peace', label: 'Je me sens en paix avec mon passé.' },
      { id: 'prefer_not', label: 'Je préfère ne pas répondre.', exclusive: true },
    ],
  },
  {
    id: 'q8', number: 8, chapter: 'c2', type: 'multi',
    title: 'Dans tes relations, qu’aimerais-tu réussir à changer ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'stop_forgetting', label: 'Arrêter de m’oublier pour être aimée.' },
      { id: 'abandon_fear', label: 'Ne plus avoir peur que l’on m’abandonne.' },
      { id: 'boundaries', label: 'Apprendre à poser mes limites.' },
      { id: 'hurtful', label: 'Ne plus accepter des comportements qui me blessent.' },
      { id: 'save_everyone', label: 'Arrêter de chercher à sauver tout le monde.' },
      { id: 'dependency', label: 'Ne plus dépendre du regard ou de l’amour des autres.' },
      { id: 'trust', label: 'Apprendre à faire confiance.' },
      { id: 'express_needs', label: 'Oser exprimer mes besoins.' },
      { id: 'love_patterns', label: 'Arrêter de reproduire les mêmes schémas amoureux.' },
      { id: 'distance_guilt', label: 'Ne plus culpabiliser lorsque je prends mes distances.' },
      { id: 'balanced', label: 'Construire des relations plus équilibrées.' },
      { id: 'receive', label: 'Apprendre à recevoir autant que je donne.' },
      { id: 'satisfied', label: 'Je suis satisfaite de mes relations.' },
      OTHER,
    ],
  },

  // ───────────── CHAPITRE 3 ─────────────
  {
    id: 'q9', number: 9, chapter: 'c3', type: 'multi',
    title: 'Quelle relation entretiens-tu avec l’argent et le fait de recevoir ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'fear_lack', label: 'J’ai constamment peur de manquer.' },
      { id: 'guilt_spend', label: 'Je culpabilise lorsque je dépense pour moi.' },
      { id: 'receive_without', label: 'J’ai du mal à recevoir sans donner en retour.' },
      { id: 'not_deserve', label: 'J’ai l’impression de ne pas mériter davantage.' },
      { id: 'suffer', label: 'Je pense qu’il faut souffrir ou travailler énormément pour réussir.' },
      { id: 'ask', label: 'Je n’ose pas demander ce que je mérite.' },
      { id: 'gifts', label: 'Je me sens mal à l’aise lorsque l’on m’offre quelque chose.' },
      { id: 'fear_success', label: 'J’ai peur de réussir financièrement.' },
      { id: 'freer', label: 'J’aimerais me sentir plus libre dans ma relation à l’argent.' },
      { id: 'accept_help', label: 'J’ai du mal à accepter l’aide des autres.' },
      { id: 'serene', label: 'J’ai une relation plutôt sereine avec l’argent.' },
      OTHER,
    ],
  },
  {
    id: 'q10', number: 10, chapter: 'c3', type: 'multi', optional: true,
    title: 'Quelle relation aimerais-tu avoir avec ton corps ?',
    hint: 'Question facultative. Plusieurs réponses possibles.',
    options: [
      { id: 'stop_criticize', label: 'Arrêter de me critiquer lorsque je me regarde.' },
      { id: 'accept', label: 'Apprendre à accepter mon corps tel qu’il est.' },
      { id: 'no_compare', label: 'Ne plus me comparer physiquement aux autres.' },
      { id: 'feel_beautiful', label: 'Me sentir belle sans avoir besoin de validation.' },
      { id: 'listen_needs', label: 'Apprendre à écouter les besoins de mon corps.' },
      { id: 'femininity', label: 'Me réapproprier ma féminité.' },
      { id: 'presence', label: 'Me sentir davantage présente dans mon corps.' },
      { id: 'not_enemy', label: 'Arrêter de considérer mon corps comme un ennemi.' },
      { id: 'free_appearance', label: 'Me sentir libre d’être moi, indépendamment de mon apparence.' },
      { id: 'rest', label: 'Respecter mon besoin de repos.' },
      { id: 'feel_good', label: 'Je me sens bien dans mon corps.' },
      OTHER,
      { id: 'prefer_not', label: 'Je préfère ne pas répondre.', exclusive: true },
    ],
  },
  {
    id: 'q11', number: 11, chapter: 'c3', type: 'multi',
    title: 'Et concernant ton intuition et ta spiritualité ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'listen_intuition', label: 'J’aimerais apprendre à écouter mon intuition.' },
      { id: 'doubt_feelings', label: 'Je doute constamment de mes ressentis.' },
      { id: 'fear_wrong', label: 'J’ai peur de me tromper.' },
      { id: 'sensitivity', label: 'J’aimerais mieux comprendre ma sensibilité.' },
      { id: 'connected', label: 'J’aimerais me sentir davantage connectée à moi-même.' },
      { id: 'energy_boundaries', label: 'J’aimerais apprendre à poser des limites énergétiques.' },
      { id: 'grounded', label: 'J’aimerais me sentir plus ancrée.' },
      { id: 'intuitive_skills', label: 'J’aimerais développer mes capacités intuitives.' },
      { id: 'meaning', label: 'J’aimerais trouver davantage de sens à mon existence.' },
      { id: 'spiritual', label: 'Je ressens le besoin de retrouver une connexion spirituelle.' },
      { id: 'trust_feelings', label: 'J’aimerais apprendre à faire confiance à mes propres ressentis.' },
      { id: 'not_interested', label: 'Ce n’est pas un sujet qui m’attire particulièrement.', exclusive: true },
      OTHER,
    ],
  },
  {
    id: 'q12', number: 12, chapter: 'c3', type: 'multi', max: 5,
    title: 'Qu’aimerais-tu profondément réussir à faire ?',
    hint: 'Cinq réponses maximum.',
    options: [
      { id: 'love_self', label: 'M’aimer telle que je suis.' },
      { id: 'confidence', label: 'Avoir confiance en moi.' },
      { id: 'value', label: 'Reconnaître ma valeur.' },
      { id: 'choose_self', label: 'Me choisir sans culpabiliser.' },
      { id: 'take_place', label: 'Oser prendre ma place.' },
      { id: 'free_gaze', label: 'Me libérer du regard des autres.' },
      { id: 'joy', label: 'Retrouver ma joie de vivre.' },
      { id: 'inner_safety', label: 'Me sentir en sécurité intérieurement.' },
      { id: 'past_peace', label: 'Faire la paix avec mon passé.' },
      { id: 'let_go', label: 'Apprendre à lâcher prise.' },
      { id: 'free_be_me', label: 'Me sentir libre d’être pleinement moi.' },
      { id: 'receive', label: 'M’autoriser à recevoir.' },
      { id: 'creativity', label: 'Retrouver ma créativité.' },
      { id: 'dreams', label: 'Oser réaliser mes rêves.' },
      { id: 'intuition', label: 'Me reconnecter à mon intuition.' },
      { id: 'meaning', label: 'Retrouver du sens dans ma vie.' },
      { id: 'peace', label: 'Me sentir apaisée.' },
      { id: 'self_sabotage', label: 'Arrêter de me saboter.' },
      { id: 'forgive_self', label: 'Apprendre à me pardonner.' },
      OTHER,
    ],
  },

  // ───────────── CHAPITRE 4 ─────────────
  {
    id: 'q13', number: 13, chapter: 'c4', type: 'multi', max: 3,
    title: 'Si tu pouvais travailler sur trois aspects de toi en priorité, lesquels choisirais-tu ?',
    hint: 'Trois réponses maximum.',
    options: Q13_OPTIONS,
  },
  {
    id: 'q14', number: 14, chapter: 'c4', type: 'single', source: 'q13',
    title: 'Et s’il ne devait en rester qu’un ?',
    note: 'Parmi les aspects que tu viens de sélectionner, lequel aurait, selon toi, le plus grand impact sur ta vie aujourd’hui ?',
    noteWhenSkipped: 'Parmi tous ces aspects, lequel aurait, selon toi, le plus grand impact sur ta vie aujourd’hui ?',
    hint: 'Une seule réponse possible.',
    options: Q13_OPTIONS,
  },
  {
    id: 'q15', number: 15, chapter: 'c4', type: 'multi', max: 3,
    title: 'Qu’attends-tu réellement d’un moment consacré à toi-même ?',
    hint: 'Trois réponses maximum.',
    options: [
      { id: 'soothed_now', label: 'Me sentir immédiatement plus apaisée.' },
      { id: 'understand_why', label: 'Comprendre pourquoi je fonctionne de cette manière.' },
      { id: 'realizations', label: 'Avoir des prises de conscience.' },
      { id: 'free_fears', label: 'Me libérer progressivement de certaines peurs.' },
      { id: 'beliefs', label: 'Faire évoluer mes croyances.' },
      { id: 'self_talk', label: 'Apprendre à me parler autrement.' },
      { id: 'deep_change', label: 'Ressentir une évolution profonde en moi.' },
      { id: 'supported', label: 'Me sentir soutenue dans les moments difficiles.' },
      { id: 'energy', label: 'Retrouver de l’énergie et de la motivation.' },
      { id: 'habits', label: 'Réussir à changer certaines habitudes.' },
      { id: 'reconnect', label: 'Me reconnecter à mes ressentis.' },
      { id: 'nothing_to_manage', label: 'Simplement avoir un moment où je n’ai rien à gérer.' },
      { id: 'know_self', label: 'Apprendre à mieux me connaître.' },
      OTHER,
    ],
  },

  // ───────────── CHAPITRE 5 ─────────────
  {
    id: 'q16', number: 16, chapter: 'c5', type: 'multi',
    title: 'Qu’est-ce qui t’empêche aujourd’hui de prendre davantage soin de toi ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'time', label: 'Le manque de temps.' },
      { id: 'energy', label: 'Le manque d’énergie.' },
      { id: 'money', label: 'Le manque de moyens financiers.' },
      { id: 'where_start', label: 'Je ne sais pas par où commencer.' },
      { id: 'what_helps', label: 'Je ne sais pas ce qui pourrait réellement m’aider.' },
      { id: 'guilt', label: 'Je culpabilise lorsque je prends du temps pour moi.' },
      { id: 'regularity', label: 'J’ai du mal à être régulière.' },
      { id: 'never_finish', label: 'Je commence des choses que je ne termine jamais.' },
      { id: 'tried_before', label: 'J’ai déjà essayé plusieurs choses sans ressentir les changements espérés.' },
      { id: 'alone_work', label: 'Je préfère être seule pour faire ce travail.' },
      { id: 'ask_help', label: 'J’ai du mal à demander de l’aide.' },
      { id: 'privacy', label: 'Je manque d’intimité ou de tranquillité chez moi.' },
      { id: 'nothing', label: 'Rien de particulier.', exclusive: true },
      OTHER,
    ],
  },
  {
    id: 'q17', number: 17, chapter: 'c5', type: 'single',
    title: 'Combien de temps pourrais-tu réellement t’accorder ?',
    hint: 'Une seule réponse possible.',
    options: [
      { id: 'm3_5', label: '3 à 5 minutes.' },
      { id: 'm6_10', label: '6 à 10 minutes.' },
      { id: 'm11_15', label: '11 à 15 minutes.' },
      { id: 'm16_25', label: '16 à 25 minutes.' },
      { id: 'm26_30', label: '26 à 30 minutes.' },
      { id: 'm30_plus', label: 'Plus de 30 minutes.' },
      { id: 'depends', label: 'Cela dépend vraiment des jours.' },
      { id: 'dont_know', label: 'Je ne sais pas encore.' },
    ],
  },
  {
    id: 'q18', number: 18, chapter: 'c5', type: 'multi',
    title: 'À quel moment aimerais-tu pouvoir prendre ce temps pour toi ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'morning', label: 'Le matin, avant de commencer ma journée.' },
      { id: 'break', label: 'Pendant une pause dans la journée.' },
      { id: 'hard_emotion', label: 'Lorsque je traverse une émotion difficile.' },
      { id: 'recenter', label: 'Lorsque je ressens le besoin de me recentrer.' },
      { id: 'after_work', label: 'En rentrant du travail.' },
      { id: 'evening', label: 'Le soir, lorsque tout le monde dort.' },
      { id: 'bed', label: 'Dans mon lit, avant de m’endormir.' },
      { id: 'weekend', label: 'Le week-end.' },
      { id: 'anytime', label: 'À n’importe quel moment, selon mes besoins.' },
    ],
  },
  {
    id: 'q19', number: 19, chapter: 'c5', type: 'multi',
    title: 'Quelle manière d’être accompagnée te correspondrait le mieux ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { id: 'free_choice', label: 'Pouvoir choisir librement selon mon état émotionnel du moment.' },
      { id: 'progressive', label: 'Suivre un parcours progressif, étape par étape.' },
      { id: 'short', label: 'Avoir des expériences courtes pour les journées chargées.' },
      { id: 'long', label: 'Avoir des expériences plus longues lorsque j’en ressens le besoin.' },
      { id: 'revisit', label: 'Pouvoir revenir plusieurs fois sur un même sujet.' },
      { id: 'guided_to_needs', label: 'Être guidée vers ce qui correspond à mes besoins.' },
      { id: 'notes', label: 'Pouvoir noter mes prises de conscience.' },
      { id: 'track', label: 'Garder une trace de mon évolution.' },
      { id: 'new_regularly', label: 'Découvrir régulièrement de nouvelles expériences.' },
      { id: 'reminders', label: 'Recevoir de petits rappels pour penser à moi.' },
      { id: 'no_pressure', label: 'Avancer sans aucune obligation ni pression.' },
      { id: 'from_home', label: 'Pouvoir faire tout cela depuis chez moi.' },
      OTHER,
    ],
  },

  // ───────────── CHAPITRE 6 ─────────────
  {
    id: 'q20', number: 20, chapter: 'c6', type: 'text', optional: true,
    title: 'Si tu pouvais changer une seule chose à l’intérieur de toi…',
    lead: [
      'Pas dans ta vie extérieure.',
      'Pas chez les personnes qui t’entourent.',
      'Mais vraiment en toi.',
      'Qu’est-ce que ce serait ?',
    ],
    placeholder: 'J’aimerais tellement réussir à…',
    note: 'Tu peux déposer tes mots ici si tu en ressens l’envie. Tu peux aussi passer cette question. Merci de ne pas indiquer de nom, de coordonnées, d’informations médicales ou de détails permettant de t’identifier ou d’identifier quelqu’un d’autre.',
    maxLength: LIMITS.freeText,
  },

  // ───────────── CHAPITRE COMPLÉMENTAIRE ─────────────
  {
    id: 'q21', number: 21, chapter: 'extra', type: 'single',
    title: 'As-tu déjà utilisé des audios pour prendre soin de toi ou travailler sur toi-même ?',
    hint: 'Une seule réponse possible.',
    options: [
      { id: 'regularly', label: 'Oui, régulièrement.' },
      { id: 'sometimes', label: 'Oui, de temps en temps.' },
      { id: 'tried_stopped', label: 'J’ai déjà essayé, mais je n’ai pas continué.' },
      { id: 'no_interested', label: 'Non, mais cela pourrait m’intéresser.' },
      { id: 'no_not_for_me', label: 'Non, ce n’est pas un format qui m’attire.' },
      { id: 'not_sure', label: 'Je ne sais pas vraiment.' },
    ],
  },
  {
    id: 'q22', number: 22, chapter: 'extra', type: 'multi',
    title: 'Qu’est-ce qui te manque dans les audios ou les accompagnements que tu as déjà essayés ?',
    hint: 'Plusieurs réponses possibles.',
    // Formulation adaptée si la participante n'a jamais utilisé d'audios (Q21).
    adapt: {
      when: { question: 'q21', anyOf: ['no_interested', 'no_not_for_me'] },
      title: 'Qu’est-ce qui pourrait te donner envie de découvrir des audios pour prendre soin de toi ?',
      hint: 'Plusieurs réponses possibles. Tu peux t’appuyer sur ce qui te freine ou sur ce qui te manquerait.',
      hideOptions: ['satisfied'],
    },
    options: [
      { id: 'generic', label: 'Je trouve les contenus trop génériques.' },
      { id: 'not_recognize', label: 'Je ne me reconnais pas dans ce qui est proposé.' },
      { id: 'go_further', label: 'Je ressens un apaisement sur le moment, mais j’aimerais aller plus loin.' },
      { id: 'more_realizations', label: 'J’aimerais avoir davantage de prises de conscience.' },
      { id: 'too_long', label: 'Les audios sont trop longs.' },
      { id: 'too_short', label: 'Les audios sont trop courts.' },
      { id: 'focus', label: 'J’ai du mal à rester concentrée.' },
      { id: 'voices', label: 'Les voix ou les musiques ne me correspondent pas toujours.' },
      { id: 'spiritual', label: 'Il manque une dimension spirituelle ou énergétique.' },
      { id: 'concrete', label: 'Il manque des pistes concrètes pour mon quotidien.' },
      { id: 'choose', label: 'Je ne sais pas quel contenu choisir selon mes besoins.' },
      { id: 'regularity', label: 'J’ai du mal à être régulière.' },
      { id: 'repetitive', label: 'Je trouve les contenus trop répétitifs.' },
      { id: 'satisfied', label: 'Je suis satisfaite de ce que j’utilise actuellement.' },
      { id: 'never_tried', label: 'Je n’ai jamais essayé.', exclusive: true },
      OTHER,
    ],
  },
  {
    id: 'q23', number: 23, chapter: 'extra', type: 'multi', max: 5,
    title: 'Qu’aimerais-tu retrouver dans un espace entièrement consacré à ton évolution intérieure ?',
    hint: 'Cinq réponses maximum.',
    options: [
      { id: 'short_audios', label: 'Des audios guidés courts.' },
      { id: 'deep_audios', label: 'Des audios guidés plus approfondis.' },
      { id: 'sleep_audios', label: 'Des audios à écouter avant de dormir.' },
      { id: 'morning_audios', label: 'Des audios pour commencer ma journée.' },
      { id: 'hard_moments', label: 'Des audios à écouter dans les moments difficiles.' },
      { id: 'themed_paths', label: 'Des parcours organisés par thématique.' },
      { id: 'introspection', label: 'Des exercices d’introspection.' },
      { id: 'recommendations', label: 'Des recommandations adaptées à mon ressenti du moment.' },
      { id: 'journal', label: 'Un carnet personnel pour noter mes déclics.' },
      { id: 'progress', label: 'Un espace pour suivre mon évolution.' },
      { id: 'favorites', label: 'La possibilité d’enregistrer mes contenus favoris.' },
      { id: 'new_regularly', label: 'De nouvelles expériences régulièrement.' },
      { id: 'challenges', label: 'Des petits défis à réaliser à mon rythme.' },
      { id: 'rituals', label: 'Des rituels simples.' },
      { id: 'screen_free', label: 'La possibilité d’écouter sans avoir besoin de regarder mon écran.' },
      OTHER,
    ],
  },
  {
    id: 'q24', number: 24, chapter: 'extra', type: 'single',
    title: 'Quel fonctionnement te conviendrait le mieux pour accéder à des ressources de bien-être ?',
    hint: 'Une seule réponse possible.',
    options: [
      { id: 'buy_themes', label: 'Acheter uniquement les thématiques qui m’intéressent et les conserver.' },
      { id: 'monthly', label: 'Payer un abonnement mensuel donnant accès à toutes les thématiques.' },
      { id: 'yearly', label: 'Payer un abonnement annuel à un tarif plus avantageux.' },
      { id: 'hybrid', label: 'Avoir le choix entre un achat individuel et un abonnement.' },
      { id: 'free_first', label: 'Commencer par découvrir quelques contenus gratuits avant de décider.' },
      { id: 'dont_know', label: 'Je ne sais pas encore.' },
      { id: 'no_pay', label: 'Je ne souhaite pas payer pour ce type de ressources.' },
    ],
  },
  {
    id: 'q25', number: 25, chapter: 'extra', type: 'budget', optional: true,
    title: 'Quel budget te semblerait envisageable pour un espace de bien-être qui répond réellement à tes besoins ?',
    hint: 'Question facultative. Une réponse par partie.',
    parts: [
      {
        id: 'monthly',
        title: 'Pour un accès mensuel à plusieurs thématiques, enrichies régulièrement',
        options: [
          { id: 'none', label: 'Aucun budget actuellement.' },
          { id: 'lt10', label: 'Moins de 10 € par mois.' },
          { id: '10_15', label: 'De 10 à moins de 15 € par mois.' },
          { id: '15_20', label: 'De 15 à moins de 20 € par mois.' },
          { id: '20_30', label: 'De 20 à moins de 30 € par mois.' },
          { id: '30_50', label: 'De 30 à moins de 50 € par mois.' },
          { id: '50_plus', label: '50 € ou plus par mois.' },
          { id: 'depends', label: 'Cela dépendrait du contenu.' },
          { id: 'prefer_not', label: 'Je préfère ne pas répondre.' },
        ],
      },
      {
        id: 'purchase',
        title: 'Pour l’achat définitif d’une thématique comprenant plusieurs audios et ressources',
        options: [
          { id: 'none', label: 'Aucun budget actuellement.' },
          { id: 'lt15', label: 'Moins de 15 €.' },
          { id: '15_25', label: 'De 15 à moins de 25 €.' },
          { id: '25_40', label: 'De 25 à moins de 40 €.' },
          { id: '40_60', label: 'De 40 à moins de 60 €.' },
          { id: '60_80', label: 'De 60 à moins de 80 €.' },
          { id: '80_plus', label: '80 € ou plus.' },
          { id: 'depends', label: 'Cela dépendrait du contenu.' },
          { id: 'prefer_not', label: 'Je préfère ne pas répondre.' },
        ],
      },
    ],
  },
];

export const MAIN_QUESTIONS = QUESTIONS.filter((q) => q.chapter !== 'extra');
export const EXTRA_QUESTIONS = QUESTIONS.filter((q) => q.chapter === 'extra');

export function getQuestion(id) {
  return QUESTIONS.find((q) => q.id === id);
}

export function getChapter(id) {
  return CHAPTERS.find((c) => c.id === id);
}

// Version du texte de consentement de la liste d'attente.
export const WAITLIST_CONSENT_VERSION = 'waitlist-2027-v1';
export const WAITLIST_CONSENT_TEXT =
  'J’accepte de recevoir par email les informations concernant ce nouveau projet et son lancement. Je pourrai me désinscrire à tout moment.';
