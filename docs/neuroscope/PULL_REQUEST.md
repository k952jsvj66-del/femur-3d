## Problème et résultat

La rubrique Histologie ne proposait que l’Ostéoscope. Cette PR ajoute **NeuroScope 3D — Du corps humain à la cellule nerveuse**, à `histologie/neuroscope/`, avec une carte de lancement depuis Histologie.

Le module utilise de véritables volumes WebGL sélectionnables, et non une image agrandie. Il relie 72 fiches à 48 représentants de modèles : corps et régions, SNC, méninges crâniennes/spinales, LCS, interfaces, tissus, cellules, nerfs, ganglions et plexus entériques. Rotation, déplacement, zoom tactile, couches, transparence, coupes réglables, circulation de particules, comparateurs et entraînement sont opérationnels.

## Sources et périmètre scientifique

La référence principale est la ronéo TN1 fournie de 2026, « à partir du cours du Pr Desestret ». Les pages PDF et imprimées sont distinguées. Les compléments OpenStax et revues scientifiques sont signalés séparément. L’audit expose les discordances du document, notamment interface piogliale, XI/VIII, substance blanche et origine des méninges.

Les 12 QRM et leurs 60 propositions corrigées sont originaux. Les annales 2020 ne sont pas reproduites faute de droits établis. Le PDF reste personnel et peut être associé localement, après vérification SHA-256 ; aucun envoi n’est effectué. Les modèles, reliefs, proportions, trajets, colorations et vitesses sont schématiques. Les coupes sont ouvertes, sans reconstruction d’une coupe d’imagerie. Le canal central ne porte pas la circulation principale du LCS.

## Fichiers

- Nouveau module : `index.html`, `styles.css`, `app.js`, `scene.js`, `anatomy-data.js`, `content.js`, `models-anatomy.js`, `models-micro.js` et bibliothèque Three.js/OrbitControls locale sous licence MIT.
- Intégration : carte et texte de `histologie/index.html`, illustration originale `assets/neuroscope.svg`.
- Vérifications : nouveaux scripts statique et navigateur NeuroScope, mise à jour du contrôle des SVG et du sélecteur de lancement de l’Ostéoscope (deux cartes sont désormais présentes).
- Documentation : README et dossier `docs/neuroscope/` ; job GitHub Actions de validation, sans déploiement.

## Préservation

Les sept fichiers protégés de l’Ostéoscope et du VésiculoScope sont identiques à la base `707f33f957997eeeccd97d903babd1ecb0debd10`. L’application originale conserve ses 3 158 205 octets et son SHA-256 `2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c`. Aucun moteur, géométrie, coupe ou fonction microscopique des modules existants n’a été modifié.

## Validation

Voir `docs/neuroscope/QUALITY.md` et les rapports JSON associés pour les commandes, résultats et limites : contrôles des modèles et sources, parcours UI exhaustif, gestes tactiles, vrais pixels de rendu, plans de coupe, LCS, comparaisons, QRM, association privée du PDF, chemins `/femur-3d/`, régression de l’Ostéoscope. Les essais sur navigateur Linux ne remplacent pas une validation matérielle sur Safari/iPadOS.

Branche de développement distincte, sans modification de la branche locale `main`, sans fusion ni publication automatique demandée par cette PR.
