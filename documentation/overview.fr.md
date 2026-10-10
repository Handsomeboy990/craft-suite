# Craft Suite

Des systèmes d'expertise pour un agent, dans un seul dépôt : **écrire**,
**produire des documents**, **construire des logiciels**, **les sécuriser**,
**faire de la recherche**, **mener une recherche d'emploi**, **découvrir et
évaluer des opportunités**, et **relire son propre travail**.

Le dépôt s'appelait `claude-writer-suite` jusqu'à la version 3.0.0, quand
l'arbre d'écriture a cessé d'en être la totalité.

173 skills et 34 agents. Pas des prompts : des protocoles numérotés, des
critères de décision, des grilles d'évaluation et des procédures de révision,
chacun avec un seuil chiffré de ce qui compte comme terminé.

[English version](overview.md)

```
craft-suite/
├── shared/           2 skills transversaux, appelés par tous les arbres
├── writing/         42 skills d'écriture créative
├── documents/        9 skills de document professionnel
├── engineering/     87 skills d'ingénierie
├── agents/          34 définitions de rôle, transversales au dépôt
├── security/        12 skills de sécurité défensive
├── research/         5 skills de recherche générale
├── career/           7 skills de recherche d'emploi et de candidature
├── opportunity/      9 skills d'idéation, de hackathon et de prospection
├── config/           valeurs propres à l'utilisateur, rien n'est codé en dur
├── control-center/   tableau de bord local optionnel, sans dépendance
├── plugins/          bundles de plugins par domaine, générés depuis les arbres
├── documentation/    documentation technique des arbres
└── tests/            six scripts de validation
```

## Raison d'être

Un agent qui écrit un chapitre, une lettre ou un endpoint produit du plausible
au premier essai. Le plausible n'est pas le correct, et l'écart n'apparaît que
plus tard : à l'échéance, entre les mains du lecteur, en production.

Chaque skill encode la même forme. À quoi sert le travail. Comment il se fait,
sous forme de procédure numérotée. Ce qui doit être vérifié avant de le
déclarer terminé. Quel score il doit atteindre. Ce qu'il refuse de faire.

## Langue

Le dépôt sépare trois langues que l'on confond couramment.

| Couche | De quoi il s'agit | Valeur |
|---|---|---|
| Langue des skills | les instructions elles-mêmes | anglais, pour les 173 skills |
| Langue du système | chemins, identifiants, clés de configuration, commits | anglais |
| Langue de sortie | ce que reçoit le lecteur | la sienne, réglée par projet |

Les skills sont rédigés en anglais pour que le système soit utilisable à
l'international. Ce qu'ils produisent est une décision distincte :
`language.creative_output` vaut français par défaut, parce que l'arbre
d'écriture encode un savoir-faire français, et `language.document_output` se
règle sur la langue de celui qui reçoit le document. Les ressources de
référence de `writing/resources/` restent en français : elles sont ce que les
skills produisent, pas la façon dont ils sont instruits.

## Les arbres

### shared

Deux skills qui n'appartiennent à aucun domaine et que tous appellent.

| Skill | Moment | Produit |
|---|---|---|
| [project-brief](../shared/project-brief/) | avant le travail | l'accord auquel le travail sera comparé |
| [self-critique](../shared/self-critique/) | après le travail | le résultat corrigé, et ce qui a été trouvé |

`project-brief` inspecte l'existant, pose en un seul lot les questions qui
changent la décision, et consigne une hypothèse pour tout ce qu'il n'a pas
demandé. `self-critique` choisit les rôles professionnels qui recevront
réellement le travail, exécute une passe par rôle, et corrige ce qu'il trouve
au lieu de le signaler.

### writing

Écriture créative. L'agent intervient comme romancier, scénariste, directeur
littéraire, critique, documentaliste, correcteur et bêta-lecteur, de la
nouvelle à la saga.

| Catégorie | Skills | Objet |
|---|---|---|
| [core](../writing/core/) | 14 | fondations et production |
| [genres](../writing/genres/) | 15 | thriller, mystère, fantasy, SF, romance, historique |
| [poetry](../writing/poetry/) | 5 | prosodie française et quatre formes |
| [quality](../writing/quality/) | 8 | diagnostic, réécriture, correction, validation |

Index : [writing/README.md](../writing/README.md).

### documents

Documents professionnels destinés à être remis à quelqu'un.

| Catégorie | Skills | Question à laquelle elle répond |
|---|---|---|
| [documentation](../documents/documentation/) | 4 | comment le lecteur comprend et utilise le système |
| [administrative](../documents/administrative/) | 1 | comment un document formel survit au classement et à la citation |
| [publishing](../documents/publishing/) | 2 | à quoi il ressemble, comment il pagine et se rend |
| [communication](../documents/communication/) | 2 | ce que dit une marque, avec quels mots, validé par qui, et sur quels réseaux |

Quatre règles traversent l'arbre : le destinataire est nommé avant la première
phrase ; la langue de sortie est la sienne ; rien n'est affirmé qui n'ait été
vérifié ; et un PDF généré n'est pas un PDF terminé tant que les pages rendues
n'ont pas été regardées.

Index : [documents/README.md](../documents/README.md).

### engineering

Ingénierie logicielle et conduite de projet. L'agent prend un cahier des
charges et livre un système implémenté, testé, documenté, déployé et vérifié
en production.

| Catégorie | Skills | Question à laquelle elle répond |
|---|---|---|
| [dev-skills](../engineering/dev-skills/) | 60 | comment une modification est faite correctement |
| [delivery-skills](../engineering/delivery-skills/) | 11 | quoi construire, dans quel ordre, avec quelle approbation |
| [devops-skills](../engineering/devops-skills/) | 16 | comment le système tourne, se déploie et se restaure |

Agnostique de la pile et de la plateforme : le système lit le projet qu'on lui
confie plutôt que d'en présupposer la forme. Les trente-quatre agents ne sont pas
une catégorie de cet arbre : ils forment une couche transversale au dépôt, dans
[agents](../agents/), qui possède quoi et ce qui est transmis.

Index : [engineering/README.md](../engineering/README.md).

### security

Sécurité défensive et, sous autorisation écrite seulement, assurance.
L'agent construit un système plus difficile à attaquer et audite celui qui
existe, en classant chaque constat par accessibilité et en corrigeant ce que le
code peut corriger.

| Catégorie | Skills | Question à laquelle elle répond |
|---|---|---|
| [secure-development](../security/secure-development/) | 9 | comment un système est construit et durci pour résister |
| [security-assurance](../security/security-assurance/) | 3 | ce qui ne va pas dans un système existant, sans le casser |

Deux règles ne plient jamais : aucune action offensive sans autorisation
écrite, spécifique et dans le périmètre, consignée ; et aucun audit ne conclut
qu'un système est sûr. Il rapporte quels contrôles ont été exécutés, avec quels
résultats, sur quelle révision.

Index : [security/README.md](../security/README.md).

### research

Recherche générale au service d'une décision, distincte de `research-director`
de l'arbre d'écriture, qui sert la fiction. L'agent pose la question, trouve et
lit les sources, vérifie ce qui pèse, et rédige une réponse sur laquelle un
lecteur peut agir et qu'il peut vérifier.

| Catégorie | Skills | Objet |
|---|---|---|
| [research](../research/) | 5 | cadrage, collecte, vérification, comparaison, synthèse |

Une source n'est citée que si elle a réellement été consultée, et un manque est
énoncé honnêtement plutôt que comblé par une invention plausible.

Index : [research/README.md](../research/README.md).

### career

Aider une personne réelle à trouver et décrocher un poste réel. L'agent
construit un profil honnête, trouve de vraies offres à partir de sources en
direct, produit un CV et une lettre qui survivent à un analyseur comme à un
entretien, étudie l'employeur et répète l'entretien.

| Catégorie | Skills | Objet |
|---|---|---|
| [career](../career/) | 7 | profil, recherche d'offres, CV, lettre, étude d'entreprise, préparation d'entretien |

Rien du monde extérieur n'est inventé : une offre est tracée jusqu'à une source
en direct ou écartée. Rien n'est affirmé sur le candidat qu'il ne puisse
soutenir.

Index : [career/README.md](../career/README.md).

### opportunity

Découvrir et évaluer des opportunités, quelle qu'en soit la forme : idées,
hackathons, clients, marchés. Une seule méthode les traverse : découvrir un
champ, l'évaluer face au réel, en recommander quelques-unes avec un
raisonnement, ne jamais déverser une liste de cent.

| Catégorie | Skills | Question à laquelle elle répond |
|---|---|---|
| [ideation](../opportunity/ideation/) | 3 | quelles idées valent la peine, et comment les tester |
| [hackathons](../opportunity/hackathons/) | 3 | quel hackathon rejoindre et comment le gagner |
| [business](../opportunity/business/) | 3 | à qui vendre, comment l'atteindre, si le marché est réel |

Chaque opportunité est ancrée dans quelque chose de vérifiable ou marquée comme
hypothèse, jamais fabriquée. Le livrable est le petit nombre évalué avec ses
prochaines étapes.

Index : [opportunity/README.md](../opportunity/README.md).

## Installation

Aucune dépendance : le dépôt est du Markdown et du shell. Clonez-le et lancez
`bash install.sh`. Rien n'est installé tant que vous n'avez pas choisi : sans
argument, l'installeur demande ce que vous faites réellement et n'installe que
cela, un arbre entier, une catégorie d'un arbre, ou un seul skill avec ses
dépendances résolues. Un développeur ne reçoit jamais la trousse d'un
romancier, et un romancier ne reçoit jamais l'arbre d'ingénierie.
`bash install.sh --configure` écrit ensuite votre configuration.

Toutes les portées, options et catégories, les répertoires cibles, et
l'installation sans cloner : [installation.md](installation.md).

## Configuration

Rien ne présuppose qui vous êtes, quels outils vous employez, ni quelle langue
lisent vos lecteurs. `bash install.sh --configure` ne demande que les champs
utiles à ce que vous avez installé, chacun avec une réponse recommandée déjà
sélectionnée. Deux champs n'auront jamais de valeur par défaut :
`identity.author_name` et `identity.author_email`, parce qu'un commit porte une
personne réelle.

La section `delegation` décide de ce que l'agent peut faire seul : commits,
branches, push, pull requests, tags de version, déploiements, opérations sur
la base de données et changements de dépendances. Tout ce que vous gardez est
préparé et vous est remis avec sa commande, jamais exécuté malgré tout, et
jamais silencieusement laissé de côté.

Les questions, les champs de délégation et leurs valeurs :
[configuration.md](configuration.md). Référence des champs :
[config/README.md](../config/README.md).

## Quel skill me faut-il

| Situation | Skill |
|---|---|
| Je démarre un projet, quel qu'il soit | `shared/project-brief` |
| J'ai fini quelque chose et je veux le faire contrôler | `shared/self-critique` |
| Je démarre un roman | `writing/core/novel-architect` |
| Ma scène est plate | `writing/core/scene-builder` |
| Tous mes personnages parlent pareil | `writing/core/dialogue-master` |
| Mon milieu de roman n'avance pas | `writing/quality/story-doctor` |
| Est-ce publiable | `writing/quality/literary-critic` |
| Un partenaire doit s'intégrer à notre API | `documents/documentation/technical-writing` |
| Un client ne trouve pas comment faire | `documents/documentation/user-documentation` |
| La direction doit décider | `documents/documentation/report-writing` |
| Une lettre formelle doit partir | `documents/administrative/administrative-writing` |
| Le client veut un PDF | `documents/publishing/pdf-production` |
| Une marque a besoin d'une ligne éditoriale ou d'un ton | `documents/communication/editorial-line` |
| Une marque a besoin d'un calendrier de publication, de posts ou d'une politique de modération | `documents/communication/social-content` |
| J'ai une tâche de code | `engineering/dev-skills/engineering-orchestrator` |
| J'ai un bug | `engineering/dev-skills/debugging` |
| J'ai une spécification, pas une tâche | `engineering/delivery-skills/delivery-orchestrator` |
| Quelque chose doit être déployé | `engineering/devops-skills/devops-core` |
| Je dois modéliser une menace ou auditer un système | `security/secure-development/security-core` |
| J'ai une autorisation écrite de tester un système | `security/security-assurance/authorized-pentesting` |
| Je dois documenter une question avec de vraies sources | `research/research-core` |
| Je cherche un emploi | `career/career-core` |
| Il me faut des idées, puis les bonnes | `opportunity/ideation/opportunity-core` |
| Je veux trouver et gagner un hackathon | `opportunity/hackathons/hackathon-discovery` |
| Je dois trouver des clients ou dimensionner un marché | `opportunity/business/client-discovery` |

Répertoire complet :
[documentation/skills-guide.md](skills-guide.md).

## Utiliser un skill

Chaque skill est un dossier autonome :

```
skill-name/
├── SKILL.md      l'expertise : procédure, seuils, refus
├── README.md     résumé, entrées, sorties, dépendances, configuration
├── examples/     au moins un exemple appliqué
└── resources/    au moins une grille, checklist ou référence
```

Son README annonce ses dépendances en quatre lignes. `Depends on: nothing`
signifie qu'il fonctionne seul : copiez le dossier et servez-vous-en. Un skill
qui dépend d'un autre y renvoie sans le recopier, donc l'autre est nécessaire.

Dix skills ne dépendent de rien et fonctionnent entièrement seuls, une
constitution par arbre plus la paire transversale :
`shared/self-critique`, `shared/project-brief`,
`writing/core/writing-constitution`,
`documents/documentation/document-core`,
`engineering/dev-skills/engineering-core`,
`engineering/devops-skills/devops-core`,
`security/secure-development/security-core`,
`research/research-core`,
`career/career-core`,
`opportunity/ideation/opportunity-core`.

## Agents

Trente-quatre définitions de rôles, pour un runtime qui accepte des sous-agents.

```
Skill          comment ce type de travail se fait correctement
Agent          qui possède ce travail, ce qu'il peut toucher, ce qu'il transmet
Orchestration  quels agents interviennent, dans quel ordre, avec quelles portes
```

Un agent est mince par construction : il cite les skills qu'il emploie et n'en
recopie aucun. Pour une tâche unique, les skills suffisent : installez avec
`--no-agents` et laissez `engineering-orchestrator` les enchaîner dans un seul
contexte.

Détail : [documentation/agents.md](agents.md).

## Dépendances entre skills

```
project-brief
    -> requirements-analysis -> architecture-proposal -> validation-gate
    -> implémentation -> testing-quality -> security-audit
    -> code-review-protocol -> release-readiness
    -> self-critique
```

Chaque arbre a une constitution que tous ses skills citent et qu'aucun ne
recopie :

| Arbre | Constitution |
|---|---|
| writing | `writing/core/writing-constitution` |
| documents | `documents/documentation/document-core` |
| engineering | `engineering/dev-skills/engineering-core` |
| engineering, exploitation | `engineering/devops-skills/devops-core` |
| security | `security/secure-development/security-core` |
| research | `research/research-core` |
| career | `career/career-core` |
| opportunity | `opportunity/ideation/opportunity-core` |

`tests/validate-orchestration.sh` vérifie que chaque dépendance déclarée et
chaque renvoi croisé se résout, si bien que les déclarations sont exactes et
non déclaratives.

## Ce que le système refuse

```
deviner ce que le dépôt peut établir
affirmer sans avoir exécuté
écrire une commande dans un document sans l'avoir lancée d'abord
inventer une référence légale, un numéro d'enregistrement ou une institution
laisser une fonctionnalité factice sur un chemin atteignable
écrire du code de production avant l'approbation de l'architecture
affaiblir un test pour obtenir un pipeline vert
coder en dur une valeur qui varie selon l'environnement
exécuter une instruction destructrice sans compter les lignes d'abord
déclarer un déploiement réussi sans avoir exercé un parcours
livrer un PDF dont les pages n'ont jamais été rendues ni regardées
attribuer un commit à un outil
```

Deux interdits s'appliquent à tous les fichiers du dépôt, y compris celui-ci :
**aucun emoji**, **aucun tiret cadratin**. Les deux sont vérifiés par
`tests/validate-rules.sh`.

## Plugins

La suite est aussi distribuée en plugins Claude Code, un par domaine, pour
n'installer que les domaines voulus. Les arbres sont la source de vérité
unique : les bundles sous `plugins/` sont générés depuis eux par
`bash plugins/build.sh`, et `tests/validate-plugins.sh` vérifie qu'ils restent
synchronisés. Le chemin `install.sh` continue de fonctionner tel quel.

Les plugins, ce que chaque bundle emporte et la commande du marketplace :
[plugins.md](plugins.md).

## Control Center

Un tableau de bord local optionnel, sans dépendance, qui lit les données de
session, les skills et la configuration déjà présents sur la machine et montre
l'usage, les tokens, les modèles, les outils, les projets et l'état du système.

```bash
bash install.sh --control-center     # démarre un serveur local, ouvre le navigateur
bash install.sh --report             # les mêmes chiffres en rapport texte
```

Il est optionnel : chaque skill fonctionne sans lui. Il n'écoute que sur
`127.0.0.1`, lit des fichiers locaux et ne garde rien en propre. Chaque chiffre
est lu depuis les données locales réelles ; une mesure qui ne peut être établie
est affichée comme indisponible, jamais inventée. Détail :
[control-center/README.md](../control-center/README.md).

## Validation

```bash
bash tests/validate-structure.sh      structure et métadonnées des 173 skills
bash tests/validate-rules.sh          emoji, tiret cadratin, secrets, identité codée en dur
bash tests/validate-orchestration.sh  plans, phases, agents, renvois croisés
bash tests/validate-plugins.sh        bundles de plugins synchronisés avec les arbres
bash tests/validate-model-routing.sh  fixtures de routage contre la table de tiers
bash tests/validate-counts.sh         chaque compte écrit contre les arbres
```

Les six doivent passer avant tout commit. Détail dans
[tests/README.md](../tests/README.md).

## Documentation

| Fichier | Contenu |
|---|---|
| [documentation/architecture.md](architecture.md) | organisation, isolation des skills, métadonnées |
| [documentation/skills-guide.md](skills-guide.md) | répertoire des 173 skills |
| [documentation/installation.md](installation.md) | installation complète et par skill |
| [documentation/configuration.md](configuration.md) | le contrat de configuration |
| [documentation/agents.md](agents.md) | skill, agent, orchestration |
| [documentation/documents-system.md](documents-system.md) | l'arbre documents en détail |
| [documentation/engineering-system.md](engineering-system.md) | la couche dev-skills en détail |
| [documentation/delivery-system.md](delivery-system.md) | livraison, exploitation et agents |
| [documentation/writing-rules.md](writing-rules.md) | les règles d'écriture, version opérationnelle |
| [documentation/workflow.md](workflow.md) | le workflow d'écriture, phase par phase |
| [documentation/branch-protection.md](branch-protection.md) | qui peut écrire sur main et dev, et comment |
| [CONTINUITY.md](../CONTINUITY.md) | état du dépôt pour celui qui reprend |
| [CHANGELOG.md](../CHANGELOG.md) | historique des versions |

La documentation technique est rédigée en anglais, langue du système. Ce
fichier et le README anglais sont les deux points d'entrée équivalents.

## Contribuer

Partir de `dev`. Jamais de `main`.

```bash
git switch dev && git pull
git switch -c feat/ma-modification
git config core.hooksPath .githooks    # une fois par clone
# travail, commit
git push -u origin feat/ma-modification  # puis ouvrir une pull request vers dev
```

`main` est la branche de publication et ne reçoit que des pull requests
venues de `dev`, ouvertes par un mainteneur. Les deux branches exigent une
pull request, un `validate` au vert et l'approbation d'un propriétaire listé
dans [.github/CODEOWNERS](../.github/CODEOWNERS).

Ajouter un skill suppose : créer le dossier avec ses quatre éléments, déclarer
les métadonnées, renvoyer à la constitution de son arbre sans la recopier,
ajouter au moins un exemple et une ressource, mettre à jour l'index de
catégorie et `documentation/skills-guide.md`, puis exécuter les six scripts.

Règles complètes : [CONTRIBUTING.md](../CONTRIBUTING.md). Règles de branche et
leur mise en place :
[documentation/branch-protection.md](branch-protection.md).

## Philosophie

- La contrainte produit le style. Les règles éliminent le bruit, pas la
  liberté.
- Un texte se juge sur l'effet produit, jamais sur l'intention.
- Un système se juge sur ce qui a été exécuté, jamais sur ce qui a été prévu.
- La cohérence est une forme de respect, du lecteur comme de l'ingénieur
  suivant.
- Un skill doit rester utile au chapitre 3 comme au chapitre 90, au premier
  commit comme au centième.
- Toute règle énoncée doit être vérifiable par une procédure explicite.
- La sévérité critique est un service rendu, pas une posture.

## Auteur

**Lauret Chacha**

| | |
|---|---|
| GitHub | [@Handsomeboy990](https://github.com/Handsomeboy990) |
| Portfolio | [lauret-chacha.vercel.app](https://lauret-chacha.vercel.app) |
| LinkedIn | [in/lauret-chacha](https://linkedin.com/in/lauret-chacha) |
| Courriel | lauretchacha@gmail.com |

## Licence

MIT. Voir [LICENSE](../LICENSE).

Copyright (c) 2026 Lauret Chacha (Handsomeboy990).
