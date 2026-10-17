# VésiculoScope — Phase 1

Entrée : `/biologie-cellulaire/vesiculoscope/`, avec chemins relatifs compatibles avec la publication projet GitHub Pages `/femur-3d/`.

## Éléments livrés

- `index.html` : interface, commandes accessibles, fiches et dialogue des sources.
- `styles.css` : styles propres au module, adaptation tactile et mode d’agrandissement.
- `content.js` : quatre cargaisons, 55 étapes, 13 structures, routes, provenance et repères scientifiques.
- `scene.js` : dessin vectoriel en 2,5D, couches, opacités, sélection, caméra de déplacement/zoom et gestes.
- `app.js` : lecteur, progression, vitesse, inspection, carte filtrée et association locale du PDF.

Le moteur n’utilise aucune bibliothèque et ne modifie ni les fichiers de l’Ostéoscope ni ses dépendances. Le SVG est un schéma manipulable ; il ne prétend pas être une reconstruction géométrique 3D. Les quatre parcours sont : protéine sécrétée constitutive, protéine à motif KDEL, hydrolase lysosomale et LDL. L’insuline détaillée et l’autophagie ne sont pas simulées ici.

## Commandes

Glisser dans la scène déplace la caméra ; pincer ou utiliser +/− zoome ; Recentrer rétablit la vue. Les mêmes opérations sont disponibles au clavier sur la scène, avec flèches, +/− et R. Le bouton Agrandir donne plus de place à la carte, en particulier sur iPad en paysage ; Réduire revient à l’interface complète.

Les structures sont sélectionnables dans le dessin, au clavier, ou dans la liste native « Choisir un compartiment ». La fiche propose visibilité et opacité ; le menu Affichage permet de masquer des couches et les étiquettes. Ces changements concernent le dessin, sans prétendre à une transparence physique mesurée.

Le lecteur comporte lecture/pause, précédent/suivant, vitesse, progression dans l’étape et recommencement. Aucun parcours ne démarre automatiquement. Une ouverture des sources ou un passage en arrière-plan met la lecture en pause. Les animations reposent sur `requestAnimationFrame`, uniquement pendant la lecture ; les transformations du marqueur changent à chaque image et les couches stables ne sont recalculées qu’en cas de changement de contexte.

## Modèle de contenu

Une étape décrit notamment `id`, `title`, `body`, `why`, `trap`, `pages`, `phase`, `compartment`, `where`, et éventuellement `route`, `range`, `coat`, `uncoat` ou `external`. La provenance est rattachée à l’étape, jamais déduite du seul nom de scénario.

`actor: 'receptor'` et `cargoHold` représentent explicitement le retour d’un récepteur pendant que le cargo reste en place. Ce cas doit être conservé lors de l’ajout de nouveaux parcours.

## Phases suivantes

Les entrées `roadmap` sont des indications de périmètre, sans boutons ni moteurs prétendument actifs. Une future phase 2 pourra ajouter des vues moléculaires séparées et une comparaison des modèles de Golgi. Une future phase 3 pourra ajouter un moteur d’autophagie et de questions avec des données et corrections relues. Aucune banque de QCM, statistique d’étudiant, autophagie interactive ou physiologie de l’insuline n’est fictivement présentée comme disponible.

## Vérifier et prévisualiser

```sh
python scripts/check_site.py
node scripts/check_vesiculoscope.cjs
python scripts/vesiculoscope_qa.py --output-dir test-results/vesiculoscope
python scripts/browser_qa.py --output-dir test-results/platform
```

L’import local de la fiche exacte peut être testé avec `--pdf /chemin/vers/Fiche_synthese_CM5.pdf`, sans la placer dans le dépôt. Les autres dépendances de tests et la prévisualisation par un serveur HTTP local sont décrites dans le README général. Les rapports de test sont des preuves locales ; seule une référence distante et une URL de PR attestent l’envoi sur GitHub.
