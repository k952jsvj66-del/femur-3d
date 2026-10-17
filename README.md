# PASS Lyon Sud

Plateforme interactive de révision, statique et compatible avec GitHub Pages : un accueil, quatre rubriques, l’Ostéoscope complet et la phase 1 du VésiculoScope. Les vues moléculaires avancées, l’autophagie et le moteur QCM restent en préparation.

Projet personnel indépendant de l’Université Claude Bernard Lyon 1 et du Tutorat Santé Lyon Sud.

## Structure

```text
index.html                         Accueil
assets/                            Styles communs, identité et illustrations SVG
biologie-cellulaire/index.html      Présentation et lancement du VésiculoScope
biologie-cellulaire/vesiculoscope/  Cellule 2,5D, quatre cargaisons et fiches CM5
histologie/index.html               Catalogue des modules histologiques
histologie/osteoscope/index.html    Navigation + application dans son propre document
histologie/osteoscope/application.html  Ostéoscope d’origine, strictement inchangé
embryologie/index.html              Présentation — module en préparation
qcm-annales/index.html              UE2, UE5 et sources ; entraînement en préparation
docs/                              Préservation, sources, extension et contrôle qualité
scripts/                           Contrôles statiques et essais navigateur
.github/workflows/validate.yml      Validation sans déploiement
.nojekyll                          Publication statique sans traitement Jekyll
```

## Préservation de l’Ostéoscope

Le fichier `histologie/osteoscope/application.html` est identique à `index.html` au commit `696c28c2386d58a0341391888e2c1ad2664b3300`. Cette version a été comparée au fichier du site public le 17 octobre 2026 : contenu identique.

SHA-256 : `2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c` — 3 158 205 octets.

La page `/histologie/osteoscope/` ajoute seulement une navigation autour d’une iframe. L’application conserve son document, son moteur WebGL, ses géométries embarquées, ses styles, ses scripts et ses gestes. Aucun script de la plateforme n’est injecté dans l’application. Le lien « Agrandir » ouvre le fichier original directement ; le bouton précédent du navigateur permet de revenir à la plateforme.

Une branche locale `backup/osteoscope-2026-10-17` conserve aussi l’état initial du dépôt. Ne pas modifier l’original pendant l’ajout de nouveaux contenus. La preuve et le manifeste de référence figurent dans [le manifeste de préservation](docs/osteoscope-preservation.json).

## Prévisualiser

Depuis le dépôt :

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory .
```

Ouvrir `http://127.0.0.1:8000/`. Aucun paquet JavaScript, compilation, serveur applicatif ou compte utilisateur n’est nécessaire. Les pages principales fonctionnent sans JavaScript ; les deux modules interactifs chargent leurs scripts seulement à leur ouverture. Les chemins relatifs fonctionnent aussi sous `/femur-3d/` sur GitHub Pages.

Le VésiculoScope est accessible à `http://127.0.0.1:8000/biologie-cellulaire/vesiculoscope/`. Il suit quatre cargaisons à travers 55 étapes référencées dans la fiche CM5 fournie, avec précisions externes séparées. Le PDF peut être associé localement pour ouvrir les pages citées ; il n’est pas redistribué avec le site. Voir [architecture et périmètre](docs/vesiculoscope/ARCHITECTURE.md) et [sources et décisions scientifiques](docs/vesiculoscope/SOURCES.md).

## Vérifier

```sh
python scripts/check_site.py
node scripts/check_vesiculoscope.cjs
```

Les contrôles vérifient l’intégrité de l’application, les routes, les ancres, les ressources locales, les SVG et les métadonnées de base. Ils sont repris par GitHub Actions, sans étape de publication.

Les essais navigateur nécessitent Python, Git, Playwright et Chromium ou WebKit :

```sh
python -m pip install playwright==1.62.0
python -m playwright install --with-deps chromium webkit
python scripts/browser_qa.py --browser chromium
python scripts/browser_qa.py --browser webkit
python scripts/vesiculoscope_qa.py --output-dir test-results/vesiculoscope
```

Si Chromium est déjà installé, le script le détecte ; sinon il utilise celui de Playwright. `--executable /chemin/du/navigateur` permet un choix explicite. Le script sert uniquement les pages et ressources du projet sur une adresse de boucle locale, sous `/femur-3d/`. Il compare aussi les interactions et les pixels WebGL à l’application récupérée du commit initial. Utiliser un clone avec son historique ; le contrôle statique peut aussi fonctionner sur une archive sans `.git`.

L’option `--pdf /chemin/vers/Fiche_synthese_CM5.pdf` du test VésiculoScope vérifie aussi l’association locale de la fiche exacte et le rejet d’une autre version. En CI, le PDF personnel n’est pas fourni : cette partie est testée localement et documentée séparément. Les jobs GitHub Actions valident les fichiers et le parcours du VésiculoScope ; ils ne déploient pas le site.

Résultats et limites : [contrôle qualité](docs/QUALITY.md). Configuration et publication : [déploiement](docs/DEPLOYMENT.md).

Si l’intégration GitHub reste bloquée, `pass-lyon-sud-complet.patch` permet de récupérer tous les changements avec `git am` dans un clone neuf. La [procédure de récupération et de création de PR](docs/DEPLOYMENT.md) conserve une branche de sauvegarde, vérifie l’identité de l’Ostéoscope et ne modifie jamais directement `main`. Le bundle et le ZIP des sources offrent deux autres méthodes de récupération.

Cette procédure et ce patch concernent la livraison initiale de la plateforme. Le VésiculoScope est développé sur `feat/vesiculoscope-phase-1`, depuis la plateforme intégrée au commit `327cd3e53aa26ddf0250b90bac0606c5742d8c9c`. Ses instructions, son patch propre et ses résultats sont regroupés dans `docs/vesiculoscope/` et sa livraison dédiée.

## Ajouter du contenu

Dupliquer la structure d’une page et réutiliser `assets/styles.css`. Les pages restent des documents HTML ordinaires, avec navigation et contenu présents dès le chargement. Mettre à jour les menus et l’accueil quand une nouvelle rubrique devient disponible.

Avant d’ajouter des QCM ou des documents, consulter [le modèle de contenu futur](docs/CONTENT_MODEL.md) et [les sources vérifiées](docs/SOURCES.md). Aucune question, annale, correction ou donnée de progression n’est intégrée dans cette version. Aucun document utilisateur n’est collecté.
