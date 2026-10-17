# Livraison préparée — PASS Lyon Sud

La réalisation est enregistrée dans la branche locale `feat/pass-lyon-sud-platform`. La branche locale `backup/osteoscope-2026-10-17` pointe sur le commit initial `696c28c2386d58a0341391888e2c1ad2664b3300`.

Les deux premiers commits isolent le travail pour la revue :

- `bddae35` : déplacement de l’application d’origine vers `histologie/osteoscope/application.html`, reconnu par Git comme renommage identique à 100 %, et ajout du manifeste d’intégrité.
- `dee2459` : nouvelle plateforme, documents et outils de contrôle.

## Fichiers modifiés ou créés

| Fichier ou groupe | Résultat |
| --- | --- |
| `index.html` | Nouvel accueil avec titre, sous-titre, quatre cartes et accès direct à l’Ostéoscope. |
| `biologie-cellulaire/index.html` | Présentation des futurs organites, mécanismes, fiches et pièges. |
| `histologie/index.html` | Carte de lancement et catalogue de futurs tissus. |
| `histologie/osteoscope/index.html` | Page d’intégration avec retour accueil/Histologie et lien d’agrandissement. |
| `histologie/osteoscope/application.html` | Ancien `index.html` conservé octet pour octet ; aucun moteur, modèle ou comportement réécrit. |
| `embryologie/index.html` | Présentation des futures chronologies, coupes et animations. |
| `qcm-annales/index.html` | Espaces UE2/UE5, futurs modes, distinction des provenances, sources et import en préparation. |
| `assets/styles.css` | Interface partagée, tactile et responsive ; indépendante des styles de l’application. |
| `assets/{brand,cellule,histologie,embryologie,qcm}.svg` | Identité et quatre illustrations originales schématiques. |
| `.nojekyll`, `.gitignore` | Publication statique et exclusion des sorties locales. |
| `.github/workflows/validate.yml` | Contrôles GitHub Actions uniquement, sans déploiement. |
| `scripts/check_site.py`, `scripts/browser_qa.py` | Vérification d’intégrité, chemins et essais comparatifs du navigateur. |
| `README.md` | Installation sans build, architecture et commandes de contrôle. |
| `docs/osteoscope-preservation.json` | Commit, blob, taille, empreinte et correspondance avec le site public. |
| `docs/QUALITY.md`, `docs/qa-results.json`, `docs/qa-webkit-results.json`, `docs/external-links.json` | Résultats datés, empreintes des fichiers testés, tentative WebKit, limites et protocole iPad matériel. |
| `docs/SOURCES.md`, `docs/CONTENT_MODEL.md` | Recherche documentaire, accès et spécification d’extension. |
| `docs/DEPLOYMENT.md`, `docs/PULL_REQUEST.md`, `docs/DELIVERY.md` | Publication, texte de PR prêt et ce récapitulatif. |

## Contrôle qualité

Contrôle statique réussi : 78 liens/ressources/ancres, cinq SVG et application strictement identique. Essais Chromium réussis : 35 vues responsive, navigation sans JavaScript, accès direct au clavier, 25 scénarios original/intégré avec les mêmes états et pixels WebGL, retour à l’accueil, rotation et pincement tactiles émulés. Aucun HTTP en erreur ni erreur JavaScript dans le parcours testé. Les cinq liens externes de la rubrique QCM répondent 200.

WebKit n’a pas démarré faute de bibliothèques système. Un test Safari sur un véritable iPad reste nécessaire. Voir `QUALITY.md` pour le détail ; aucune compatibilité matérielle non testée n’est annoncée comme acquise.

## Blocage de la livraison distante

L’intégration authentifiée refuse l’écriture avec HTTP 403. Les tentatives de création de références par l’API et l’envoi Git des deux branches ont échoué. Aucun changement distant, aucune PR créée, aucune fusion et aucun déploiement de la plateforme n’ont eu lieu. La page publique demeure l’Ostéoscope initial.

Pour poursuivre la livraison demandée, rétablir l’autorisation d’écriture de l’intégration sur ce dépôt : contenu et Pull Requests, ainsi que l’autorisation de mettre à jour les workflows si elle est distincte. Il n’est pas nécessaire d’accorder une autorisation de fusion ou d’administration Pages. Ne jamais transmettre un jeton dans une discussion.

Après rétablissement de l’accès, publier les deux branches existantes puis créer une PR brouillon vers `main`, avec le titre et le texte de `docs/PULL_REQUEST.md`. Ne pas fusionner.

Le dossier de livraison externe au site contient aussi une archive des sources, un bundle Git avec les deux branches, les patchs des commits, un patch unique complet `pass-lyon-sud-complet.patch` et les captures d’écran. Le bundle conserve l’historique sans inclure de configuration Git locale ni de données d’authentification. La récupération du patch est vérifiée dans un clone indépendant, avec comparaison de l’arbre Git et contrôle statique de la copie récupérée.

La poursuite de la livraison a ajouté des encodages UTF-8 explicites aux outils, des rapports de test datés qui signalent aussi les échecs, un essai du lien d’accès au clavier et une procédure complète de récupération et de publication. Aucun octet de l’Ostéoscope et aucun fichier de `main` n’ont été modifiés.
