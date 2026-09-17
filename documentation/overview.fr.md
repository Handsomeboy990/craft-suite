# Craft Suite

Des systèmes d'expertise pour un agent, dans un seul dépôt : **écrire**,
**produire des documents**, **construire des logiciels**, **les sécuriser**,
**faire de la recherche**, **mener une recherche d'emploi**, **découvrir et
évaluer des opportunités**, et **relire son propre travail**.

Le dépôt s'appelait `claude-writer-suite` jusqu'à la version 3.0.0, quand
l'arbre d'écriture a cessé d'en être la totalité.

165 skills et 22 agents. Pas des prompts : des protocoles numérotés, des
critères de décision, des grilles d'évaluation et des procédures de révision,
chacun avec un seuil chiffré de ce qui compte comme terminé.

[English version](overview.md)

```
craft-suite/
├── shared/           2 skills transversaux, appelés par tous les arbres
├── writing/         42 skills d'écriture créative
├── documents/        7 skills de document professionnel
├── engineering/     81 skills d'ingénierie
├── agents/          16 définitions de rôle, transversales au dépôt
├── security/        12 skills de sécurité défensive
├── research/         5 skills de recherche générale
├── career/           7 skills de recherche d'emploi et de candidature
├── opportunity/      9 skills d'idéation, de hackathon et de prospection
├── config/           valeurs propres à l'utilisateur, rien n'est codé en dur
├── control-center/   tableau de bord local optionnel, sans dépendance
├── plugins/          bundles de plugins par domaine, générés depuis les arbres
├── documentation/    documentation technique des arbres
└── tests/            cinq scripts de validation
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
| Langue des skills | les instructions elles-mêmes | anglais, pour les 165 skills |
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
| [dev-skills](../engineering/dev-skills/) | 54 | comment une modification est faite correctement |
| [delivery-skills](../engineering/delivery-skills/) | 11 | quoi construire, dans quel ordre, avec quelle approbation |
| [devops-skills](../engineering/devops-skills/) | 16 | comment le système tourne, se déploie et se restaure |

Agnostique de la pile et de la plateforme : le système lit le projet qu'on lui
confie plutôt que d'en présupposer la forme. Les seize agents ne sont pas une
catégorie de cet arbre : ils forment une couche transversale au dépôt, dans
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

Aucune dépendance. Le dépôt est du Markdown et du shell.

```bash
git clone <url-du-depot> craft-suite
cd craft-suite
bash install.sh
```

**Rien n'est installé tant que vous n'avez pas choisi.** Sans argument,
l'installeur demande ce que vous faites réellement et n'installe que cela. Un
développeur ne reçoit jamais la trousse d'un romancier, et un romancier ne
reçoit jamais l'arbre d'ingénierie.

```
   1) Creative writing        42 skills   romans, poésie, scénario, édition
   2) Professional documents   7 skills   guides, manuels, rapports, lettres, PDF
   3) Software engineering    81 skills   plus 22 agents
   4) Cybersecurity           10 skills   modèles de menace, audits, durcissement
   5) Research                 5 skills   sources, vérification, synthèse
   6) Career                   7 skills   recherche d'emploi, CV, entretiens
   7) Opportunity              9 skills   idéation, hackathons, prospection
   8) Everything             165 skills   plus 22 agents
   9) Individual skills, chosen by name
  10) One or more categories, for example genres only

Choice [1]:
```

Plusieurs numéros sont acceptés : `1 2` installe l'écriture et les documents.

Puis la configuration :

```bash
bash install.sh --configure
```

### Choisir sans passer par la question

```bash
bash install.sh --writing      les 42 skills d'écriture
bash install.sh --documents     les 7 skills de document
bash install.sh --dev          les 81 skills d'ingénierie et les 22 agents
bash install.sh --security     les 12 skills de sécurité défensive
bash install.sh --research      les 5 skills de recherche générale
bash install.sh --career        les 7 skills de recherche d'emploi
bash install.sh --opportunity   les 9 skills d'idéation, hackathon et prospection
bash install.sh --all          tout
bash install.sh --shared        les 2 skills transversaux seulement
bash install.sh --agents        les 22 agents seulement
bash install.sh --no-agents     les skills sans les agents
bash install.sh --all --zip     construit aussi une archive par skill dans dist/
bash install.sh --remove        désinstalle la portée choisie
```

Les portées se combinent : `bash install.sh --writing --documents`.

Chaque portée installe aussi les deux skills transversaux, `self-critique` et
`project-brief`, parce que tous les arbres les appellent. Une désinstallation
partielle les conserve, si bien que retirer un arbre n'en casse jamais un
autre.

### Par catégorie

Un arbre entier est souvent plus que nécessaire. Un auteur de thrillers n'a
que faire de la prosodie.

```bash
bash install.sh --group genres            15 skills, plus la paire transversale
bash install.sh --group genres,quality    deux catégories
bash install.sh --group writing/poetry    le chemin complet fonctionne aussi
bash install.sh --group devops-skills     l'exploitation seule
```

| Catégorie | Skills | Arbre |
|---|---|---|
| `core` | 14 | writing |
| `genres` | 15 | writing |
| `poetry` | 5 | writing |
| `quality` | 8 | writing |
| `documentation` | 4 | documents |
| `administrative` | 1 | documents |
| `publishing` | 2 | documents |
| `dev-skills` | 54 | engineering |
| `delivery-skills` | 11 | engineering |
| `devops-skills` | 16 | engineering |
| `secure-development` | 9 | security |
| `security-assurance` | 2 | security |
| `research` | 5 | research |
| `career` | 7 | career |
| `ideation` | 3 | opportunity |
| `hackathons` | 3 | opportunity |
| `business` | 3 | opportunity |
| `shared` | 2 | shared |

Tout se combine, et le résultat est dédoublonné :

```bash
bash install.sh --group poetry --skill thriller
12 skills installed
```

Les cinq skills de poésie, `thriller` et ses quatre dépendances,
`writing-constitution` compté une seule fois, et la paire transversale.

Les agents suivent l'arbre d'ingénierie, pas une de ses catégories. Ajoutez
`--agents` si vous installez `--group dev-skills` seul.

### Un seul skill à la fois

```bash
bash install.sh --list                    tous les skills et leur objet
bash install.sh --skill thriller          un skill, et ce dont il a besoin
bash install.sh --skill sonnet,haiku      plusieurs
```

Les dépendances sont résolues de proche en proche : un skill isolé n'est
jamais installé cassé.

```
$ bash install.sh --skill thriller
7 skills installed
Installed: thriller writing-constitution novel-architect scene-builder
           chapter-architect self-critique project-brief
```

Un nom inconnu interrompt l'installation au lieu de la raccourcir en silence.

### Sans cloner d'abord

```bash
curl -fsSL <url-brute>/install.sh | bash -s -- --writing
```

Le script récupère les skills dans `~/.cache/craft-suite` quand il n'en
trouve aucun à côté de lui. Sans portée, il pose quand même la question, en
lisant la réponse sur le terminal et non sur le tube. Si le dépôt est privé,
clonez-le et lancez `install.sh` depuis l'intérieur.

Les skills vont dans `~/.claude/skills`, les agents dans `~/.claude/agents`, la
configuration dans `~/.claude/craft.config.yaml`. Les trois cibles sont
configurables par `CLAUDE_SKILLS_DIR`, `CLAUDE_AGENTS_DIR` et
`CLAUDE_CONFIG_FILE`.

Détail complet, y compris l'installation d'un seul skill :
[documentation/installation.md](installation.md).

## Configuration

Rien ne présuppose qui vous êtes, quels outils vous employez, ni quelle langue
lisent vos lecteurs.

```bash
bash install.sh --configure
```

Chaque question a une réponse recommandée, déjà sélectionnée : la touche
entrée l'accepte. Seuls les champs utiles à la portée installée sont demandés.

Deux champs sont obligatoires et n'auront jamais de valeur par défaut :
`identity.author_name` et `identity.author_email`. Un commit porte une
personne réelle, et `git-workflow` s'arrête en nommant le champ manquant
plutôt que d'en inventer un. L'installeur refuse un nom d'auteur qui ressemble
à un outil.

### Ce que l'agent peut faire seul

La section `delegation` décide de ce qui vous parvient sous forme d'action
terminée et de ce qui vous parvient sous forme d'étape préparée.

| Champ | Valeurs |
|---|---|
| `commits` | yes, stage-only, no |
| `branches` | yes, no |
| `push` | yes, branch-only, no |
| `pull_requests` | yes, draft, no |
| `release_tags` | yes, no |
| `deployments` | yes, non-production, no |
| `database_operations` | yes, non-production, no |
| `dependency_changes` | yes, with-justification, no |

Répondez non à tout ce que vous préférez faire vous-même. L'agent s'arrête à
cette frontière, vous remet ce qu'il a préparé, et nomme l'étape.

Tout ce que vous gardez est écrit dans `craft-manual-tasks.md`, à côté
du fichier de configuration, avec la commande correspondante. Rien n'est
silencieusement laissé de côté.

Deux règles ne se délèguent jamais : une opération destructrice est comptée et
confirmée avant d'être exécutée, et un secret fuité est signalé pour rotation
plutôt que discrètement supprimé.

Référence des champs : [config/README.md](../config/README.md). Côté installeur :
[documentation/configuration.md](configuration.md).

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

Seize définitions de rôles, pour un runtime qui accepte des sous-agents.

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
n'installer que les domaines voulus.

```
/plugin marketplace add Handsomeboy990/craft-suite
/plugin install craft-security
```

| Plugin | Installe |
|---|---|
| `craft-writing` | l'arbre d'écriture, 42 skills |
| `craft-documents` | l'arbre des documents, 7 skills |
| `craft-engineering` | l'arbre d'ingénierie, 81 skills et 22 agents |
| `craft-security` | l'arbre de sécurité, 10 skills |
| `craft-research` | l'arbre de recherche, 5 skills |
| `craft-career` | l'arbre d'emploi, 7 skills |
| `craft-opportunity` | l'arbre des opportunités, 9 skills |

Les arbres sont la source de vérité unique. Les bundles sous `plugins/` sont
générés depuis eux par `bash plugins/build.sh`, et `tests/validate-plugins.sh`
vérifie qu'ils restent synchronisés. Le chemin `install.sh` continue de
fonctionner tel quel.

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
bash tests/validate-structure.sh      structure et métadonnées des 165 skills
bash tests/validate-rules.sh          emoji, tiret cadratin, secrets, identité codée en dur
bash tests/validate-orchestration.sh  plans, phases, agents, renvois croisés
bash tests/validate-plugins.sh        bundles de plugins synchronisés avec les arbres
bash tests/validate-model-routing.sh  fixtures de routage contre la table de tiers
```

Les cinq doivent passer avant tout commit. Détail dans
[tests/README.md](../tests/README.md).

## Documentation

| Fichier | Contenu |
|---|---|
| [documentation/architecture.md](architecture.md) | organisation, isolation des skills, métadonnées |
| [documentation/skills-guide.md](skills-guide.md) | répertoire des 165 skills |
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
catégorie et `documentation/skills-guide.md`, puis exécuter les cinq scripts.

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
