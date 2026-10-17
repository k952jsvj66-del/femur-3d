# NeuroScope 3D

Module statique accessible à `histologie/neuroscope/`, compatible avec le préfixe `/femur-3d/` de GitHub Pages. Aucun serveur applicatif, CDN d’exécution, compte utilisateur, outil de compilation ni installation ne sont nécessaires pour l’utiliser.

## Répartition des responsabilités

| Fichier | Rôle |
| --- | --- |
| `index.html`, `styles.css` | Interface responsive, navigation et commandes accessibles. |
| `app.js` | Sélection, fil d’Ariane, fiches, comparaisons, entraînement et association locale du PDF. |
| `anatomy-data.js` | 72 fiches, hiérarchie, échelles, pages de TN1 et compléments identifiés. |
| `content.js` | Provenance, références, 12 QRM originaux et tableaux comparatifs. |
| `scene.js` | WebGL, caméra, sélection par raycasting, étiquettes, coupes et rendu. |
| `models-anatomy.js` | Géométries anatomiques originales : corps, SNC, méninges, LCS et paroi digestive. |
| `models-micro.js` | Géométries histologiques originales : tissus, cellules, fibres, ganglions et barrières. |
| `assets/vendor/` | Three.js 0.160.1, OrbitControls et licence MIT, servis localement. |

Les 72 fiches s’appuient sur **48 représentants de modèles**. Certaines sélections partagent le même volume : sélectionner un feuillet méningé garde la vue de ses voisins et met la structure en évidence. Il ne s’agit pas de 72 reconstructions anatomiques indépendantes.

## Chargement et changement d’échelle

Le corps est construit en premier. Les modules de construction des géométries sont importés à la demande ; les géométries microscopiques sont créées uniquement lors de leur exploration. À chaque remplacement, les anciens buffers, matériaux et étiquettes sont libérés. La caméra effectue une transition, sauf préférence de mouvements réduits. Les régions corporelles conservent les coordonnées du corps ; un changement anatomie/tissu/cellule substitue un autre modèle, explicitement schématique et non métrique. Il ne simule pas un zoom continu physiquement mesuré.

Les gestes à un doigt tournent la scène ; deux doigts permettent le déplacement et le zoom. La sélection utilise les intersections réelles des maillages et distingue un toucher d’un glissement. Les étiquettes sont des boutons projetés, avec repositionnement pour limiter les collisions. Le menu natif des structures offre une alternative à la sélection spatiale.

Le ratio de pixels est limité à 2. Le rendu s’arrête au repos, sauf animation demandée, et lorsque le document est masqué. Le comparateur crée un second contexte WebGL à la demande et le libère à sa fermeture. L’indisponibilité de WebGL laisse les fiches et la navigation utilisables.

## Représentations et commandes

- Les trois plans de coupe déplacent une véritable surface de clipping. Les coupes sont ouvertes, sans reconstruction des surfaces de section ni reproduction d’une IRM.
- Les couches et leurs transparences agissent sur les volumes. L’écartement des méninges est artificiel ; le sous-dural n’est pas une cavité normale libre de LCS. Le modèle spinal montre un espace épidural réel.
- Quatre routes de particules illustrent la circulation principale du LCS : ventricules, sorties du IV, citernes et espaces sous-arachnoïdiens. Le canal central n’est pas inclus dans ces routes. Le mouvement est pédagogique, sans simulation de débit, pression ou pulsatilité.
- Les colorations sont des palettes appliquées aux composants histologiques. Elles ne constituent ni une lame authentique, ni une simulation physicochimique. Les synapses et organites sont agrandis pour la démonstration.
- Les trajets nerveux majeurs, reliefs, densités, proportions et orientations cellulaires sont schématiques. Tous les nerfs ne sont pas modélisés individuellement.

## Sources et entraînement

`pages` indique toujours le numéro du **fichier PDF**. La page liminaire est le repère 0 du sommaire ; les PDF p. 2–14 correspondent aux pages imprimées 1–13. Les éléments absents de TN1 ont une liste `pages` vide et un complément référencé. Les discordances de la ronéo sont documentées dans `SCIENTIFIC_AUDIT.md`.

Le PDF original et ses figures ne sont pas publiés. L’utilisateur associe son exemplaire local ; la taille et le SHA-256 sont vérifiés avant de créer un lien `blob:` avec `#page=`. Aucun fichier n’est envoyé et aucune copie n’est conservée par la plateforme. Les questions sont originales ; l’absence de droits établis et l’ambiguïté du QRM 32 excluent la recopie des annales. Les résultats de l’entraînement restent en mémoire dans la session.

Pour ajouter un contenu, créer sa fiche et ses références, lui associer un constructeur réel, puis compléter les tests. Une entrée scientifique sans modèle ne doit pas être exposée comme une fonctionnalité disponible.

## Licence et préservation

Aucun modèle anatomique tiers, figure de cours ou photographie histologique n’est incorporé. Les géométries et l’illustration de carte sont originales. Three.js et OrbitControls sont distribués sous la licence MIT fournie dans `assets/vendor/THREE-LICENSE.txt`.

Les sept fichiers de l’Ostéoscope et du VésiculoScope énumérés dans `preservation.json` sont strictement identiques à la base `707f33f957997eeeccd97d903babd1ecb0debd10`. Seule la page générale d’Histologie ajoute une carte et adapte sa présentation. La branche locale `main` n’est pas modifiée.
