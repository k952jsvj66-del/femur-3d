# Contrôle qualité — NeuroScope

Contrôles effectués le 17 octobre 2026 sur la branche `feat/neuroscope-3d`, issue de `707f33f957997eeeccd97d903babd1ecb0debd10`. Les rapports enregistrent les empreintes des fichiers réellement testés. La création d’un job CI ne signifie pas qu’il s’est exécuté sur GitHub : les résultats ci-dessous sont ceux des essais locaux.

## Résultats

| Vérification | Résultat |
| --- | --- |
| Préservation des modules existants | Sept fichiers protégés identiques à la base Git ; Ostéoscope 3 158 205 octets, SHA-256 d’origine conservé. |
| Navigation et ressources statiques | Neuf documents HTML, 102 liens/ressources/ancres locaux et six SVG vérifiés sous le préfixe `/femur-3d/`. |
| Données et géométries NeuroScope | 72 fiches, 48 représentants de modèles, hiérarchie sans cycle, pages dans le PDF 1–14, identifiants de sélection résolus, matrices et attributs géométriques finis. |
| Navigation UI exhaustive | Toutes les fiches chargent un modèle rendu, un panneau explicatif et leurs références ; transitions et fil d’Ariane contrôlés. |
| Caméra et sélection | Zoom, rotation, déplacement, vrai toucher sur un maillage, sélection par étiquettes, gestes à deux doigts et boutons tactiles vérifiés. |
| Coupes | Trois normales distinctes ; déplacement du plan modifiant les pixels rendus. |
| Couches et méninges | Visibilité, opacité, isolation, écartement et progression de la traversée ; différence crâne/rachis modélisée. |
| LCS | Déplacement réel des particules, lecture, arrêt et vitesse ; quatre routes principales excluant le canal central. |
| Histologie et cellules | Cinq palettes distinctes, bascule de morphologie microgliale, modèles SNC/SNP et interfaces. |
| Comparaisons | Six paires de vrais modèles ; disposition côte à côte sur ordinateur et iPad, tableau comparatif et révélation des différences ganglionnaires. |
| Entraînement | 12 QRM originaux, 60 propositions corrigées, garde de sélection vide, réponse erronée, validation exacte, liens vers les structures et sources. |
| PDF privé | Association du PDF exact par SHA-256, lien `blob:#page`, rejet de taille différente et d’un faux de même taille ; aucun envoi. |
| Responsive Chromium | Huit formats de 320 à 1440 px, pas de débordement horizontal, mode agrandi iPad et retour vers Histologie/accueil. |
| WebKit Linux | WebKit 26.5, 1024×768 et 834×1194 ; cinq modèles aux pixels distincts, méninges, LCS, microglie, QRM, dialogue et PDF local. |
| Mode dégradé | Fiches et navigation conservées lorsque WebGL est indisponible ; mouvements réduits respectés. |
| Régression de la plateforme | 35 vues de pages sur sept formats, navigation tactile et sans JavaScript ; 25 scénarios Ostéoscope strictement identiques en états et pixels. |
| Erreurs | Aucune erreur JavaScript ni ressource HTTP manquante durant les parcours finalisés ; aucune dépendance d’exécution distante. |

Les captures WebKit ont été inspectées : attendre uniquement le chargement d’un objet ne garantissait pas la présentation du nouveau buffer. Le moteur effectue désormais des frames de stabilisation après chargement et un nouveau rendu quand le canvas redevient visible. Les rapports livrés correspondent à cette version. Les premiers essais de travail ne sont pas les rapports de livraison.

## Reproduire

```bash
python scripts/check_site.py
node scripts/check_vesiculoscope.cjs
node scripts/check_neuroscope.mjs
python scripts/neuroscope_qa.py --output-dir test-results/neuroscope
python scripts/neuroscope_webkit_qa.py --output test-results/neuroscope-webkit
python scripts/browser_qa.py --output-dir test-results/platform
```

Node.js 22+, Python, Playwright 1.62.0 et ses navigateurs sont nécessaires aux essais, pas à l’utilisation du site. Installer les navigateurs de test avec `python -m playwright install --with-deps chromium webkit`. Le script Chromium choisit Chromium installé, ou celui de Playwright. Les tests servent uniquement des fichiers autorisés du projet sur une adresse de boucle locale.

Pour le test du document personnel, ajouter `--pdf /chemin/vers/TN1___Ron_o_2026.pdf`. Sans cette option, le rapport indique explicitement que l’association du PDF exact n’a pas été testée. Les faux fichiers et la confidentialité des requêtes restent contrôlés. En CI, le document privé est absent.

Dans cet environnement, les bibliothèques système manquantes de WebKit ont été extraites dans un dossier temporaire, sans installation système ni modification du site. Le runner utilise normalement Playwright WebKit ; `NEURO_WEBKIT_EXECUTABLE` permet de choisir explicitement un binaire de test. Le rapport ne présente jamais WebKit Linux comme Safari sur iPad.

## Rapports livrés

- `qa-chromium.json` : parcours exhaustif, références et empreintes des entrées.
- `qa-webkit.json` : rendu WebKit réel, captures et empreintes locales/servies.
- `osteoscope-regression.json` : comparaison avec l’original historique et pages de la plateforme.
- `static-results.txt`, `preservation.json`, `tn1-provenance.json` : contrôles, fichiers protégés et provenance.

Le manifeste de l’archive associe les captures aux fichiers téléchargés.

## Essai restant sur un véritable iPad

Le matériel iPadOS/Safari n’est pas disponible ici. Vérifier sur l’appareil : rotation à un doigt, déplacement/zoom à deux doigts, retour du canvas après défilement, panneau d’affichage et réglages tactiles, comparaison paysage/portrait, lien PDF local, changement d’orientation et performances prolongées. WebKit Linux fournit une vérification supplémentaire du moteur, sans reproduire la pile graphique ou la gestion mémoire d’iPadOS.

Les modèles sont des schémas originaux non métriques ; ils ne prétendent pas reconstruire un adulte particulier, tous les nerfs individuellement ou de vraies lames histologiques. La validation des liens et des interfaces ne constitue pas une validation du contenu par l’enseignant. Les décisions et sources sont détaillées dans `SCIENTIFIC_AUDIT.md`.
