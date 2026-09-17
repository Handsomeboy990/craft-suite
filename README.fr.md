# Craft Suite

**Le métier, encodé.** 156 skills et 17 agents qui tiennent un agent à un
standard professionnel : écrire, produire des documents, construire un
logiciel, le sécuriser, chercher, mener une recherche d'emploi, évaluer des
opportunités, et relire son propre travail.

[English version](README.md) | [Documentation complète](documentation/overview.fr.md)

## Pourquoi

Un agent à qui l'on demande un chapitre, une lettre ou un endpoint produira
quelque chose de plausible du premier coup. Plausible n'est pas correct, et
l'écart n'apparaît que plus tard : à l'échéance, entre les mains du lecteur, en
production.

Ce ne sont pas des prompts. Chaque skill est une procédure numérotée, avec ses
critères de décision, sa grille de notation, un seuil déclaré de ce qui compte
comme terminé, et la liste explicite de ce qu'elle refuse de faire.

## Installation

Par le marketplace de plugins, un domaine à la fois :

```
/plugin marketplace add Handsomeboy990/craft-suite
/plugin install craft-engineering
```

Ou tout d'un coup, dans `~/.claude/skills`. Aucune dépendance : le dépôt est du
Markdown et du shell.

```bash
git clone https://github.com/Handsomeboy990/craft-suite.git
cd craft-suite
bash install.sh              # un menu, choisissez vos arbres
bash install.sh --all        # ou prenez les 155 et les 17 agents
bash install.sh --configure
```

`--configure` demande qui vous êtes, quelle langue parlent vos lecteurs, et
quelles étapes l'agent peut exécuter seul plutôt que vous rendre. Aucune valeur
propre à un utilisateur n'est codée en dur dans un skill.

Installations ciblées : `--writing`, `--documents`, `--dev`, `--security`,
`--research`, `--career`, `--opportunity`, `--no-agents`.

## Les sept plugins

| Plugin | Ce que devient l'agent | Skills du domaine |
|---|---|---|
| `craft-writing` | romancier, scénariste, éditeur, critique, correcteur | 42 |
| `craft-documents` | rédacteur technique, auteur de rapports, producteur de PDF | 7 |
| `craft-engineering` | une équipe de livraison, de la spécification à la production | 73 et 17 agents |
| `craft-security` | ingénieur défensif, et auditeur sur autorisation écrite | 10 |
| `craft-research` | chercheur qui ne cite que ce qu'il a réellement lu | 5 |
| `craft-career` | recherche d'emploi qui n'invente jamais une offre | 7 |
| `craft-opportunity` | idées, hackathons, clients, marchés | 9 |

Chaque plugin est autonome. Il embarque son domaine, les deux skills communs
que tous les arbres appellent, et toute dépendance inter-arbres déclarée par
ses skills, résolue transitivement, pour qu'aucun skill ne s'installe cassé.

## Ce que « terminé » veut dire ici

| Vous demandez | Ce que l'agent doit faire avant de dire que c'est fini |
|---|---|
| Corrige ce bug | le reproduire, nommer la cause à un fichier et une ligne, corriger, et ajouter un test qui échoue sans le correctif |
| Construis cet endpoint | fixer le contrat d'abord, puis implémenter, puis passer une revue indépendante avec un test exécuté et observé |
| Écris-moi un rapport | nommer le destinataire, commencer par la conclusion, attribuer chaque chiffre, et énoncer l'incertitude au lieu de la lisser |
| Produis un PDF | rendre les pages et les regarder : coupures, orphelines, tableaux cassés, glyphes manquants |
| Rédige ce chapitre | passer le protocole d'autocritique, puis au moins un skill de révision, avant que le texte soit dit terminé |
| Trouve-moi un emploi | tracer chaque offre jusqu'à une source vivante ou la retirer, et ne rien affirmer que le candidat ne puisse soutenir |
| Livre ça | neuf portes de préparation, et aucune mise en production annoncée avant qu'un parcours réel ait été exercé |

Deux skills n'appartiennent à aucun domaine et sont appelés par tous.
[project-brief](shared/project-brief/) tourne avant le travail et produit
l'accord auquel il sera mesuré. [self-critique](shared/self-critique/) tourne
après, choisit les rôles professionnels qui recevraient réellement le résultat,
et corrige ce qu'il trouve au lieu de le signaler.

## Ce que le système refuse

```
deviner ce que le dépôt permet d'établir
affirmer sans avoir exécuté
écrire une commande dans un document sans l'avoir lancée d'abord
inventer une référence légale, un numéro d'enregistrement ou une institution
écrire du code de production avant que l'architecture soit approuvée
affaiblir un test pour obtenir un pipeline vert
lancer une instruction destructrice sans compter les lignes d'abord
déclarer un déploiement réussi sans avoir exercé un parcours
livrer un PDF dont les pages n'ont jamais été rendues ni regardées
attribuer un commit à un outil
```

Deux interdictions valent pour tout fichier du dépôt, celui-ci compris : aucun
emoji, aucun tiret cadratin. Les deux sont vérifiées par
`tests/validate-rules.sh` en intégration continue.

## Où aller ensuite

| | |
|---|---|
| La suite entière, arbre par arbre | [documentation/overview.fr.md](documentation/overview.fr.md) |
| Quel skill me faut-il | [documentation/skills-guide.md](documentation/skills-guide.md) |
| Options d'installation en détail | [documentation/installation.md](documentation/installation.md) |
| Référence de configuration | [documentation/configuration.md](documentation/configuration.md) |
| Plugins, et comment les bundles sont générés | [documentation/plugins.md](documentation/plugins.md) |
| Les 17 agents | [documentation/agents.md](documentation/agents.md) |
| Architecture du dépôt | [documentation/architecture.md](documentation/architecture.md) |
| Tableau de bord local d'utilisation | [control-center/README.md](control-center/README.md) |
| Contribuer | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Historique | [CHANGELOG.md](CHANGELOG.md) |

## Philosophie

- La contrainte produit le style. Les règles retirent du bruit, pas de la liberté.
- Un texte se juge à son effet, jamais à son intention.
- Un système se juge à ce qui a été exécuté, jamais à ce qui a été prévu.
- La cohérence est une forme de respect, pour le lecteur comme pour le prochain ingénieur.
- Toute règle énoncée doit être vérifiable par une procédure explicite.
- La sévérité critique est un service, pas une posture.

## Auteur

**Lauret Chacha**

| | |
|---|---|
| GitHub | [@Handsomeboy990](https://github.com/Handsomeboy990) |
| Portfolio | [lauret-chacha.vercel.app](https://lauret-chacha.vercel.app) |
| LinkedIn | [in/lauret-chacha](https://linkedin.com/in/lauret-chacha) |
| Email | lauretchacha@gmail.com |

## Licence

MIT. Voir [LICENSE](LICENSE).

Copyright (c) 2026 Lauret Chacha (Handsomeboy990).
