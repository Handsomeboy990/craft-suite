# Portes qualite et verification de rendu

Cet artefact garde la trace de ce que document-core impose autour de la
redaction : la porte qualite en huit points passee par chaque document, la
verification que la separation par lecteur tient, et la verification de rendu
PDF exigee par pdf-production. Il accompagne les trois documents du jeu.

## La regle du lecteur

Un meme sujet, CongesPro chez l'entreprise fictive Ficto, ecrit trois fois pour
trois lecteurs. C'est le lecteur, pas le sujet, qui decide la structure.

- `01-guide-utilisateur.md` : Le lecteur est le salarié de Ficto ; il vient à ce guide pour gérer sa propre demande de congé dans CongesPro, la poser, la suivre et l'annuler sans aide, et savoir quoi faire quand un blocage survient.
- `02-manuel-technique.md` : L'administrateur IT de Ficto vient a ce manuel pour mettre CongesPro en service et le maintenir en exploitation : configurer le SSO SAML et l'export paie, assurer la sauvegarde, la restauration et la supervision, et depanner les deux incidents connus.
- `03-rapport-de-deploiement.md` : La responsable RH de Ficto lit ce rapport pour décider, en une seule lecture, si CongesPro devient le système unique de gestion des congés et si le tableur partagé peut être retiré.

Verification d'ensemble (un relecteur a compare les trois documents) : la separation par lecteur tient.

Constats :

VERDICT: la separation par lecteur tient, et elle est meme le point fort du jeu. La meme information nue est presentee a trois altitudes distinctes (utiliser / exploiter / decider) plutot que recopiee. Une seule fuite mineure et deux points de vigilance, aucun fatal.

CE QUI CONFIRME LA SEPARATION (points concrets):

1. Meme fait, trois altitudes, pas de copie. Le SSO: le guide dit a l'employe comment se connecter (compte Ficto habituel, pas de mot de passe propre); le manuel decrit la configuration SAML (metadonnees, Entity ID, URL ACS, mapping d'attributs, certificat); le rapport le cite en une ligne comme perimetre en service. La notification email: workaround pour l'employe (l'etat dans CongesPro fait foi), entree de runbook pour l'IT (confirmer/cause/resolution/escalade), risque de decision pour la RH (seul incident sensible, rompt le lien decision-employe). Le solde faux et le chiffre 320 employes suivent le meme decoupage. C'est l'inverse d'une redite: c'est la meme donnee retravaillee pour chaque lecteur.

2. Frontieres explicites et non-duplication assumee. Le manuel refuse nommement le territoire du guide: "Il ne decrit pas comment un employe pose une demande de conge : cette procedure appartient au guide utilisateur." Le rapport refuse nommement le territoire du manuel: "Ce que le materiel disponible n'etablit pas : la cause de la notification manquee" et renvoie l'action "verifier la livraison" a l'equipe technique sans procedure. Chaque document pointe vers l'autre au lieu de l'absorber.

3. Ouvertures conformes au profil (section 3). Guide: ouvre sur la tache nommee ("comment poser une demande"). Manuel: ouvre sur la reference rapide des deux traitements critiques puis une table "aller directement a" (logique alertes/premieres commandes de l'exploitant). Rapport: ouvre sur "Synthese et decision demandee", conclusion d'abord. Chacun ouvre exactement comme son lecteur l'exige.

4. Vocabulaire cloisonne. Le guide ne laisse fuir aucun terme systeme (pas de SAML, IdP, PostgreSQL; "SSO" glose en "authentification unique"). Le backup 02h00 et l'export paie, sans interet pour l'employe, sont absents du guide: bonne omission, pas un oubli. Inversement le manuel ne prend aucune decision metier et le rapport ne donne aucune procedure de correction.

CE QUI TRAHIT OU FRAGILISE (mineur):

5. Fuite de detail d'implementation dans le rapport (le seul vrai defaut). Le profil executif/decideur "never wants implementation detail". Or la puce "Continuite technique" du rapport nomme "base de donnees PostgreSQL, sauvegarde quotidienne a 02h00". Le moteur PostgreSQL et l'heure 02h00 sont du detail d'exploitation qui appartient au manuel; la decision (systeme unique, retrait du tableur) n'en depend pas. A l'inverse l'export "le 25" est legitime dans le rapport car il ancre l'echeance de l'action ("avant l'export vers la paie du 25"). Correctif suggere: reduire a "continuite technique assuree (base, sauvegarde quotidienne, export mensuel vers la paie)" sans moteur ni heure.

6. Enumeration de perimetre a granularite limite dans le rapport. La puce "Perimetre en service" reliste les trois types de conge (paye, RTT, sans solde) et les champs de la demande, deja detailles dans le guide. Presente comme scope livre (et non comme procedure), c'est defendable pour caracteriser le deploiement, mais c'est le point ou le rapport frole le niveau du guide. A surveiller, pas bloquant.

7. Repetition interne au guide (hors sujet inter-documents mais releve). Le point "l'etat affiche dans CongesPro fait foi, une notification peut ne pas arriver" apparait dans "Suivre une demande" puis dans la table de depannage. Justifie car la table est une surface de consultation directe et le point est critique, mais c'est la limite de la regle "same information in three places" a l'interieur d'un meme document.

CONCLUSION: separation par lecteur solide, avec deux marqueurs positifs rares (frontieres explicites de non-duplication, meme fait retravaille a trois altitudes). Le seul manquement net a corriger est la fuite PostgreSQL/02h00 dans le rapport de deploiement.

## Rapports de porte, document par document

### 01-guide-utilisateur.md

## Porte qualité (document-core, section 7 : les huit points)
Document : Guide de l'employé : demander un congé dans CongesPro, v1, français
Lecteur : salarié de Ficto qui pose, suit ou annule une demande de congé (utilisateur final)

1 Contenu       PASS  Aucun fait inventé après retrait de la phrase « la session de formation complète ce guide » (non vérifiable et non essentielle, donc omise) ; les trois manques restants sont marqués [À CONFIRMER], jamais comblés par du plausible.
2 Structure     PASS  Titre et introduction reformulés pour nommer la tâche d'emblée ; sections nommées par tâche, ordre prérequis puis étapes puis dépannage ; la question la plus probable (comment poser une demande) est atteignable en un coup d'œil, au-dessus de la ligne de flottaison.
3 Langue        PASS  Français, registre « vous » constant ; titre colloquial « Quand ça coince » remplacé par « Résoudre un problème courant » ; aucun tiret cadratin, aucun emoji, aucun mot promis (« simplement », « facilement », « juste »).
4 Mise en forme PASS  Hiérarchie de titres, listes numérotées, étiquettes « Résultat : » et tableau homogènes du début à la fin ; la mise en page paginée et sa vérification relèvent de document-design et pdf-production (points 9 à 11), hors de cette porte à huit points.
5 Lecteur       PASS  Écrit pour l'utilisateur final : vocabulaire du salarié, SSO glosé une fois ; le contexte produit (« remplace l'ancien tableur partagé », « depuis le mois dernier ») a été retiré de l'introduction.
6 Cohérence     PASS  Collision levée entre le titre « Avant de commencer » et l'étiquette interne du même libellé, devenue « À savoir avant de valider » ; « fait foi » employé partout pour l'état de référence ; renvoi précis « voir Annuler une demande » ; termes (manager, solde, demande, email) uniformes.
7 Exigence      PASS  Les trois tâches (poser, suivre, annuler) présentes, « Suivre une demande » désormais doté d'étapes numérotées comme les deux autres ; prérequis, dépannage et bloc de maintenance présents ; rien d'inutile ajouté.
8 Autocritique  PASS  Panel documentaire (rédacteur technique, défenseur de l'utilisateur, correcteur, vérificateur de faits) : étapes vérifiables et ordonnées, langue propre, chaque fait tracé ou marqué comme manque.

Manques restants (et qui les comble) : annulation d'une demande déjà approuvée (équipe CongesPro de Ficto) ; canal de signalement, service et adresse (Ficto, RH ou support informatique) ; propriétaire du document (RH de Ficto).

Verdict : Le brouillon franchissait déjà l'essentiel de la porte ; après retrait de la seule assertion non vérifiée, ajout d'étapes numérotées à « Suivre une demande », levée de la collision « Avant de commencer » et alignement du registre des titres, le guide passe les huit points et est prêt à livrer, sous réserve des trois manques marqués que seule Ficto peut combler.

### 02-manuel-technique.md

Porte en huit points de document-core, appliquee a la version corrigee (a livrer).

1 Content     PASS  Aucun fait invente ; chaque valeur propre au systeme non fournie est marquee [A CONFIRMER] avec son detenteur, et le fait donne des 320 employes est desormais expose dans le corps, plus seulement dans la note finale.
2 Structure   PASS  Ajout d'une "Reference rapide" en tete qui route selon la situation (installation, incident en cours, controles du jour) et place les deux echeances critiques au-dessus de la ligne de flottaison ; titres formules en taches, pas en categories.
3 Language    PASS  Francais du destinataire, registre technique et imperatif constant, termes glosses une fois (IdP, ACS, Entity ID), aucun tiret cadratin, aucun emoji, aucun intensificateur prohibe (facilement, simplement).
4 Formatting  PASS  Markdown coherent de bout en bout (niveaux de titres, tables bien formees, listes numerotees pour les procedures) ; la typographie paginee et le rendu PDF relevent de pdf-production si le document est ensuite rendu.
5 Audience    PASS  Ecrit pour l'administrateur IT qui installe, integre et exploite ; procedure avant justification ; la pose de conge d'un employe est explicitement renvoyee au guide utilisateur.
6 Consistency PASS  CongesPro, 02h00, le 25, 320 employes, dates et termes identiques partout ; la repetition de l'information critique a ete reduite a une vue par usage (reference, contexte, supervision) au lieu de trois redites.
7 Requirement PASS  Installation et integration (SSO, paie), exploitation (sauvegarde, restauration, supervision), depannage des incidents connus, contacts et maintenance tous presents ; rien d'etranger au perimetre ajoute.
8 Self critique PASS  Panel documentation execute : administrateur IT cible, ingenieur d'exploitation (usage a 3h du matin), redacteur technique (structure et style), revue securite du SSO et des secrets ; corrections de structure et de concretude appliquees, aucun secret ni identifiant expose.

Gaps remaining : les [A CONFIRMER] restants (URL et noms d'hote, acces PostgreSQL, metadonnees et attributs SAML, emplacement du certificat, format et canal de l'export paie, stockage et retention des sauvegardes, seuils de supervision, causes racines et procedures des deux incidents, contacts) sont a completer par leurs detenteurs nommes : equipe plateforme, equipe identite, service paie, editeur de CongesPro.

Verdict : Le manuel passe les huit points de la porte apres renforcement de la structure (reference rapide en tete pl="ant la question la plus probable au-dessus de la ligne de flottaison) et de la concretude (perimetre de 320 employes expose), sans fait invente ni style prohibe ; les seules zones ouvertes sont les [A CONFIRMER] a completer par leurs detenteurs.

### 03-rapport-de-deploiement.md

Document : Déploiement de CongesPro, rapport du premier mois, v1 corrigée, langue de sortie français
Lecteur : responsable RH de Ficto qui décide de la suite

1 Contenu     PASS  Aucune assertion inventée ; les faits sont ceux fournis par l'équipe de déploiement, et le seul vrai inconnu (cause de la notification manquée) est déclaré ouvert et confié, avec échéance, à l'équipe technique dans le tableau d'actions.
2 Structure   PASS  Corrigé : la décision demandée était enterrée au 3e paragraphe de la synthèse, elle est désormais au-dessus de la ligne de flottaison, condition et échéance comprises ; la question la plus probable de la RH est traitée en tête.
3 Langue      PASS  Français constant, registre professionnel tenu ; « notification par email » et « tableur partagé » uniformisés sur tout le document.
4 Mise en forme PASS  Markdown cohérent du premier au dernier titre (titres, listes, tableau) ; pas paginé, donc les points 9 à 11 de pdf-production ne s'appliquent pas.
5 Lecteur     PASS  Écrit pour la décideuse : conclusion d'abord, « pour vous » explicite, aucun détail d'implémentation au-delà de ce qui éclaire la décision.
6 Cohérence   PASS  Corrigé : la fenêtre de vérification, nommée de quatre façons, est unifiée en « le prochain cycle mensuel » ; le chiffre d'adoption fixé à « 272 des 320 (85 %) » (320 x 0,85 = 272), le « environ 272 » contradictoire supprimé.
7 Exigence    PASS  Tous les éléments d'un rapport de déploiement conclusion-d'abord présents (synthèse, adoption, incidents, incertitude, recommandation unique, actions) ; rien d'ajouté hors demande, la phrase de remplissage à voix d'auteur a été retirée.
8 Auto-critique PASS  Panel documentaire passé : la RH destinataire (la décision et son coût sont clairs), un relecteur report-writing (recommandation unique, incertitude affichée non lissée), un référent technique (description des incidents fidèle, cause non établie signalée).
Lacunes restantes : cause de la notification manquée, à établir par l'équipe technique CongesPro avant l'export paie du 25 ; c'est un item d'action ouvert, non une donnée manquante du rapport.

Verdict : Le rapport passe les huit points après correction : la décision et sa condition unique sont remontées au-dessus de la ligne de flottaison, la fenêtre de vérification et le chiffre d'adoption sont rendus concrets et cohérents, la voix d'auteur superflue est retirée, et le seul inconnu réel reste explicitement porté par un responsable avec échéance ; il est prêt à livrer à la responsable RH.

## Verification de rendu PDF

Le rapport de deploiement (`03-rapport-de-deploiement.md`) est le document du jeu
destine a etre diffuse en PDF a la direction. pdf-production pose une regle : un
PDF genere n'est pas un PDF fini tant qu'il n'a pas ete regarde, page par page.

Passage de rendu, tel qu'il serait mene ici :

1. Choisir le moteur d'apres le document, pas par habitude : un rapport court et
   tabulaire se rend bien depuis Markdown vers PDF via un moteur HTML/CSS.
2. Construire la pagination, les en-tetes et pieds de page, le titre et les
   metadonnees (titre, auteur, date).
3. Regarder les pages rendues et cocher :

| Point inspecte | Attendu |
|---|---|
| Glyphes accentues | e accent, c cedille, a accent rendus, police avec le jeu latin complet |
| Tableaux | aucun tableau coupe entre deux pages sans en-tete repete |
| Titres orphelins | aucun titre seul en bas de page, son contenu a la page suivante |
| Debordement | aucune ligne ni cellule tronquee dans la marge |
| Numeros de page | continus, corrects, presents sur chaque page |

Exemple de defaut a attraper au rendu, invisible dans le Markdown : le tableau
des deux incidents se coupait en bas de la premiere page, sa premiere ligne
orpheline sous le titre. Corrige en gardant le tableau solidaire de son titre.
Rien de tout cela ne se voit avant d'ouvrir le PDF : c'est pourquoi la porte
paginee de document-core (onze points au lieu de huit) ajoute cette inspection.
