# Utiliser Craft Suite

Tous les autres documents décrivent une partie du dépôt. Celui-ci décrit ce
qu'on en fait, dans l'ordre, du clone jusqu'au moment où l'on peut dire si ça
marche.

[English version](usage.md)

## 1. Ce que c'est, et ce qui l'exécute

Le dépôt est une bibliothèque. Il ne contient aucun programme. Un skill est un
fichier Markdown qui porte une procédure numérotée, un agent est un fichier
Markdown qui décrit un rôle. Rien ici ne s'exécute.

Ce qui les exécute, c'est un runtime d'agent qui lit les skills sur le disque.
Claude Code est celui contre lequel cette suite est écrite : il lit
`~/.claude/skills` et, pour les agents, `~/.claude/agents`. Tout runtime qui
lit la même disposition fonctionne pareil. Lancer `install.sh` sans un tel
runtime installé copie des fichiers que rien n'ouvrira jamais.

La première question n'est donc pas quel arbre installer. C'est de savoir si
vous avez un hôte qui lit `~/.claude/skills`. Sinon, installez-le d'abord.

## 2. Installer

Deux chemins, qui aboutissent au même endroit.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh --dev
```

ou, par le marketplace de plugins, un domaine à la fois :

```
/plugin marketplace add Handsomeboy990/craft-suite
/plugin install craft-engineering
```

Installez l'arbre dont vous vous servirez vraiment. L'installeur ne choisit
jamais pour vous, et une portée non installée ne vous coûte rien. Toutes les
options sont dans [installation.md](installation.md), en anglais.

## 3. Configurer, une fois

```bash
bash install.sh --configure
```

Ce n'est pas un ornement optionnel. La commande écrit deux fichiers :

| Fichier | Contenu |
|---|---|
| `~/.claude/craft.config.yaml` | qui vous êtes, la langue de vos lecteurs, ce que l'agent peut faire sans demander |
| `~/.claude/craft-manual-tasks.md` | chaque étape que vous avez gardée, avec la commande exacte à lancer vous-même |

Les deux questions sans valeur par défaut sont `identity.author_name` et
`identity.author_email`. `git-workflow` s'arrête et nomme celle qui manque
plutôt que d'inventer une valeur : un historique qui attribue le travail à un
outil n'est auditable par personne.

Les huit questions de `delegation` sont celles qui méritent qu'on ralentisse.
Chaque réponse autre qu'un oui franc sort cette étape des mains de l'agent et
la met dans `craft-manual-tasks.md`. Répondez-y comme vous répondriez à un
nouveau collègue qui demande ce qu'il peut pousser sans vérifier.

Relancer `--configure` est sans risque. La commande garde chaque réponse déjà
donnée, ne vide pas les sections que sa portée n'a pas interrogées, et laisse
`model_routing` et `career`, qu'elle ne demande jamais, exactement comme vous
les avez écrites. Référence des champs : [configuration.md](configuration.md).

## 4. Comment un skill arrive réellement dans la conversation

C'est la partie que rien d'autre n'explique dans le dépôt, et celle que l'on
comprend de travers.

Vous ne chargez pas un skill. Vous décrivez votre tâche, et l'hôte choisit.

Chaque `SKILL.md` s'ouvre sur un bloc d'en-tête. Un seul champ constitue toute
l'interface :

```yaml
---
name: thriller
description: Writes a thriller: vital stake, visible deadline, competent
  antagonist, rising cost, tension mechanics, short chapters, procedural
  credibility. Use to build or revise a thriller, a countdown narrative or a
  race against time.
---
```

L'hôte lit `description` et la compare à ce que vous avez demandé. C'est pour
cela que chaque description du dépôt se termine par une phrase qui commence par
« Use to » ou « Use when » : elle est écrite pour le sélecteur, pas pour vous.
Le reste du fichier n'est lu qu'une fois le skill retenu.

Deux conséquences à garder :

- **Nommer le skill n'est pas nécessaire, et reste permis.** « Écris-moi
  l'ouverture d'un thriller » atteint `thriller` tout seul. « Utilise le skill
  thriller » marche aussi, et c'est le chemin le plus court quand vous savez
  déjà lequel vous voulez.
- **La sélection est le comportement de l'hôte, pas celui de ce dépôt.** Rien
  ici ne l'impose. Si votre hôte ne lit pas les descriptions de skills, rien de
  tout cela ne se produit et les fichiers restent fermés.

`depends_on`, dans l'en-tête, n'est lu qu'à l'installation. C'est ainsi
qu'`install.sh` décide quoi copier d'autre pour qu'un skill n'atterrisse jamais
sans ce à quoi il renvoie. Rien ne le lit pendant que vous travaillez.

## 5. Quoi dire, selon la nature de la demande

La suite route sur la nature de la demande, pas sur son sujet. Un rapport à
propos d'un roman est un document, pas de la fiction. Voici la table que
l'agent utilise lui-même, tirée d'[AGENTS.md](../AGENTS.md) :

| Ce que vous demandez | Le skill qui prend la demande |
|---|---|
| Un projet significatif, ou la reprise d'un projet existant | `project-brief` |
| Fiction, poésie, scénario, révision de texte | `writing-constitution` |
| Un document livré : rapport, lettre, manuel, PDF | `document-core` |
| Une tâche de code unique : feature, bug, revue, refactor | `engineering-orchestrator` |
| Une spécification, un cahier des charges, une demande client | `delivery-orchestrator` |
| Environnement, pipeline, déploiement, base en production, secret | `devops-core` |
| Valider un produit entier, ou une campagne de QA | `quality-engineering` |
| Un système de production dégradé | `incident-response` |
| Modélisation de menaces, audit de sécurité, durcissement | `security-core` |
| Test actif sous autorisation écrite | `authorized-pentesting` |
| Chercher une réponse avec de vraies sources citées | `research-core` |
| Recherche d'emploi, CV, lettre, préparation d'entretien | `career-core` |
| Générer et évaluer des idées | `opportunity-core` |
| Trouver ou gagner un hackathon | `hackathon-discovery` |
| Trouver des clients ou dimensionner un marché | `client-discovery` |
| Tout ce qui vient d'être terminé | `self-critique` |

Chacun est une constitution ou un orchestrateur. Il charge ce dont la tâche a
réellement besoin et laisse le reste tranquille. Une correction de faute fait
quatre étapes, un endpoint de paiement en fait onze. Dérouler la chaîne entière
par réflexe est précisément le défaut que les orchestrateurs sont écrits pour
empêcher.

## 6. Ce que « terminé » veut dire, et pourquoi la première réponse est plus lente

La raison d'installer ceci plutôt que rien, ce sont les portes. Ce sont elles
qui transforment un premier jet plausible en quelque chose de remettable.

| Vous avez demandé | Ce qui doit arriver avant que ce soit déclaré fini |
|---|---|
| Une correction de bug | le reproduire, nommer la cause à un fichier et une ligne, corriger, ajouter un test qui échoue sans le correctif |
| Un endpoint | fixer le contrat d'abord, implémenter, puis passer une revue indépendante avec un test exécuté et observé |
| Un rapport | nommer le destinataire, commencer par la conclusion, attribuer chaque chiffre, énoncer l'incertitude |
| Un PDF | rendre les pages et les regarder : coupes, lignes orphelines, tableaux cassés, glyphes manquants |
| Un chapitre | `self-critique-protocol`, puis au moins un skill de révision |
| Un déploiement | `production-verification` avant d'annoncer quoi que ce soit comme livré |
| Un audit de sécurité | quels contrôles ont tourné, avec quels résultats, sur quelle révision, et jamais un verdict « sûr » |

Elles sont énoncées une fois, dans [AGENTS.md](../AGENTS.md) sous « Mandatory
gates », et référencées partout ailleurs. Une porte ne saute pas pour gagner du
temps. Si vous voulez une réponse rapide sans porte, dites-le : la porte est une
discipline que l'agent suit, elle peut donc être levée délibérément, ce qui
n'est pas la même chose que d'être oubliée.

## 7. Les agents, et quand ne pas s'en servir

Les définitions d'agents de `~/.claude/agents` sont des rôles pour un runtime
qui accepte des sous-agents. Le dépôt en compte 25 ; `--dev` en installe 24 et
`--security` deux, donc le nombre que vous avez dépend de la portée choisie.
Deux règles les gouvernent toutes :

- **Ils ne servent que sur demande explicite.** Un agent est un contexte
  séparé avec son propre budget. Pour une tâche unique, les skills suffisent, et
  `engineering-orchestrator` les séquence dans un seul contexte. Installez avec
  `--no-agents` si vous n'en voulez jamais.
- **Un agent reste mince.** L'expertise vit dans le skill qu'il cite. Un agent
  décide qui possède un morceau de travail, ce qu'il a le droit de toucher, et
  ce qu'il transmet.

Demandez-en un par son nom quand le travail se sépare vraiment : « fais auditer
ça par le security engineer », « lance une vérification finale ». La liste et ce
que chacun possède sont dans [agents.md](agents.md).

La limite honnête, consignée plutôt que cachée : la section Boundaries d'un
agent est une discipline écrite, pas une garantie du runtime. Un runtime qui
donne à chaque sous-agent un accès en écriture complet n'en applique aucune.

## 8. Au quotidien

**La liste des tâches manuelles.** Tout ce que vous avez gardé dans
`delegation` est écrit dans `~/.claude/craft-manual-tasks.md` avec la commande
de chaque étape. Quand l'agent atteint une de ces frontières, il s'arrête, vous
remet ce qu'il a préparé, et nomme l'étape. Il ne la fait jamais quand même, et
ne la passe jamais sous silence. Lisez ce fichier une fois après la
configuration : c'est le contrat que vous avez signé.

**Deux règles ne se délèguent jamais**, quelle qu'ait été votre réponse : une
opération destructrice est comptée et confirmée avant d'être exécutée, et un
secret fuité est signalé pour rotation plutôt que discrètement supprimé.

**Des exemples complets**, si vous voulez voir un déroulé avant d'en lancer un :

| Exemple | Montre |
|---|---|
| `engineering/examples/delivery-link-shortener/` | les quatorze phases de livraison sur une petite application, les quatre portes d'approbation en arrêts explicites |
| `documents/examples/jeu-conges/` | un même sujet écrit pour trois lecteurs différents, chacun passé par la porte en huit points |

**Optionnel, et seulement si vous avez `python3` :**

```bash
bash install.sh --control-center    un tableau de bord local, sans réseau
bash install.sh --report            les mêmes données en texte
```

Les deux lisent vos données de session locales et rapportent des motifs
mesurés. Aucun n'affirme qu'un travail a été gaspillé ; `control-center/README.md`
dit ce qu'il refuse de prétendre.

## 9. Vérifier que ça marche

```bash
ls ~/.claude/skills | wc -l
ls ~/.claude/agents | wc -l
cat ~/.claude/craft.config.yaml
```

Ce que chaque portée doit afficher, les deux skills communs déjà comptés :

| Portée | Skills | Agents |
|---|---|---|
| `--writing` | 44 | 0 |
| `--documents` | 9 | 0 |
| `--dev` | 84 | 24 |
| `--security` | 18 | 2 |
| `--research` | 7 | 0 |
| `--career` | 9 | 0 |
| `--opportunity` | 11 | 0 |
| `--shared` | 2 | 0 |
| `--all` | 166 | 25 |
| `--agents` | 0 | 25 |

L'installeur affiche les deux mêmes nombres quand il termine, donc un écart se
voit sans rien compter à la main. Après une installation `--dev`, il vérifie en
plus que les champs d'identité existent et nomme celui qui manque.

Ensuite, demandez quelque chose de petit et regardez si une porte se déclenche.
« Corrige cette faute et dis-moi ce que tu as vérifié » est un bon premier
test : la réponse doit nommer ce qui a été exécuté, pas affirmer que tout va
bien.

Pour vérifier le dépôt lui-même plutôt que votre installation :

```bash
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
bash tests/validate-plugins.sh
bash tests/validate-model-routing.sh
bash tests/validate-counts.sh
```

Ce que chacun vérifie : [../tests/README.md](../tests/README.md).

## 10. Mettre à jour, désinstaller

```bash
git switch main && git pull
bash install.sh --dev          la portée que vous aviez installée
```

Installer écrase les répertoires de skills que la portée gère et laisse les
autres intacts, donc relancer une portée met à jour exactement ce que vous
avez. La configuration n'est jamais touchée.

```bash
bash install.sh --writing --remove
bash install.sh --all --remove
```

Une suppression ciblée garde les deux skills communs, puisqu'un autre arbre
peut encore s'en servir, et garde pour la même raison tout skill tiré d'un
autre arbre. Seuls `--all --remove` et `--shared --remove` retirent la paire.
Désinstaller n'efface jamais la configuration : son chemin est affiché pour que
vous la supprimiez délibérément.

## 11. Ce que ceci ne fait pas

Énoncé pour être choisi, pas découvert.

- Cela ne force pas l'agent à exécuter les procédures. Cela les rend
  disponibles et les énonce précisément. Chaque porte ici est une discipline
  que le modèle suit, pas quelque chose qu'un runtime impose.
- Cela ne connaît pas votre stack. L'arbre d'ingénierie lit le projet qu'on lui
  donne et s'y adapte. Des champs comme `engineering.database` sont des
  préférences pour un projet neuf ; le projet l'emporte quand il a déjà tranché.
- Le routage de modèle recommande un palier et, là où le levier existe, un
  effort. Il ne peut pas imposer l'effort sur un dispatch quelconque. Seul le
  choix du modèle est un vrai levier.
- C'est une bibliothèque, pas un service. Rien ne téléphone, rien n'est
  collecté, et le Control Center ne lit que des fichiers déjà sur votre disque.

## Pour aller plus loin

| Vous voulez | Lisez |
|---|---|
| Toutes les options d'installation | [installation.md](installation.md) |
| Tous les champs de configuration | [configuration.md](configuration.md), `config/README.md` |
| Le catalogue complet, arbre par arbre | [overview.fr.md](overview.fr.md) |
| Une ligne par skill | [skills-guide.md](skills-guide.md) |
| La liste des agents et leurs contrats | [agents.md](agents.md) |
| Comment les pièces s'emboîtent | [architecture.md](architecture.md) |

La documentation détaillée de l'installation et de la configuration n'existe
qu'en anglais. Cette page et [overview.fr.md](overview.fr.md) sont les deux
documents français.
