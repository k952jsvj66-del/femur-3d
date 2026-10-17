# Publication et revue

État observé le 17 octobre 2026, sans modification des paramètres du dépôt :

- URL publique : <https://k952jsvj66-del.github.io/femur-3d/>.
- GitHub Pages : état `built`, type `legacy`, branche source `main`, répertoire `/`, HTTPS imposé.
- L’URL publique répond en HTTP 200 et correspond exactement à l’Ostéoscope du commit `696c28c2386d58a0341391888e2c1ad2664b3300`.
- Le dépôt initial n’a que `README.md` et `index.html` ; pas de ressource locale ni de dépendance externe à déplacer.

## Avant intégration

La plateforme est développée sur `feat/pass-lyon-sud-platform`. Ne pas changer la source Pages vers cette branche et ne pas fusionner sans l’accord explicite du propriétaire. Le workflow `validate.yml` exécute uniquement des contrôles : il ne contient aucune action de déploiement et n’a que la permission `contents: read`.

La connexion GitHub utilisée pendant cette réalisation a refusé les créations de références distantes avec HTTP 403, `Resource not accessible by integration`, à la fois via le connecteur et via `gh api`. L’authentification et la lecture fonctionnent. Les permissions du compte sur le dépôt ne garantissent donc pas les permissions de l’intégration. Le travail, la branche et la sauvegarde restent disponibles localement ; voir le compte rendu de livraison pour l’état de l’envoi et de la PR. Ne pas annoncer une PR créée sans URL retournée par GitHub.

## Récupérer le patch complet dans un clone neuf

Les commandes ci-dessous sont destinées à un ordinateur avec Git, Python 3.12 et GitHub CLI (`gh`), ou à un terminal de développement équivalent. Git doit être configuré à votre nom. Télécharger `pass-lyon-sud-complet.patch`, puis ouvrir un terminal dans le dossier qui contient ce fichier. Le patch regroupe tous les commits de la livraison, pas seulement les derniers ajustements.

```sh
git clone https://github.com/k952jsvj66-del/femur-3d.git femur-3d-pass-review
cd femur-3d-pass-review
git rev-parse origin/main
```

La référence de départ attendue est exactement `696c28c2386d58a0341391888e2c1ad2664b3300`. Si `origin/main` a changé depuis la livraison, arrêter ici et faire adapter le patch à cette nouvelle version, afin de préserver aussi les éventuelles modifications ultérieures. Ne pas réinitialiser `main` pour forcer l’application du patch.

Créer ensuite une sauvegarde de l’état initial et une branche de travail, puis appliquer le patch :

```sh
git branch backup/osteoscope-2026-10-17 origin/main
git switch -c feat/pass-lyon-sud-platform origin/main
git am ../pass-lyon-sud-complet.patch
python scripts/check_site.py
git diff --exit-code backup/osteoscope-2026-10-17:index.html HEAD:histologie/osteoscope/application.html
```

Le contrôle doit annoncer l’application originale inchangée et les liens valides. La commande `git diff` doit terminer sans différence. En cas d’erreur pendant `git am`, exécuter `git am --abort`, conserver le patch et examiner le conflit ; ne pas remplacer manuellement l’Ostéoscope par un autre fichier. Si une branche du même nom existe déjà, examiner cette branche avant de continuer ; aucun `--force` n’est nécessaire.

Pour examiner la plateforme avant tout envoi :

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory .
```

Ouvrir `http://127.0.0.1:8000/`. Pour les tests comparatifs avec Playwright, suivre les commandes du `README.md`. Un ZIP des sources et un bundle Git complet sont fournis comme autres méthodes de récupération ; le patch a aussi été réappliqué dans un clone indépendant avant livraison.

## Envoyer uniquement les branches et créer la Pull Request

Utiliser votre propre connexion GitHub, avec les permissions d’écriture sur le dépôt. Vérifier l’authentification sans partager de jeton :

```sh
gh auth status
gh auth setup-git
git push origin backup/osteoscope-2026-10-17
git push -u origin feat/pass-lyon-sud-platform
gh pr create --repo k952jsvj66-del/femur-3d --base main --head feat/pass-lyon-sud-platform --draft --title "Créer la plateforme PASS Lyon Sud en préservant l’Ostéoscope" --body-file docs/PULL_REQUEST.md
```

Si l’envoi échoue encore en 403, les commits restent dans le clone local : rien n’est perdu. Ne pas lancer de push forcé, ne pas envoyer directement sur `main`, et ne pas modifier la branche source de GitHub Pages. Si l’intégration GitHub est utilisée, ses autorisations doivent permettre le contenu, les Pull Requests et la modification du workflow de validation ; les droits personnels du propriétaire ne suffisent pas si l’intégration est plus restreinte.

Vérifier ensuite la présence effective de la branche et de la PR :

```sh
git ls-remote --heads origin feat/pass-lyon-sud-platform
gh pr view feat/pass-lyon-sud-platform --repo k952jsvj66-del/femur-3d --json url,state,isDraft,baseRefName,headRefName
```

Une PR brouillon doit cibler `main`, depuis `feat/pass-lyon-sud-platform`, et GitHub doit retourner son URL. La présence des fichiers sur cette branche signifie que le travail est disponible sur GitHub ; elle ne signifie pas que le site public a été mis à jour. La fusion reste une décision distincte du propriétaire, après la revue et l’essai sur un véritable iPad.

## Après approbation et fusion par le propriétaire

La configuration existante peut rester `main` / `/`. GitHub Pages publiera les fichiers statiques de la branche principale ; aucune commande de build n’est requise.

Vérifier ensuite ces URL sur le site public :

```text
/femur-3d/
/femur-3d/biologie-cellulaire/
/femur-3d/histologie/
/femur-3d/histologie/osteoscope/
/femur-3d/histologie/osteoscope/application.html
/femur-3d/embryologie/
/femur-3d/qcm-annales/
```

Tous les liens et ressources internes sont relatifs. `.nojekyll` conserve la publication directe des fichiers. L’Ostéoscope n’est chargé qu’à l’ouverture de son module ; son fichier autonome embarque déjà ses données 3D.

Les essais locaux sous le préfixe `/femur-3d/` valident le routage, mais ne constituent pas un déploiement de la branche. La nouvelle publication doit être contrôlée après la fusion autorisée.

Contrôler le dernier build, puis ouvrir réellement l’accueil et le module ; un ancien build `built` ne prouve pas la publication de la nouvelle plateforme :

```sh
gh api repos/k952jsvj66-del/femur-3d/pages/builds/latest --jq '{status,commit,error}'
```

Le commit publié doit correspondre au commit intégré dans `main`. Après cette publication seulement, vérifier aussi l’empreinte du fichier public de l’Ostéoscope :

```sh
python -c "import hashlib, urllib.request; data = urllib.request.urlopen('https://k952jsvj66-del.github.io/femur-3d/histologie/osteoscope/application.html').read(); assert hashlib.sha256(data).hexdigest() == '2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c'; print('Ostéoscope public : copie originale intacte')"
```

## Retour à la version antérieure

Le commit source et la branche de sauvegarde locale permettent de récupérer l’ancien `index.html`. Un retour arrière public nécessite un commit de restauration ou un revert, puis une publication Pages. Ne pas réinitialiser de force `main` et ne pas effectuer cette opération sans demande du propriétaire.
