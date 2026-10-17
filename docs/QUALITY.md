# Contrôle qualité — 17 octobre 2026

## Version de référence

Le fichier publié sur GitHub Pages et `index.html` du commit `696c28c2386d58a0341391888e2c1ad2664b3300` sont identiques : 3 158 205 octets ; SHA-256 `2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c`.

Le fichier déplacé vers `histologie/osteoscope/application.html` est strictement identique. Il n’a aucune ressource locale externe, aucun CDN, aucun import et aucun appel `fetch` à réécrire. Géométries, shaders, coupes et sources scientifiques restent embarqués. La navigation ajoutée est dans un document parent distinct.

## Contrôles automatisés

Commandes exécutées : `python scripts/check_site.py`, `node --check` sur le script original extrait sans modification, et `python scripts/browser_qa.py --output-dir /workspace/pass-qa`.

| Contrôle | Résultat |
| --- | --- |
| Comparaison binaire au commit initial | Conforme ; aucune modification de l’application. |
| HTML et ressources locales | 7 documents HTML, 78 liens/ressources/ancres valides, 5 SVG valides. |
| Chemins GitHub Pages | Routes réellement servies sous `/femur-3d/` dans les essais navigateur. |
| JavaScript original | Vérification de syntaxe Node réussie. |
| Pages principales | 35 vues : 5 pages × 7 formats, de 320 × 800 à 1366 × 900. |
| Navigation | Quatre cartes et retours à l’accueil testés avec JavaScript désactivé. |
| Clavier | Lien d’accès direct au contenu accessible au premier Tab, visible au focus et activable avec Entrée. |
| Lisibilité tactile | Liens de navigation, accès directs et cartes d’au moins 44 px de hauteur ; aucune page principale ne déborde horizontalement. |
| Ressources | Images chargées ; aucune requête vers l’application 3D tant que son module n’est pas ouvert. |
| Intégration Ostéoscope | Navigation accueil → histologie → application → affichage agrandi → retour testée. |
| Gestes émulés | Rotation à un doigt et pincement à deux doigts envoyés comme événements tactiles via Chromium ; effet vérifié sur la caméra. |
| Rendu original / intégré | 25 scénarios comparés : états et empreintes des pixels du canvas identiques à taille de viewport identique. |
| Application sur tablette/téléphone | Quatre formats supplémentaires, dont 1024 × 768, 834 × 1194, 768 × 1024 et 390 × 844 ; contrôles compacts accessibles. |
| Erreurs navigateur | Aucune erreur JavaScript et aucune réponse HTTP en erreur dans le parcours testé. |

Les 25 comparaisons couvrent l’état initial, les trois plans de coupe et l’inversion de la moitié conservée, la position de coupe, la transparence, une modification de couche, les sept tissus, les onze types cellulaires et la matrice. Le parcours vérifie aussi les étiquettes, le zoom automatique, les fenêtres d’aide et de sources, le zoom manuel et la rotation à la souris dans l’iframe.

Le rapport machine est conservé dans [qa-results.json](qa-results.json), la tentative WebKit dans [qa-webkit-results.json](qa-webkit-results.json), et le résultat des vérifications externes dans [external-links.json](external-links.json).

Le rapport navigateur indique désormais son état (`passed`, `failed`, `interrupted`), l’heure de début et de fin, la version du navigateur et les empreintes de ses fichiers d’entrée. Un lancement raté remplace le rapport précédent par un échec explicite au lieu de laisser un ancien succès. Les lecteurs et écrivains Python utilisent explicitement UTF-8, y compris pour les documents en français sur une machine dont l’encodage par défaut serait différent.

Environnement de référence : Chromium installé dans le conteneur, Playwright 1.62.0, rendu WebGL logiciel SwiftShader, DPR 1. Les comparaisons de pixels portent sur les deux documents dans ce même environnement, pas sur une promesse de pixels identiques entre GPU ou navigateurs.

La plateforme statique complète, hors application, représente moins de 50 Ko pour ses pages, styles et illustrations. Elle ne charge ni police distante ni bibliothèque JavaScript. Le fichier 3D de 3,16 Mo est chargé à la demande.

## Récupération de la livraison

Un patch unique `pass-lyon-sud-complet.patch`, au format `git format-patch --stdout --binary`, contient l’ensemble des commits depuis la version initiale. Il conserve le renommage identique à 100 % de l’Ostéoscope. La procédure de livraison applique ce patch avec `git am` dans un clone distinct à partir du commit initial, compare l’arbre Git obtenu avec celui de la branche de travail, puis relance les contrôles statiques sur cette copie récupérée. Le résultat de cette vérification est joint dans l’archive de livraison.

Le bundle contient l’historique et la branche de sauvegarde, tandis que le ZIP permet une inspection sans Git. Les trois formats restent des livrables à récupérer ; ils ne constituent pas une publication sur GitHub. Les commandes de récupération, de vérification, d’envoi des branches et de création d’une PR brouillon figurent dans [DEPLOYMENT.md](DEPLOYMENT.md).

## Sources et publication

Les cinq liens externes affichés dans la rubrique QCM ont été vérifiés en ligne. Le PDF de la bibliothèque numérique répond 200 et porte bien la signature PDF ; il n’a pas été recopié. Voir [les observations documentaires](SOURCES.md).

L’API GitHub Pages confirme que le déploiement public actuel est `built`, sans erreur, depuis le commit initial sur `main` / `/`. La nouvelle branche n’a pas été fusionnée, la source de publication n’a pas été changée et aucun déploiement de la plateforme n’a été lancé. Les contrôles locaux ne sont pas présentés comme une vérification de son déploiement public.

## Limites et vérification sur un véritable iPad

WebKit 26.5 a pu être téléchargé, mais son démarrage est bloqué par l’absence de bibliothèques système (`libgtk-4`, `libgraphene`, `libharfbuzz-icu`, `libmanette`, `libhyphen`, `libGLESv2`). Aucun essai Safari/WebKit n’a donc réussi dans cet environnement. Les formats tablette et les gestes émulés sous Chromium ne remplacent pas Safari sur iPadOS.

À vérifier sur un véritable iPad avant intégration :

1. Accès au module, retour Histologie et accueil, puis lien « Agrandir » et précédent du navigateur.
2. Rotation à un doigt, pincement à deux doigts et absence d’interférence avec le défilement des panneaux.
3. Coupes transversale, sagittale et frontale, rail de position et inversion ; transparence et couches.
4. Exploration tissu → cellule → matrice, sélection des différents tissus et ouverture des sources.
5. Bascule portrait/paysage, variation de la hauteur disponible avec la barre Safari, tactile et Apple Pencil si utilisé.
6. Retour à l’onglet après mise en veille : pression mémoire/WebGL propre au matériel. Le mécanisme original de perte du contexte reste inchangé.

L’identité binaire est une garantie forte de conservation du code ; le document parent ajoute une barre de navigation qui réduit la hauteur disponible d’environ 53 px. Les essais de redimensionnement vérifient cette intégration ; seul le test matériel permet de confirmer les particularités d’iPadOS et de son GPU.
