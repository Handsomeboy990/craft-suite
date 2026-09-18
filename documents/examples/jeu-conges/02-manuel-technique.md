# CongesPro : manuel technique et runbook d'exploitation

Version 1.0. Lecteur : l'administrateur IT de Ficto qui installe, integre et exploite CongesPro.

Ce manuel couvre l'installation et l'integration (SSO, paie), l'exploitation courante (sauvegarde, restauration, supervision) et le depannage des incidents connus. Il ne decrit pas comment un employe pose une demande de conge : cette procedure appartient au guide utilisateur.

## Reference rapide

Deux traitements planifies sont les points critiques de l'exploitation. Leur echec est ce que la supervision doit detecter en premier.

| Traitement | Echeance | Section |
|---|---|---|
| Sauvegarde de la base PostgreSQL | chaque jour a 02h00 | Sauvegarder et restaurer la base |
| Export vers la paie | le 25 de chaque mois | Integrer l'export vers la paie |

Selon la situation, aller directement a la section utile :

| Situation | Aller a |
|---|---|
| Premiere installation ou reprise | Prerequis, puis Configurer le SSO SAML |
| Incident en cours signale par un utilisateur | Depanner les incidents connus |
| Controles du jour | Superviser l'exploitation |
| Une echeance sauvegarde ou paie a echoue | la section du traitement concerne |
| Qui contacter pour escalader | Contacts et escalade |

## CongesPro en bref, et ou il tourne

CongesPro est une application web qui remplace l'ancien tableur partage de gestion des conges, pour un perimetre de 320 employes. Les employes s'authentifient par le SSO SAML de Ficto. Les demandes, les decisions des managers et les soldes sont conserves dans une base PostgreSQL. L'exploitation est rythmee par les deux traitements planifies listes en reference rapide : la sauvegarde quotidienne a 02h00 et l'export vers la paie le 25.

[A CONFIRMER : URL de l'application, noms d'hote du serveur applicatif et du serveur PostgreSQL, versions deployees. Detenus par l'equipe plateforme de Ficto.]

## Prerequis avant toute configuration

- Un acces administrateur au fournisseur d'identite (IdP) SAML de Ficto.
- Un acces a la base PostgreSQL de CongesPro : hote, port, compte de service. [A CONFIRMER aupres de l'equipe plateforme.]
- Le format et le canal d'export attendus par le service paie. [A CONFIRMER aupres du service paie.]
- Un compte utilisateur de test rattache a un manager, pour valider bout a bout.

## Configurer le SSO SAML

1. Recuperer les metadonnees SAML de l'IdP de Ficto. [A CONFIRMER : URL des metadonnees, detenue par l'equipe identite.]
2. Declarer CongesPro comme fournisseur de service aupres de l'IdP en fournissant son Entity ID et son URL ACS (Assertion Consumer Service). [A CONFIRMER : valeurs exactes fournies par l'editeur de CongesPro.]
3. Etablir la correspondance des attributs : l'identifiant de l'employe, son adresse email (elle sert aux notifications), et son manager (il sert a acheminer l'approbation). [A CONFIRMER : noms exacts des attributs attendus par CongesPro.]
4. Charger le certificat de signature de l'IdP dans CongesPro pour que les assertions signees soient acceptees. [A CONFIRMER : emplacement de configuration du certificat.]
5. Verifier : se connecter avec le compte de test. Resultat attendu : l'utilisateur arrive sur la page d'accueil et son solde de conges s'affiche. Si la connexion echoue, controler dans cet ordre la correspondance de l'Entity ID, l'URL ACS, puis la validite du certificat.

## Integrer l'export vers la paie

L'export du 25 transmet au service paie les conges valides du mois.

1. Confirmer le calendrier : l'export s'execute le 25 de chaque mois. [A CONFIRMER : heure d'execution, et comportement quand le 25 tombe un week-end ou un jour ferie, l'export etant alors avance, reporte ou maintenu.]
2. Apres chaque execution, verifier qu'un fichier a ete produit et transmis, et que son contenu couvre bien le mois attendu. [A CONFIRMER : format du fichier, canal de transmission et champs attendus par la paie.]
3. En cas d'echec, relancer l'export manuellement puis prevenir le service paie du decalage. [A CONFIRMER : commande ou action de relance.]

Attention : une restauration de base posterieure au 25 peut reintroduire un ecart avec ce qui a deja ete transmis a la paie. Voir la section suivante.

## Sauvegarder et restaurer la base

La sauvegarde de la base PostgreSQL s'execute chaque jour a 02h00.

Controle quotidien : confirmer qu'une sauvegarde datee du jour existe et que sa taille est coherente avec celle de la veille. Une baisse brutale de taille est un signal, pas un detail. [A CONFIRMER : emplacement de stockage, duree de retention, chiffrement et outil de sauvegarde. Detenus par l'equipe plateforme.]

Restauration :

1. Restaurer sur un environnement isole, jamais directement en production. [A CONFIRMER : commande de restauration et environnement cible.]
2. Verifier l'integrite : la connexion SSO fonctionne, les soldes s'affichent, les demandes recentes sont presentes.
3. Ne basculer en production qu'apres ce controle.

Une sauvegarde jamais restauree n'est pas verifiee. Programmer un exercice de restauration a intervalle regulier et en consigner la date. [A CONFIRMER : date de la derniere restauration testee.]

## Superviser l'exploitation

A surveiller en continu :

| Signal | Sain quand | Premiere action en cas d'alerte |
|---|---|---|
| Page de connexion | accessible et connexion SSO reussie | rejouer une connexion de test ; verifier l'IdP |
| Sauvegarde de 02h00 | une sauvegarde du jour existe | relancer la sauvegarde ; verifier l'espace de stockage |
| Export paie du 25 | fichier produit et transmis | relancer l'export ; prevenir la paie |
| Emails de notification | emis a chaque decision | voir Depanner, symptome email |
| Solde affiche | conforme au calcul attendu | voir Depanner, symptome solde |

[A CONFIRMER : endpoint de sante, seuils de temps de reponse et de taux d'erreur. A definir avec l'equipe plateforme ; ne pas inventer de valeurs.]

Les deux derniers signaux viennent directement des incidents du premier mois : instrumenter le taux d'echec d'envoi des emails et la coherence des soldes est prioritaire.

## Depanner les incidents connus

Entrees classees par symptome, tel qu'il est rapporte.

### Symptome : un email de notification n'arrive pas

- Rapporte comme : « la decision est prise mais je n'ai recu aucun email ».
- Confirmer : dans CongesPro, la demande est bien passee a approuvee ou refusee, alors qu'aucune notification n'a ete emise. Ecarter d'abord le retard de distribution et le classement en indesirable.
- Cause : [A CONFIRMER : cause racine consignee au registre d'incident. Incident du premier mois : un email de notification n'est pas parti.]
- Resolution immediate : prevenir l'employe par un autre canal, puis renvoyer la notification. [A CONFIRMER : action de renvoi.]
- Escalade : si l'envoi est interrompu de facon generale, escalader a l'equipe plateforme et au service de messagerie.

### Symptome : le solde de conges affiche est faux

- Rapporte comme : « le solde sur ma page d'accueil est incorrect ».
- Confirmer : comparer le solde affiche au calcul attendu a partir des demandes validees de l'employe. Verifier qu'il ne s'agit pas d'une demande encore en attente, non decomptee.
- Cause : [A CONFIRMER : cause racine consignee au registre d'incident. Incident du premier mois : un solde affiche faux, puis corrige.]
- Resolution : [A CONFIRMER : procedure de recalcul du solde appliquee lors de l'incident.]
- Apres correction : confirmer que le solde correspond de nouveau au calcul attendu et le surveiller les jours suivants.

## Contacts et escalade

[A CONFIRMER : equipe plateforme de Ficto, support de l'editeur de CongesPro, service paie. Noms et canaux de contact.]

## Maintenance de ce document

Proprietaire : administrateur IT de Ficto. Derniere verification : 2026-09-18. A reviser lors d'un changement d'IdP SAML, d'un changement de version de CongesPro ou de PostgreSQL, d'une modification du format d'export paie, ou a la cloture du registre des deux incidents, moment ou les causes racines marquees ci-dessus doivent etre completees.

Note de verification : ce manuel est produit pour une demonstration sur un systeme fictif. Les faits d'exploitation fournis (SSO SAML, base PostgreSQL, sauvegarde a 02h00, export paie le 25, perimetre de 320 employes, deux incidents du premier mois) sont repris tels quels. Toute valeur propre au systeme non fournie par ce cadre n'a pas pu etre verifiee et est marquee [A CONFIRMER] avec son detenteur, plutot que renseignee de memoire.
