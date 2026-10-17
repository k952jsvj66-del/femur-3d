# Publication et revue

État observé le 17 octobre 2026, sans modification des paramètres du dépôt :

- URL publique : <https://k952jsvj66-del.github.io/femur-3d/>.
- GitHub Pages : état `built`, type `legacy`, branche source `main`, répertoire `/`, HTTPS imposé.
- L’URL publique répond en HTTP 200 et correspond exactement à l’Ostéoscope du commit `696c28c2386d58a0341391888e2c1ad2664b3300`.
- Le dépôt initial n’a que `README.md` et `index.html` ; pas de ressource locale ni de dépendance externe à déplacer.

## Avant intégration

La plateforme est développée sur `feat/pass-lyon-sud-platform`. Ne pas changer la source Pages vers cette branche et ne pas fusionner sans l’accord explicite du propriétaire. Le workflow `validate.yml` exécute uniquement des contrôles : il ne contient aucune action de déploiement et n’a que la permission `contents: read`.

La connexion GitHub utilisée pendant cette réalisation a refusé les créations de références distantes avec HTTP 403, `Resource not accessible by integration`, à la fois via le connecteur et via `gh api`. L’authentification et la lecture fonctionnent. Les permissions du compte sur le dépôt ne garantissent donc pas les permissions de l’intégration. Le travail, la branche et la sauvegarde restent disponibles localement ; voir le compte rendu de livraison pour l’état de l’envoi et de la PR. Ne pas annoncer une PR créée sans URL retournée par GitHub.

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

## Retour à la version antérieure

Le commit source et la branche de sauvegarde locale permettent de récupérer l’ancien `index.html`. Un retour arrière public nécessite un commit de restauration ou un revert, puis une publication Pages. Ne pas réinitialiser de force `main` et ne pas effectuer cette opération sans demande du propriétaire.
