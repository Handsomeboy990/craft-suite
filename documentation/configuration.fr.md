# Configuration

Rien dans ce dépôt ne présuppose qui vous êtes, quels outils vous employez, ni
quelle langue parlent vos lecteurs. Ces réponses vivent dans un seul fichier,
hors du dépôt.

[English version](configuration.md)

`config/README.md` est la référence des champs. Ce document explique le contrat
côté installeur : quels champs sont demandés, quand, et ce qui se passe quand
l'un d'eux manque.

## Le fichier

| Élément | Valeur |
|---|---|
| Modèle | `config/craft.config.example.yaml` |
| Emplacement par défaut | `~/.claude/craft.config.yaml` |
| Surcharge | `CLAUDE_CONFIG_FILE` |
| Écrit par | `bash install.sh --configure` |
| Permissions | 600, fixées par l'installeur |

## Lancer les questions

```bash
bash install.sh --configure
```

Seuls les champs utiles à la portée installée sont demandés. Installer l'arbre
d'écriture seul ne demande pas de gestionnaire de paquets.

| Portée | Demandé |
|---|---|
| `--dev` ou complète | l'identité, les huit questions de délégation, `git.protected_branches`, les conventions git, les valeurs par défaut d'ingénierie, la langue de la documentation |
| `--writing` | la langue de sortie créative |
| `--documents` | l'organisation, la langue de sortie des documents, le moteur PDF, le format de page, le format de date |
| `--shared` | rien ; aucun des deux skills transversaux n'exige de configuration |

Chaque question est pré-remplie avec la valeur déjà enregistrée. Appuyer sur
entrée la garde, si bien que relancer n'est pas destructeur, et ce en trois
sens distincts :

- une réponse déjà donnée est la valeur pré-remplie, donc entrée la garde ;
- un champ dont cette portée ne pose pas la question est réécrit tel quel, si
  bien que `--dev --configure` après `--all --configure` ne vide pas les
  réponses de documents ;
- une section que l'installeur ne gère pas du tout, `model_routing` et
  `career`, traverse la réécriture intacte.

Les questions ont besoin d'un terminal. Sans terminal, l'installeur le dit et
renvoie au modèle, plutôt que d'écrire des valeurs par défaut que personne n'a
choisies.

## Obligatoire contre optionnel

Deux champs sont obligatoires et n'ont jamais de valeur par défaut :

```
identity.author_name
identity.author_email
```

Un commit porte une personne réelle. `git-workflow` s'arrête et nomme le champ
manquant plutôt que d'en inventer un, parce qu'un historique dont l'auteur ne
peut être rattaché à une personne n'est pas auditable, ce qui est toute la
raison d'être d'un historique.

Tout le reste a une valeur par défaut documentée, ou une valeur vide qui
signifie la détecter dans le projet.

| Type de champ | Comportement s'il manque |
|---|---|
| Obligatoire, lié à l'identité | s'arrêter, nommer le champ, nommer la commande qui corrige |
| Optionnel avec une valeur par défaut sûre | utiliser la valeur par défaut, le dire une fois |
| Optionnel signifiant détecter | lire le projet, ne jamais supposer |

## Validation

L'installeur refuse, plutôt que d'enregistrer et d'échouer plus tard :

| Règle | Raison |
|---|---|
| `author_email` doit être une adresse email | elle entre dans chaque commit |
| `author_name` et `author_email` ne doivent pas ressembler à un outil | aucun nom d'assistant, de bot, de modèle ou de générateur dans un historique |
| Les champs énumérés doivent contenir une valeur acceptée | une coquille dans `commit_convention` serait ignorée en silence |
| Une clé dont le nom évoque un identifiant secret est refusée | ce fichier n'est pas l'endroit où vivent les secrets |

Le contrôle des noms d'outils rejette `ai`, `bot`, `gpt`, `llm`, `claude`,
`chatgpt`, `openai`, `anthropic`, `copilot`, `assistant`, `generated` et
`generator` en tant que mots entiers. Ce n'est pas cosmétique. Attribuer à un
outil rend un historique inauditable, et `git-workflow` interdit les mêmes
chaînes dans les messages, les trailers, les champs d'auteur et les noms de
branches.

## Les trois langues

La partie la plus mal comprise du contrat, et la raison pour laquelle il a
trois champs au lieu d'un.

| Couche | Champ | Valeur | Modifiable |
|---|---|---|---|
| Langue des skills | `language.skill` | anglais | non |
| Langue du système | `language.documentation` | anglais par défaut | oui |
| Langue de sortie | `language.creative_output`, `language.document_output` | selon le public | oui |

- **La langue des skills** est celle dans laquelle les instructions sont
  écrites. L'anglais pour les 166 skills, pour que le système soit utilisable
  à l'international.
- **La langue du système** est celle des identifiants, des chemins, des clés de
  configuration, des commits et de la documentation technique. L'anglais.
- **La langue de sortie** est celle de ce que reçoit un lecteur. C'est celle du
  destinataire, jamais celle de l'auteur, jamais celle du système.

`creative_output` vaut le français par défaut parce que l'arbre d'écriture
encode le métier français : typographie du dialogue, inversion de l'incise,
scansion de l'alexandrin, règles d'accord. Ces skills sont écrits en anglais et
produisent du français. Réglez le champ sur une autre langue et l'expertise
structurelle s'applique toujours ; les règles propres à la langue, non, et les
skills concernés le disent.

## Délégation

La section qui décide quelle part du travail vous parvient sous forme d'action
terminée, et quelle part sous forme d'étape préparée. C'est le produit le plus
concret de `--configure`, et la seule section dont les réponses sont écrites
deux fois : une fois dans la configuration, une fois dans une liste de tâches
sur laquelle vous pouvez agir.

| Champ | Valeurs acceptées | Défaut | Lu par |
|---|---|---|---|
| `commits` | `yes`, `stage-only`, `no` | `yes` | `git-workflow` |
| `branches` | `yes`, `no` | `yes` | `git-workflow` |
| `push` | `yes`, `branch-only`, `no` | `branch-only` | `git-workflow` |
| `pull_requests` | `yes`, `draft`, `no` | `yes` | `git-workflow` |
| `release_tags` | `yes`, `no` | `no` | `release-engineering` |
| `deployments` | `yes`, `non-production`, `no` | `no` | `deployment-engineering` |
| `database_operations` | `yes`, `non-production`, `no` | `no` | `database-operations` |
| `dependency_changes` | `yes`, `with-justification`, `no` | `with-justification` | `dependency-selection` |

Toute valeur autre qu'un simple `yes` est une frontière. L'agent fait le
travail jusqu'à cette frontière, vous remet ce qu'il a préparé, et nomme
l'étape au lieu de l'exécuter. Ce que signifie chaque valeur :

| Valeur | Ce qu'elle change |
|---|---|
| `stage-only` | la modification est indexée et le message écrit, c'est vous qui lancez `git commit` |
| `branch-only` | pousse sur toute branche sauf une branche protégée, selon `git.protected_branches` |
| `draft` | la pull request est ouverte en brouillon, jamais marquée prête |
| `non-production` | l'étape tourne dans tous les environnements sauf la production |
| `with-justification` | chaque dépendance nouvelle ou mise à jour est nommée et argumentée avant d'être ajoutée |
| `no` | l'étape n'est jamais exécutée, seulement préparée et remise |

Chaque étape gardée est écrite dans `~/.claude/craft-manual-tasks.md`, à côté
du fichier de configuration, avec la commande exacte à lancer.
`write_manual_tasks`, dans `install.sh`, le produit à la fin de chaque
`--configure`, si bien que la liste et la configuration ne peuvent pas
diverger. `CLAUDE_MANUAL_TASKS_FILE` surcharge son chemin.

Deux règles ne se délèguent jamais, dans aucun sens, et ne sont donc pas des
champs ici : une opération destructrice est comptée et confirmée avant d'être
exécutée, et un secret fuité est signalé pour rotation plutôt que discrètement
supprimé.

## Ce qui ne doit jamais aller dans ce fichier

```
API keys and tokens
passwords and connection strings
private keys and certificates
client confidential information
```

Les secrets appartiennent à l'environnement du projet cible. Leur cycle de vie
relève de `engineering/devops-skills/secrets-management`.
Le contrôle 3 de `tests/validate-rules.sh` parcourt le dépôt à la recherche de
chaînes qui ont la forme d'un identifiant secret.

## Changer une valeur plus tard

```bash
bash install.sh --configure
$EDITOR ~/.claude/craft.config.yaml
```

Les deux sont pris en charge. Le fichier est du YAML simple, sur deux niveaux,
sans indirection.

## Comment un skill la consomme

Un skill nomme le champ et énonce le comportement s'il manque. Il ne recopie
jamais la configuration et n'embarque jamais de valeur.

```
Read identity.author_name and identity.author_email.
If either is missing, stop and report which one, with the command that fixes
it. Do not commit with a guessed identity.
```

Les skills qui lisent la configuration listent leurs champs dans leur README,
sous Configuration. Les skills sans section Configuration n'en lisent aucun.

## Quels skills lisent quoi

| Champ | Lu par |
|---|---|
| `identity.author_name` | `git-workflow`, `administrative-writing`, `document-design`, `pdf-production` |
| `identity.author_email` | `git-workflow` |
| `identity.organization` | `administrative-writing`, `document-design`, `pdf-production`, `report-writing` |
| `git.commit_convention` | `git-workflow`, `release-engineering` |
| `git.branch_convention` | `git-workflow` |
| `git.default_branch` | `git-workflow`, `ci-cd-pipelines` |
| `git.protected_branches` | `git-workflow`, `release-engineering` |
| `delegation.commits`, `.branches`, `.push`, `.pull_requests` | `git-workflow` |
| `delegation.release_tags` | `release-engineering` |
| `delegation.deployments` | `deployment-engineering` |
| `delegation.database_operations` | `database-operations` |
| `delegation.dependency_changes` | `dependency-selection` |
| `model_routing.fast`, `.balanced`, `.strongest` | `model-routing` |
| `career.*` | l'arbre `career/` |
| `language.documentation` | `technical-documentation`, `technical-writing` |
| `language.creative_output` | l'arbre `writing/` |
| `language.document_output` | l'arbre `documents/`, `project-brief` |
| `engineering.package_manager` | `dependency-selection`, `ci-cd-pipelines` |
| `engineering.deployment_platform` | `deployment-engineering` |
| `engineering.database` | `architecture-design`, `technology-selection` |
| `documents.pdf_engine` | `pdf-production` |
| `documents.page_size` | `document-design`, `pdf-production` |
| `documents.date_format` | `administrative-writing`, `report-writing` |

`model_routing` et `career` sont les deux sections sur lesquelles `--configure`
ne pose jamais de question : la première est une politique d'exécution qui
dépend du compte, la seconde des données personnelles que les skills de carrière
demandent au moment où ils en ont besoin. Les deux se modifient à la main dans
le fichier, et `--configure` les fait traverser intactes.

Pour les trois derniers champs d'ingénierie, vide est la valeur recommandée.
Vide signifie la détecter dans le projet, ce que l'arbre d'ingénierie fait de
toute façon. N'en remplissez un que pour exprimer une préférence sur un projet
neuf, et attendez-vous à ce que le projet l'emporte quand il a déjà tranché.
