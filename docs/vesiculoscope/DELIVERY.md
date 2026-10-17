# Livraison du VésiculoScope — Phase 1

## Branche et périmètre

Branche : `feat/vesiculoscope-phase-1`.

Base : `327cd3e53aa26ddf0250b90bac0606c5742d8c9c`, plateforme déjà présente sur `origin/main`. La branche locale `backup/pre-vesiculoscope-2026-10-17` conserve cette base ; la sauvegarde de l’Ostéoscope initial reste aussi disponible. `main` n’a pas été modifiée pendant ce travail.

## Fichiers créés ou modifiés

| Fichier | Rôle |
| --- | --- |
| `biologie-cellulaire/vesiculoscope/index.html` | Interface, cellule, lecteur, fiches et sources. |
| `biologie-cellulaire/vesiculoscope/styles.css` | Design du module, tactile, responsive et mode d’agrandissement. |
| `biologie-cellulaire/vesiculoscope/content.js` | Sources, 13 structures, quatre cargaisons et 55 étapes. |
| `biologie-cellulaire/vesiculoscope/scene.js` | Dessin 2,5D, routes, manteaux, marqueurs et caméra. |
| `biologie-cellulaire/vesiculoscope/app.js` | Lecture, fiches, sélection, filtres et association locale du PDF. |
| `biologie-cellulaire/index.html` | Carte de lancement du module et périmètre des fonctions futures. |
| `index.html` | Statut VésiculoScope disponible sur la carte Biologie cellulaire. |
| `scripts/check_vesiculoscope.cjs` | Contrôles des données, des sources et des séquences scientifiques. |
| `scripts/vesiculoscope_qa.py` | Essais navigateur, gestes, parcours, PDF et chemins Pages. |
| `scripts/check_site.py`, `scripts/browser_qa.py` | Extension des contrôles et du serveur de test aux modules interactifs ; contrôle d’intégrité inchangé. |
| `.github/workflows/validate.yml` | Validation du module et tests navigateur sans déploiement. |
| `README.md` | Périmètre courant et instructions du module et de ses tests. |
| `docs/vesiculoscope/` | Architecture, sources, provenance du CM5, qualité, rapports, livraison et texte de PR. |

## Utiliser le patch propre à cette phase

Le patch `vesiculoscope-phase1-complet.patch` contient uniquement l’évolution depuis la plateforme intégrée. Il ne faut pas lui substituer l’ancien patch de création initiale de la plateforme.

Dans un nouveau dossier contenant ce patch, avec Git configuré à votre nom :

```sh
git clone https://github.com/k952jsvj66-del/femur-3d.git femur-3d-vesiculoscope-review
cd femur-3d-vesiculoscope-review
git rev-parse origin/main
```

La base attendue est `327cd3e53aa26ddf0250b90bac0606c5742d8c9c`. Si elle a changé, arrêter et adapter le patch à la nouvelle version au lieu de réinitialiser `main`.

```sh
git branch --no-track backup/pre-vesiculoscope-2026-10-17 origin/main
git switch --no-track -c feat/vesiculoscope-phase-1 origin/main
git am ../vesiculoscope-phase1-complet.patch
python scripts/check_site.py
node scripts/check_vesiculoscope.cjs
git diff --exit-code backup/pre-vesiculoscope-2026-10-17:histologie/osteoscope/application.html HEAD:histologie/osteoscope/application.html
```

La dernière commande doit être silencieuse : le fichier d’origine ne doit présenter aucune différence. Si `git am` rencontre un conflit, exécuter `git am --abort` et adapter le patch ; ne pas remplacer l’application pour contourner un conflit.

Prévisualisation : `python -m http.server 8000 --bind 127.0.0.1 --directory .`, puis `http://127.0.0.1:8000/biologie-cellulaire/vesiculoscope/`.

## Envoyer la branche et préparer la PR

Avec une connexion GitHub disposant des autorisations d’écriture requises pour le contenu et le workflow :

```sh
gh auth status
gh auth setup-git
git push origin backup/pre-vesiculoscope-2026-10-17
git push -u origin feat/vesiculoscope-phase-1
gh pr create --repo k952jsvj66-del/femur-3d --base main --head feat/vesiculoscope-phase-1 --draft --title "Ajouter VésiculoScope — Trafic vésiculaire, phase 1" --body-file docs/vesiculoscope/PULL_REQUEST.md
```

Ne pas pousser sur `main` ni utiliser de push forcé. Vérifier la référence distante et l’URL effective de PR :

```sh
git ls-remote --heads origin feat/vesiculoscope-phase-1
gh pr view feat/vesiculoscope-phase-1 --repo k952jsvj66-del/femur-3d --json url,state,isDraft,baseRefName,headRefName
```

Une PR ne doit être annoncée comme créée que si GitHub renvoie son URL. Un refus 403 laisse les commits et fichiers locaux intacts. Les résultats de la tentative réelle et l’état distant sont joints à la livraison externe, avec les sources et le patch.

La publication publique reste celle de `main`. Une éventuelle fusion par le propriétaire constitue une étape distincte, après revue et essai Safari/iPad. Après cette fusion autorisée, vérifier le nouveau build Pages et les pages publiques, dont `/femur-3d/biologie-cellulaire/vesiculoscope/`, sans se contenter d’un ancien statut `built`.
