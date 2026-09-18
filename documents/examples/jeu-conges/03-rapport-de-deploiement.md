# Déploiement de CongesPro : rapport du premier mois

Destinataire : responsable RH, Ficto
Objet : suite à donner après un mois de service de CongesPro
Période couverte : premier mois de service, en remplacement du tableur partagé
Établi le 18 septembre 2026 par l'équipe de déploiement de CongesPro

## Synthèse et décision demandée

Le déploiement de CongesPro est un succès opérationnel. En un mois, 272 des 320 employés (85 %) ont déposé au moins une demande, et le traitement courant des congés ne repose plus sur l'ancien tableur partagé. Deux incidents sont survenus, l'un et l'autre résolus.

Décision demandée : confirmer CongesPro comme système unique de gestion des congés et retirer le tableur partagé, une fois la fiabilité des notifications par email vérifiée sur le prochain cycle mensuel. Échéance utile : avant l'export vers la paie du 25.

Pour vous, l'adoption n'est plus le sujet : elle est acquise. Le seul risque résiduel porte sur la fiabilité des notifications par email, dont un envoi a manqué. La vérification demandée lève ce risque avant que le tableur, seul filet de secours actuel, ne soit retiré.

## Le déploiement a atteint ses utilisateurs

- Adoption : 272 des 320 employés (85 %) ont déposé au moins une demande le premier mois.
- Périmètre en service : connexion par le SSO SAML de l'entreprise, dépôt d'une demande (dates de début et de fin, type parmi congé payé, RTT et sans solde, commentaire optionnel), approbation ou refus par le manager, notification de l'employé par email, et solde restant affiché sur la page d'accueil.
- Continuité technique : base de données PostgreSQL, sauvegarde quotidienne à 02h00, export mensuel vers la paie le 25.
- Accompagnement fourni : un guide utilisateur et une session de formation.

Un taux de 85 % de demandes déposées dès le premier mois indique que la bascule depuis le tableur a été acceptée par les employés, sans période de rejet ni recours à l'ancienne méthode.

## Deux incidents, un seul sensible

Deux incidents ont été signalés sur la période, classés ici par gravité et non par ordre d'apparition.

1. Une notification par email d'approbation ou de refus n'est pas partie. Un employé a donc pu ignorer la décision de son manager sur sa demande. L'incident est résolu. C'est le seul des deux qui touche un point sensible : il rompt le lien entre la décision du manager et l'employé, cœur du service.
2. Un solde de congés s'est affiché faux, puis a été corrigé. L'impact s'est limité à l'affichage.

Ce que le matériel disponible n'établit pas : la cause de la notification manquée, et donc si elle est isolée ou récurrente. Ce point reste ouvert à ce jour.

## Un seul point reste incertain

- Inconnu : la notification manquée est-elle un cas isolé ou le symptôme d'un défaut récurrent.
- Ce qui le résoudrait : vérifier la livraison des notifications sur le prochain cycle mensuel, par les journaux d'envoi et une confirmation de réception. Coût faible.
- Sensibilité de la décision : la recommandation ci-dessous tient si la notification est fiable. Si le défaut est récurrent, retirer le tableur supprime le seul filet de secours au moment où la communication vers l'employé n'est pas garantie. La vérification des notifications est donc un préalable au retrait, non une tâche annexe.

## Recommandation : faire de CongesPro le système unique

Confirmer CongesPro comme système unique de gestion des congés et retirer le tableur partagé, après vérification de la fiabilité des notifications sur le prochain cycle mensuel.

Le compromis est explicite : retirer le tableur supprime la solution de repli. Il est assumé parce que l'adoption est établie et parce que la vérification des notifications lève le seul risque sérieux identifié.

## Qui fait quoi, et quand

| Action | Responsable | Échéance |
|---|---|---|
| Vérifier la livraison des notifications sur le prochain cycle mensuel | Équipe technique CongesPro | Avant l'export vers la paie du 25 |
| Décider du retrait définitif du tableur partagé, au vu de la vérification | Responsable RH | À l'issue de la vérification |

À réviser après le prochain cycle mensuel.
