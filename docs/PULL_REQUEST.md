# Créer la plateforme PASS Lyon Sud en préservant l’Ostéoscope complet

L’accueil du dépôt ouvre actuellement directement l’Ostéoscope. Cette évolution propose un accueil « PASS Lyon Sud — Plateforme interactive de révision », quatre rubriques et un catalogue Histologie qui lance l’application complète à `/histologie/osteoscope/`.

## Changements

- Remplacement de l’accueil par quatre cartes illustrées ; création des pages Biologie cellulaire, Histologie, Embryologie et QCM & annales, avec navigation et états « Module en préparation ».
- Déplacement de l’ancien `index.html`, sans aucun changement d’octet, vers `histologie/osteoscope/application.html`. Une page parent distincte ajoute les retours accueil/Histologie et un lien pour agrandir l’application.
- Styles et illustrations SVG locaux communs ; documents statiques sans outil de build, sans nouvelle dépendance et compatibles avec le préfixe GitHub Pages `/femur-3d/`.
- Sources institutionnelles et du Tutorat vérifiées ; séparation des annales attestées, des entraînements du Tutorat et des futurs QCM originaux. Aucune question ni annale reproduite, aucun moteur QCM ou nouveau modèle scientifique livré à ce stade.
- Manifeste d’intégrité, contrôles statiques, essais navigateur reproductibles et documentation d’extension. Workflow GitHub Actions de validation uniquement.

## Préservation

Référence : commit `696c28c2386d58a0341391888e2c1ad2664b3300`, aussi identique au site public le 17 octobre 2026. L’application conserve 3 158 205 octets et le SHA-256 `2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c`. La branche de sauvegarde locale est `backup/osteoscope-2026-10-17`.

## Validation

- Vérification binaire, 78 liens/ressources/ancres et cinq SVG : conforme.
- Syntaxe du JavaScript d’origine : conforme.
- Cinq pages dans sept formats, dont iPad portrait/paysage ; cibles tactiles, images et navigation sans JavaScript : conformes.
- Vingt-cinq scénarios originaux/intégrés : états et pixels WebGL identiques. Coupes, transparence, couches, sept tissus, onze types cellulaires et matrice couverts ; aide, sources, zoom et retour également vérifiés.
- Aucune erreur JavaScript ou HTTP dans le parcours automatisé.
- Rotation à un doigt et pincement à deux doigts émulés sous Chromium : effet de caméra vérifié.
- Accès au contenu au clavier ; rapports datés avec empreintes des fichiers et état explicite de réussite ou d’échec.
- Livraison récupérable par patch complet, bundle ou ZIP ; procédure `git am` vérifiée dans un clone indépendant avec comparaison de l’arbre Git.
- GitHub Pages existant : déploiement initial `built` sur `main` / `/`. Aucun changement de source Pages et aucun déploiement de cette branche.

## À examiner avant fusion

Essayer la version sur Safari avec un véritable iPad, en particulier les gestes à deux doigts, l’orientation, la barre Safari et le retour après veille. WebKit n’a pas pu démarrer dans l’environnement de test faute de bibliothèques système. Le fichier original est inchangé, mais la page parent réduit sa hauteur d’environ 53 px ; le lien « Agrandir » restitue l’affichage direct.

Consulter `docs/QUALITY.md`, `docs/SOURCES.md` et `docs/DEPLOYMENT.md` pour les détails et limites. La banque QCM, ses modes, l’historique et l’import personnel sont seulement spécifiés et clairement signalés en préparation.

Ne pas fusionner ni modifier la version publique sans l’accord explicite du propriétaire.
