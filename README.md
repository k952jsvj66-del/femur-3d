# PASS Lyon Sud

Plateforme interactive de révision, statique et compatible avec GitHub Pages. Cette première version propose un accueil, quatre rubriques et l’Ostéoscope complet. Les nouveaux modèles scientifiques et le moteur QCM restent en préparation.

Projet personnel indépendant de l’Université Claude Bernard Lyon 1 et du Tutorat Santé Lyon Sud.

## Structure

```text
index.html                         Accueil
assets/                            Styles communs, identité et illustrations SVG
biologie-cellulaire/index.html      Présentation — module en préparation
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

Ouvrir `http://127.0.0.1:8000/`. Aucun paquet JavaScript, compilation, serveur applicatif ou compte utilisateur n’est nécessaire. Les pages principales fonctionnent sans JavaScript ; seul l’Ostéoscope utilise son JavaScript existant. Les chemins relatifs fonctionnent aussi sous `/femur-3d/` sur GitHub Pages.

## Vérifier

```sh
python scripts/check_site.py
```

Les contrôles vérifient l’intégrité de l’application, les routes, les ancres, les ressources locales, les SVG et les métadonnées de base. Ils sont repris par GitHub Actions, sans étape de publication.

Les essais navigateur nécessitent Python, Git, Playwright et Chromium ou WebKit :

```sh
python -m pip install playwright==1.62.0
python -m playwright install --with-deps chromium webkit
python scripts/browser_qa.py --browser chromium
python scripts/browser_qa.py --browser webkit
```

Si Chromium est déjà installé, le script le détecte ; sinon il utilise celui de Playwright. `--executable /chemin/du/navigateur` permet un choix explicite. Le script sert uniquement les pages et ressources du projet sur une adresse de boucle locale, sous `/femur-3d/`. Il compare aussi les interactions et les pixels WebGL à l’application récupérée du commit initial. Utiliser un clone avec son historique ; le contrôle statique peut aussi fonctionner sur une archive sans `.git`.

Résultats et limites : [contrôle qualité](docs/QUALITY.md). Configuration et publication : [déploiement](docs/DEPLOYMENT.md).

Si l’intégration GitHub reste bloquée, `pass-lyon-sud-complet.patch` permet de récupérer tous les changements avec `git am` dans un clone neuf. La [procédure de récupération et de création de PR](docs/DEPLOYMENT.md) conserve une branche de sauvegarde, vérifie l’identité de l’Ostéoscope et ne modifie jamais directement `main`. Le bundle et le ZIP des sources offrent deux autres méthodes de récupération.

## Ajouter du contenu

Dupliquer la structure d’une page et réutiliser `assets/styles.css`. Les pages restent des documents HTML ordinaires, avec navigation et contenu présents dès le chargement. Mettre à jour les menus et l’accueil quand une nouvelle rubrique devient disponible.

Avant d’ajouter des QCM ou des documents, consulter [le modèle de contenu futur](docs/CONTENT_MODEL.md) et [les sources vérifiées](docs/SOURCES.md). Aucune question, annale, correction ou donnée de progression n’est intégrée dans cette version. Aucun document utilisateur n’est collecté.
