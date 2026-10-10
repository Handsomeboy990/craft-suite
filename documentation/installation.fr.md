# Installation

Les skills et les agents sont du Markdown, l'installeur est du shell. Aucun
runtime ni aucun gestionnaire de paquets n'est nécessaire pour s'en servir.

[English version](installation.md)

Si vous découvrez la suite, lisez d'abord [usage.fr.md](usage.fr.md) : il dit
ce qui exécute ces skills, ce qui se passe après l'installation, et comment un
skill finit par être utilisé. Cette page couvre l'installation elle-même.

## Prérequis

| Outil | Nécessaire pour |
|---|---|
| `bash` 4 ou plus récent | l'installeur et les scripts de validation |
| `git` | le clonage, et le skill `git-workflow` |
| `zip` | le mode optionnel `--zip` seulement |
| `python3` | `--control-center` et `--report` seulement |
| `curl` | l'installation sans clonage seulement |

Optionnels, et seulement pour `pdf-production` : `pdfinfo`, `pdffonts`,
`pdftotext` et `pdftoppm` de Poppler, plus `qpdf`. Quand ils manquent, le skill
dit lesquels de ses contrôles n'ont pas pu tourner plutôt que de laisser
entendre qu'ils sont passés.

## Choisir ce qu'on installe

L'installeur ne décide jamais à votre place. Sans argument, il demande, et il
n'installe que ce que vous choisissez. C'est délibéré : les huit arbres servent
des gens différents, et un développeur n'a que faire d'un skill de prosodie.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh
```

```
   1) Creative writing        42 skills   romans, poésie, scénario, édition
   2) Professional documents   9 skills   guides, manuels, rapports, lettres, PDF
   3) Software engineering    87 skills   plus 29 agents
   4) Cybersecurity           12 skills   modèles de menace, audits, durcissement
   5) Research                 5 skills   sources, vérification, synthèse
   6) Career                   7 skills   recherche d'emploi, CV, entretiens
   7) Opportunity              9 skills   idéation, hackathons, prospection
   8) Everything             173 skills   plus 34 agents
   9) Individual skills, chosen by name
  10) One or more categories, for example genres only

Choice [1]:
```

Plusieurs numéros peuvent être donnés, séparés par des espaces. `1 2` installe
l'écriture et les documents.

Sans terminal disponible et sans portée donnée, l'installeur refuse et affiche
les options au lieu de deviner. Il ne se rabat jamais sur une installation
complète.

## Installation par portée

```bash
bash install.sh --writing      les 42 skills d'écriture créative
bash install.sh --documents     les 9 skills de documents professionnels et 1 agent
bash install.sh --dev          87 skills d'ingénierie et 29 agents
bash install.sh --security     12 skills de sécurité défensive et 3 agents
bash install.sh --research      5 skills de recherche générale et 2 agents
bash install.sh --career        les 7 skills de recherche d'emploi et de candidature
bash install.sh --opportunity   les 9 skills d'idéation, de hackathon et de prospection
bash install.sh --all          tout
bash install.sh --shared        les 2 skills transversaux seulement
bash install.sh --agents        les 34 agents seulement
bash install.sh --no-agents     les skills sans les agents
bash install.sh --remove        désinstalle la portée au lieu de l'installer
```

Ce sont les comptes des arbres. Le nombre que l'installeur affiche à la fin est
plus grand, parce qu'il compte ce qui est réellement arrivé sur le disque :
voir [le tableau en fin de page](#vérifier-linstallation).

Les portées se combinent entre elles, ainsi qu'avec `--zip` et `--remove` :

```bash
bash install.sh --writing --documents
bash install.sh --dev --zip
bash install.sh --writing --remove
```

Quatre portées portent leurs propres agents : `--dev` installe l'équipe de
livraison de 29 agents, `--security` ses 3 agents de sécurité, `--research`
`researcher` et `data-collection-engineer`, et `--documents`
`community-manager`. Aucune autre portée n'installe d'agent, sauf si `--agents`
demande l'effectif complet, et `--no-agents` les supprime partout. La
correspondance vit dans `install.sh`, dans `agent_domains`, et le contrôle 4 de
`tests/validate-plugins.sh` la vérifie domaine par domaine.

Chaque portée installe aussi les deux skills transversaux, parce que tous les
arbres les appellent. Une désinstallation par portée les conserve ; seuls
`--all --remove` ou `--shared --remove` les retirent.

Une portée installe aussi tout skill d'un autre arbre que ses propres skills
déclarent. Aujourd'hui, cela n'arrive qu'une fois : `--security` installe
`security-audit`, `engineering-core`, `project-exploration` et
`input-validation` depuis l'arbre d'ingénierie, parce que
`vulnerability-assessment` déclare `security-audit` et que ce skill déclare les
trois autres. C'est pourquoi `--security` affiche 18 et non 14. Une
désinstallation ne les retire jamais, puisque l'arbre d'ingénierie peut encore
s'en servir.

### Par catégorie

Un arbre est souvent plus que nécessaire. Un auteur de thrillers n'a que faire
de la prosodie.

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
| `communication` | 2 | documents |
| `dev-skills` | 60 | engineering |
| `delivery-skills` | 11 | engineering |
| `devops-skills` | 16 | engineering |
| `secure-development` | 9 | security |
| `security-assurance` | 3 | security |
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

Une catégorie n'emporte jamais d'agents, quel que soit son arbre. Ajoutez-les
avec `--agents` si vous installez `--group dev-skills` seul.

## Installer des skills un par un

```bash
bash install.sh --list
bash install.sh --skill thriller
bash install.sh --skill sonnet,haiku
bash install.sh --skill pdf-production report-writing
```

Les dépendances sont résolues de proche en proche à partir du champ
`depends_on`, si bien qu'un skill nommé n'est jamais installé sans ce à quoi il
renvoie :

```
$ bash install.sh --skill thriller
7 skills installed in ~/.claude/skills
Installed: thriller self-critique project-brief writing-constitution
           novel-architect scene-builder chapter-architect
```

La résolution traverse les catégories, et traverse les arbres là où un skill en
déclare un. `pdf-production` tire `document-core` et `document-design` d'une
autre catégorie de l'arbre documents, soit cinq au total. La seule dépendance
qui franchit aujourd'hui une frontière d'arbre va de `vulnerability-assessment`
à `security-audit`.

Un nom inconnu interrompt l'installation et renvoie à `--list`. Il n'installe
pas en silence une liste raccourcie.

Neuf skills ne dépendent de rien et s'installent seuls. Ce sont les
constitutions de leurs arbres, et chacun est celui à lire en premier :

```
self-critique          shared
project-brief          shared
writing-constitution   writing
document-core          documents
engineering-core       engineering
security-core          security
research-core          research
career-core            career
opportunity-core       opportunity
```

Pour ceux-là, copier le répertoire revient au même :

```bash
cp -r shared/self-critique ~/.claude/skills/
```

## Installer sans cloner

```bash
curl -fsSL https://raw.githubusercontent.com/Handsomeboy990/craft-suite/main/install.sh | bash -s -- --writing
```

Quand le script ne trouve aucun skill à côté de lui, il clone le dépôt dans
`~/.cache/craft-suite` et travaille depuis là. Les exécutions suivantes font un
pull plutôt qu'un nouveau clone.

Sous `curl | bash`, l'entrée standard du script est le tube : il ouvre donc
directement le terminal pour poser ses questions. Si aucun terminal ne peut
être ouvert, il refuse plutôt que de choisir pour vous.

| Variable | Effet |
|---|---|
| `CLAUDE_SUITE_REPO` | source du clone, quand le script tourne seul |
| `CLAUDE_SUITE_CACHE` | où ce clone atterrit, par défaut `~/.cache/craft-suite` |

Un dépôt privé ne peut pas être récupéré ainsi sans identifiants. Clonez-le
vous-même et lancez `install.sh` depuis l'intérieur.

## Vérifier avant d'installer

```bash
bash tests/validate-structure.sh
bash tests/validate-rules.sh
bash tests/validate-orchestration.sh
bash tests/validate-plugins.sh
bash tests/validate-model-routing.sh
bash tests/validate-counts.sh
```

L'installeur lance lui-même le premier et refuse d'installer un dépôt qui ne le
passe pas. Ce que vérifie chacun des six :
[../tests/README.md](../tests/README.md).

## Archives

```bash
bash install.sh --all --zip
```

`--zip` est un modificateur, pas une portée : il construit une archive par
skill installé par la portée qu'il accompagne, dans `dist/`, pour un runtime
qui importe les skills un par un. Seul, il n'a pas de portée : il ouvre donc le
même menu qu'un `install.sh` sans argument, et construit les archives de ce que
vous choisissez. `dist/` n'est pas suivi par le contrôle de version.

## Cibles

| Variable | Défaut | Contient |
|---|---|---|
| `CLAUDE_SKILLS_DIR` | `~/.claude/skills` | un répertoire par skill |
| `CLAUDE_AGENTS_DIR` | `~/.claude/agents` | un fichier par agent |
| `CLAUDE_CONFIG_FILE` | `~/.claude/craft.config.yaml` | la configuration utilisateur |

```bash
CLAUDE_SKILLS_DIR=/opt/skills bash install.sh --dev
```

Les skills sont installés à plat, un répertoire par nom de skill.
`tests/validate-structure.sh` refuse deux skills qui partagent un nom, si bien
qu'une cible à plat n'en perd jamais un au profit d'un autre.

## S'en servir sans installer

Placez le dépôt dans le répertoire de travail et faites lire à l'agent
`README.md`, puis la constitution de l'arbre concerné :

```
writing/core/writing-constitution            creative writing
documents/documentation/document-core        professional documents
engineering/dev-skills/engineering-core      software
engineering/devops-skills/devops-core        anything that runs
```

## Mettre à jour

```bash
git switch main && git pull
bash install.sh --writing        la portée que vous aviez installée
```

`main` porte la version publiée. `dev` est la branche d'intégration et peut être
en avance sur la documentation que vous lisez.

L'installation écrase chaque répertoire de skill qu'elle gère et laisse les
autres intacts, donc relancer une portée met à jour exactement ce que vous
avez. Elle ne touche jamais au fichier de configuration.

## Désinstaller

```bash
bash install.sh --all --remove       tous les skills et agents
bash install.sh --writing --remove   un arbre
bash install.sh --skill haiku --remove   ce skill seulement
```

`--remove` sans portée demande quoi retirer, de la même façon que
l'installation.

Une désinstallation par portée garde les deux skills transversaux, puisqu'un
autre arbre peut encore s'en servir. Seuls `--all --remove` ou
`--shared --remove` les retirent.

Une désinstallation nominative ne retire que ce qui a été nommé. Ses
dépendances restent : elles sont partagées, et retirer `writing-constitution`
parce que quelqu'un a abandonné `haiku` casserait le reste de l'arbre.

Désinstaller n'efface jamais le fichier de configuration. Son chemin est
affiché pour qu'il puisse être supprimé délibérément.

## Configurer

L'installation n'est pas terminée tant que ceci n'a pas tourné :

```bash
bash install.sh --configure
```

La commande demande qui vous êtes, quelle langue parlent vos lecteurs, et
quelles étapes l'agent peut exécuter seul plutôt que vous les rendre. Elle
écrit `~/.claude/craft.config.yaml` et, pour chaque étape que vous avez gardée,
`~/.claude/craft-manual-tasks.md`. La relancer n'est pas destructeur : elle ne
pose de questions que sur les portées que vous nommez, garde chaque réponse
déjà donnée, et laisse les sections qu'elle ne gère pas, comme `model_routing`
et `career`, exactement comme vous les avez écrites. Référence des champs :
[configuration.fr.md](configuration.fr.md).

## Vérifier l'installation

```bash
ls ~/.claude/skills | wc -l
ls ~/.claude/agents | wc -l
cat ~/.claude/craft.config.yaml
```

Ce que chaque portée doit afficher, mesuré, les deux skills transversaux déjà
comptés :

| Portée | Skills | Agents |
|---|---|---|
| `--writing` | 44 | 0 |
| `--documents` | 11 | 1 |
| `--dev` | 89 | 29 |
| `--security` | 18 | 3 |
| `--research` | 7 | 2 |
| `--career` | 9 | 0 |
| `--opportunity` | 11 | 0 |
| `--shared` | 2 | 0 |
| `--all` | 173 | 34 |
| `--agents` | 0 | 34 |

`~/.claude/skills` est partagé. Il contient tous vos skills, pas seulement ceux
de cette suite : un skill installé ailleurs s'y trouve à côté, et claude.ai
range ses skills synchronisés dans un sous-répertoire `synced` que `ls` compte
comme une entrée de plus. Le tableau est donc un plancher, pas une égalité, et
un nombre plus grand est normal.

Pour ne compter que ceux de cette suite, depuis le clone :

```bash
comm -12 <(find . -name SKILL.md -not -path './plugins/*' \
             | sed 's|/SKILL.md$||' | xargs -n1 basename | sort) \
         <(ls ~/.claude/skills | sort) | wc -l
```

L'installeur affiche ses deux propres nombres quand il termine, et ceux-là ne
comptent que ce qu'il vient d'installer : ce sont eux qu'il faut comparer au
tableau. `tests/validate-counts.sh` vérifie ce tableau contre le dépôt.

Après une installation complète, l'installeur indique si les champs d'identité
qu'exige l'arbre d'ingénierie sont présents, et nomme ceux qui manquent. Il ne
les invente pas.
