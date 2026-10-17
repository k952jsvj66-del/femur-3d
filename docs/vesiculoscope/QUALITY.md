# VésiculoScope — Contrôle qualité

## Portée

Phase 1 : cellule schématique 2,5D, carte des voies, COPI/COPII/clathrine, navigation par quatre cargaisons et fiches contextuelles. Les vues moléculaires, l’insuline détaillée, l’autophagie, le mode Trouve l’erreur et un moteur de QCM restent annoncés en préparation.

## Contrôles exécutés

| Contrôle | Résultat |
| --- | --- |
| Sources CM5 | Les huit pages sont lues ; les figures des pages 2 et 5 sont inspectées. Empreinte du PDF conservée, fichier brut non distribué. |
| Données pédagogiques | Quatre cargaisons, 55 étapes avec références de pages 1–8, 13 structures ; ordre du M6P et séparation récepteur/cargo contrôlés. |
| Machineries | Dynamine animée uniquement dans la scission du scénario LDL ; retrait du manteau avant les fusions représentées. |
| Chemins statiques | Huit documents HTML, 91 liens/ressources/ancres valides, cinq SVG d’illustration de la plateforme valides. |
| JavaScript | Vérification de syntaxe de `content.js`, `scene.js` et `app.js` ; invariants contrôlés par `check_vesiculoscope.cjs`. |
| Chargement | HTTP 200 sous le vrai préfixe local `/femur-3d/biologie-cellulaire/vesiculoscope/`, sans erreur JavaScript. |
| Responsive | Huit formats, de 320 × 800 à 1440 × 1000, dont 1024 × 768 et 834 × 1194 ; pas de débordement horizontal. |
| Tactile | Commandes principales d’au moins 44 px de hauteur ; commandes de lecture non coupées en mode tablette. |
| Parcours | Les 55 étapes sont parcourues ; explication, Pourquoi, piège pédagogique et références sont comparés aux données. |
| Animations | Trente segments mobiles vérifiés, progression manuelle, disparition des manteaux et des membranes de transport lors de la fusion. |
| Recyclage | KDEL, M6P et LDL : récepteur mobile en losange, cargo conservé à sa position de dissociation. |
| Lecteur | Lecture/pause stable, changement de vitesse, transition automatique d’étape, précédent/suivant et recommencement. |
| Cellule | Sélection tactile par étiquette et par liste native, 13 contrôles de visibilité et d’opacité, étiquettes et réinitialisation. |
| Caméra | Déplacement souris, déplacement à un doigt, pincement à deux doigts via événements tactiles Chromium, clavier et remise à zéro. |
| Agrandissement | La scène gagne une hauteur utile sur un viewport iPad paysage ; retour à l’interface complète. |
| PDF personnel | Association de la fiche exacte, lien local `blob:` vers la page demandée, rejet d’une autre empreinte. |
| Réseau | Aucune requête externe spontanée ni envoi du PDF ; pas de réponse HTTP en erreur dans le parcours du module. |
| Navigation | Biologie cellulaire → VésiculoScope → rubrique → module → accueil, avec chemins relatifs. |
| Phases futures | Aucune commande active dans la feuille de route des phases 2/3. |

Un essai supplémentaire de la variante sans PDF personnel vérifie le parcours utilisé par la CI. Le test de l’import exact est exécuté localement avec `--pdf`, et n’est pas annoncé comme exécuté dans la CI publique.

## Préservation de l’Ostéoscope

Aucun fichier dans `histologie/` n’est modifié par cette branche. Le fichier `histologie/osteoscope/application.html` reste identique à l’original : 3 158 205 octets ; SHA-256 `2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c`.

Le contrôle de régression existant a été relancé : 35 vues responsive de la plateforme et 25 scénarios original/intégré de l’Ostéoscope, avec états et pixels WebGL identiques. La navigation, les coupes, la transparence, les couches, les sept tissus, les onze types cellulaires, la matrice, la rotation et le pincement émulé passent sans erreur JavaScript/HTTP.

## Preuves et reproductibilité

Rapports : `qa-results.json` pour le module, `qa-ci-results.json` pour la variante sans PDF et `osteoscope-regression.json` pour l’application préservée. Les rapports contiennent leurs heures, version du navigateur et empreintes des entrées testées. Les fichiers sont référencés par empreinte, pas par une affirmation de déploiement distant.

Les captures sont livrées dans l’archive de revue, hors des ressources du site. Le module utilise environ 103 Ko de HTML, CSS et JavaScript locaux, sans bibliothèque de rendu, police distante ni modèle téléchargé. La boucle d’animation est suspendue au repos et en arrière-plan.

## Limites à vérifier sur un véritable iPad

Les essais sont réalisés sous Chromium 154 et Playwright 1.62.0 dans un environnement Linux. Ils ne prouvent pas une validation matérielle Safari/iPadOS. Le moteur WebKit de test de cet environnement n’a pas pu démarrer faute de bibliothèques système lors des vérifications précédentes ; aucun succès Safari n’est revendiqué.

Avant fusion, vérifier sur l’iPad : pincement et déplacement dans la carte, sélection des structures proches, mode Agrandir en paysage, menus natifs et sources, association locale du CM5 en HTTPS, ouverture du lien PDF à la page demandée, retour après veille, puis lancement de l’Ostéoscope. Le support des fragments `#page=` dépend du lecteur PDF du navigateur : le numéro demandé est toujours affiché dans le dialogue pour permettre d’y accéder manuellement.

La 2,5D reste une représentation pédagogique : pas de rotation spatiale 3D, pas de dimensions ni de cinétique réelles, pas de simulation moléculaire ou de diagnostic.
