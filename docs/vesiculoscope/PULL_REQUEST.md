# Ajouter VésiculoScope — Trafic vésiculaire, phase 1

La rubrique Biologie cellulaire n’avait pas encore de module d’exploration. Cette PR ajoute le VésiculoScope : une cellule schématique manipulable et quatre parcours de cargaisons, pour distinguer COPII, COPI et clathrine et suivre le devenir du cargo et de ses récepteurs.

## Comportement livré

- Cellule 2,5D vectorielle, déplacement/zoom tactiles et clavier, sélection de 13 structures, visibilité, opacité et étiquettes ; mode Agrandir pour donner plus de place à la carte.
- Quatre cargaisons : protéine sécrétée constitutive, protéine portant KDEL, hydrolase lysosomale et LDL. Cinquante-cinq étapes, lecture/pause, précédent/suivant, vitesse, progression et recommencement.
- Carte de toutes les voies ou d’un parcours, filtres par manteau, fiches avec Pourquoi et pièges pédagogiques originaux. Les récepteurs recyclés sont distingués des cargos restés en place.
- Sources par page de la fiche CM5 fournie ; association locale et vérifiée du PDF pour ouvrir les renvois sans publier le document. Les compléments scientifiques sont signalés séparément.
- Carte de lancement dans Biologie cellulaire et statut actualisé sur l’accueil. Les autres phases restent une feuille de route sans fonctions prétendument opérationnelles.

Le PDF de référence est une fiche de synthèse de huit pages portant la mention « D’après le cours du Pr Buffoni — Lyon Sud ». Le module ne l’attribue pas à une validation officielle de l’enseignant. Une précision explicite limite la généralisation de la dynamine dans la fiche ; les étapes du M6P, le cycle KDEL, les adaptateurs et le tri endosomal sont référencés dans `docs/vesiculoscope/SOURCES.md`.

## Préservation

Branche fondée sur `327cd3e53aa26ddf0250b90bac0606c5742d8c9c`, version de la plateforme déjà intégrée. Aucun fichier de l’Ostéoscope ni de `histologie/` n’est modifié. L’application d’origine conserve son empreinte SHA-256 `2510d3635bf72a727715c5e8a1d338761622f63cf858bb3aa211c1b16b17d31c`.

## Validation

- Contrôle statique : huit pages HTML, 91 liens/ressources/ancres ; intégrité de l’Ostéoscope.
- Invariants : 55 étapes sourcées, ordre M6P, retrait des manteaux avant fusion et séparation cargo/récepteur.
- Navigateur : huit formats, toutes les étapes, 30 segments mobiles, commandes, filtres, inspection, clavier, gestes, sources et navigation sous `/femur-3d/` ; aucun HTTP en erreur ni erreur JavaScript.
- Fiche privée : empreinte exacte acceptée, autre version refusée, aucun envoi réseau. Variante sans PDF vérifiée pour la CI.
- Régression : les 25 scénarios de l’Ostéoscope conservent les mêmes états et pixels WebGL ; 35 vues responsive de la plateforme passent.

Le workflow ajouté reste un workflow de validation, sans déploiement. Détails et rapports : `docs/vesiculoscope/QUALITY.md`.

## Limites de la revue

Un essai sur un véritable iPad avec Safari reste nécessaire : gestes, structures proches, mode Agrandir, menus et lecture PDF. La scène est en 2,5D, pas une reconstruction 3D métrique. Les phases 2/3, l’autophagie, l’insuline détaillée et un moteur QCM ne sont pas livrés dans cette PR.

Ne pas fusionner dans `main` sans l’accord explicite du propriétaire ; ne pas modifier la configuration de publication Pages pour prévisualiser cette branche.
