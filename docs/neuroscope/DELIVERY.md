# Récupérer et proposer le NeuroScope

Cette livraison concerne uniquement le NeuroScope ajouté à la plateforme qui intègre déjà l’Ostéoscope et le VésiculoScope. Base exacte : `707f33f957997eeeccd97d903babd1ecb0debd10`. Branche de travail : `feat/neuroscope-3d`. Sauvegarde locale préalable : `backup/pre-neuroscope-2026-10-17`. Ne pas employer le patch de la plateforme initiale ou celui du VésiculoScope pour cette étape.

## Méthode recommandée : patch Git

Décompresser `neuroscope-livraison.zip`. Dans un dossier neuf, après installation de Git et éventuellement GitHub CLI :

```bash
git clone https://github.com/k952jsvj66-del/femur-3d.git femur-3d-neuroscope
cd femur-3d-neuroscope
git fetch origin
git cat-file -e 707f33f957997eeeccd97d903babd1ecb0debd10^{commit}
git branch --no-track backup/pre-neuroscope-2026-10-17 707f33f957997eeeccd97d903babd1ecb0debd10
git switch --no-track -c feat/neuroscope-3d 707f33f957997eeeccd97d903babd1ecb0debd10
git am /chemin/vers/neuroscope-complet.patch
python scripts/check_site.py
node scripts/check_vesiculoscope.cjs
node scripts/check_neuroscope.mjs
```

Les scripts Node demandent Node.js 22 ou ultérieur. `git am` préserve les nouveaux fichiers et la description du commit. Si un nom de branche existe déjà, inspecter son état et choisir un autre nom : ne pas réinitialiser ni écraser une branche existante.

Si `origin/main` a avancé depuis cette base, comparer puis fusionner ses changements **dans la branche NeuroScope** avant d’ouvrir la PR :

```bash
git log --oneline 707f33f957997eeeccd97d903babd1ecb0debd10..origin/main
git merge origin/main
python scripts/check_site.py
node scripts/check_neuroscope.mjs
```

En cas de conflit, ne pas remplacer le fichier original `histologie/osteoscope/application.html` ni les fichiers du VésiculoScope par une autre version. Le NeuroScope n’a aucune modification à apporter à ces fichiers. Refaire les vérifications avant de continuer.

Pour tester le site localement :

```bash
python -m http.server 8000 --directory .
```

Ouvrir `http://localhost:8000/histologie/neuroscope/`. Les tests automatisés servent en plus le préfixe réel `/femur-3d/` :

```bash
python -m pip install playwright==1.62.0
python -m playwright install --with-deps chromium
python scripts/neuroscope_qa.py --output-dir test-results/neuroscope
python scripts/browser_qa.py --output-dir test-results/platform
```

L’option `--pdf /chemin/vers/TN1___Ron_o_2026.pdf` vérifie aussi l’import local exact, qui ne nécessite pas d’ajouter la ronéo au dépôt.

Publier seulement les branches de sauvegarde et de développement, puis créer une PR en brouillon :

```bash
git push origin backup/pre-neuroscope-2026-10-17
git push -u origin feat/neuroscope-3d
gh pr create --repo k952jsvj66-del/femur-3d --base main --head feat/neuroscope-3d --draft --title "Ajouter NeuroScope 3D à la plateforme PASS Lyon Sud" --body-file docs/neuroscope/PULL_REQUEST.md
```

Sans GitHub CLI, ouvrir `https://github.com/k952jsvj66-del/femur-3d/compare/main...feat/neuroscope-3d` après le push. Examiner la PR et ses tests ; **ne pas fusionner avant l’accord du propriétaire**. Les validations GitHub Actions ne publient pas le site. La publication GitHub Pages reste liée au mécanisme déjà configuré pour `main`, après une fusion ultérieure autorisée.

## Deux autres méthodes

`neuroscope.bundle` contient l’historique et les branches permettant une récupération hors ligne. Vérifier puis importer depuis un clone existant :

```bash
git bundle verify /chemin/vers/neuroscope.bundle
git fetch /chemin/vers/neuroscope.bundle refs/heads/feat/neuroscope-3d:refs/heads/recovery/neuroscope-3d
git switch recovery/neuroscope-3d
```

`neuroscope-sources.zip` contient l’ensemble des sources, y compris les modules conservés. Il permet une consultation sans Git. Pour préparer une PR, préférer le patch ou le bundle, qui rendent explicites la base et les changements ; ne pas téléverser l’archive entière sur `main`.

Le manifeste SHA-256 de livraison permet de contrôler les archives téléchargées. Le rapport `publication-status.json` précise si la branche et une PR existent réellement sur GitHub. Une archive locale ou un lien de comparaison préparé ne constituent pas une publication.
