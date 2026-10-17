# NeuroScope : audit scientifique et provenance

État de la synthèse : 17 octobre 2026. Document de traçabilité, sans validation par l’enseignant. Le module représente une anatomie et une histologie **schématiques**, pas une segmentation anatomique de référence.

## Source principale effectivement lue

- Fichier fourni par l’utilisateur : `TN1___Ron_o_2026.pdf`.
- Titre : *Histologie : Tissu nerveux 1*, « À partir du cours du Pr Desestret », Lyon Sud 2026.
- Signature figurant sur le document : L. Bastin-Heline-ESA-UE5 Histologie.
- Taille : **4 657 412 octets** ; 14 pages.
- SHA-256 : `53f8056101374aaebbf279d1e73e494e78cfbe2093071f725868ae145bce2283`.
- Lecture du texte des **14 pages**, y compris les corrections et discordances de la dernière page. L’extraction reste dans l’espace de travail temporaire, hors dépôt.

La première page ne porte pas de numéro imprimé ; le sommaire situe l’introduction à la page 0. Les pages suivantes portent les numéros 1 à 13. Toutes les valeurs `pages` du code sont des **pages du fichier PDF, de 1 à 14** : `PDF p. n = ronéo p. n − 1`, avec 0 déduit pour la première page. Ainsi les annales sont **PDF p. 14 / ronéo p. 13**, et non PDF p. 13.

Le fichier, ses illustrations et ses extraits d’annales ne sont pas inclus dans le dépôt. Le document peut être associé localement par l’étudiant après contrôle de son empreinte ; cela n’établit aucun droit de redistribution.

## Correspondance des notions

| Pages PDF | Pages imprimées | Notions effectivement présentes |
| --- | --- | --- |
| 1–2 | 0–1 | Rôles du système nerveux ; neurones, glie, vaisseaux ; excitabilité, conductibilité et communicabilité. |
| 2–3 | 1–2 | Organisation anatomique SNC/SNP et fonctionnelle somatique/autonome ; divisions sympathique, parasympathique et entérique ; listes des glies centrales et périphériques. |
| 4 | 3 | Origines générales ; LCS, plexus choroïdes, ventricules et espaces autour du névraxe ; introduction des interfaces. |
| 5 | 4 | Épendyme ; interface piogliale ; BHE ; dure-mère, arachnoïde et pie-mère. |
| 6 | 5 | Méninges en histologie ; séparation sous-durale artéfactuelle ; contexte méningite/hémorragie. |
| 7–8 | 6–7 | Substance grise, neuropile, synapses, glies ; présence de myéline en substance grise ; début de la substance blanche et halos de dissolution lipidique. |
| 9–10 | 8–9 | Corps calleux, coupe de moelle, disposition SG/SB dans l’encéphale et la moelle. |
| 11 | 10 | Nerf et fascicules ; endonèvre, périnèvre cellulaire spécialisé, épinèvre, paranèvre ; cellules et vaisseaux associés ; trichrome de Masson. |
| 12 | 11 | Ganglions sensitifs et autonomes, cellules satellites, capsule/stroma ; contraste des synapses ganglionnaires. |
| 13 | 12 | Réseaux entériques, neurones/glies, Meissner sous-muqueux et Auerbach dans la musculeuse. |
| 14 | 13 | Extraits QRM 30–32, annales 2020, et correction rapide ; non recopiés. |

Dans `anatomy-data.js`, une fiche peut citer les pages où sa **notion générale** est enseignée et signaler les détails ajoutés dans `supplement`. Une fiche entièrement complémentaire a `pages: []` ; cela évite de lui attribuer une page fictive de TN1. La liste de références distingue `tn1` des compléments externes.

Le fichier comporte 72 fiches, avec hiérarchie, localisation, composition, cellules, fonctions, rapports, origine, piège, références et échelle. Les identifiants incluent le comparateur demandé `spinal-meninges`. Les contrôles de données ont vérifié champs renseignés, références résolues, pages dans 1–14, absence de cycles et correspondance des structures des 60 propositions.

## Discordances et simplifications traitées explicitement

1. **Interface piogliale et correction du QRM 32C.** Le texte PDF p. 5 définit l’interface par la pie-mère et la glie limitante. La proposition C de l’extrait PDF p. 14 y ajoute l’arachnoïde, alors que la correction rapide la donne vraie. Le module conserve la définition du texte, signale la discordance et n’attribue pas une correction supposée au professeur. Le QRM original sur l’interface porte explicitement sur cette définition ; ce n’est pas une reproduction de l’annale.
2. **« Noyaux gris centraux du tronc cérébral »**, PDF p. 7. La présence de noyaux de substance grise dans le tronc est correcte ; leur assimilation aux noyaux gris centraux télencéphaliques ne l’est pas. Fiches et modèles distinguent noyaux de la base et noyaux du tronc ; complément OpenStax 13.2.
3. **Ganglions sensitifs crâniens**, PDF p. 12. La liste comprenant XI et excluant tous les autres nerfs comporte une discordance : XI est moteur ; VIII possède les ganglions vestibulaire et cochléaire. Les ganglions sensitifs de V, VII, IX et X ne forment donc pas seuls une liste exhaustive. Cette liste n’est pas utilisée pour une question d’entraînement ; complément OpenStax 13.4.
4. **Origine méningée**, PDF p. 4. « Origine mésenchymateuse » est conservé sans devenir « origine exclusivement mésodermique ». Le mésenchyme crânien comporte des contributions des crêtes neurales et du mésoderme selon les régions ; revue Dasgupta/Jeong.
5. **Microglie.** L’origine distincte des macroglies donnée PDF p. 4 est précisée en complément : lignée macrophagique embryonnaire du sac vitellin ; revue Ginhoux et al. Les silhouettes ramifiée/rétractée ne sont pas présentées comme une classification binaire universelle de ses états fonctionnels.
6. **Épendyme et épithélium choroïdien**, PDF p. 4–5. La formule générale de TN1 sur les épendymocytes est précisée : l’interface épendymaire ordinaire n’est pas assimilée à la barrière sang-LCS des plexus. Les jonctions serrées de cette dernière sont **épithéliales choroïdiennes**, en aval d’un stroma à capillaires fenêtrés. Les propriétés de l’épendyme varient selon territoire, développement et pathologie ; le module n’affirme pas une perméabilité uniforme absolue.
7. **BHE**, PDF p. 5. Le cours mentionne capillaires et astrocytes. Le complément distingue endothélium, jonctions serrées **endothéliales**, péricytes, membranes basales et pieds astrocytaires. Les astrocytes ne deviennent pas des cellules endothéliales et ne portent pas les jonctions endothéliales.
8. **Canal central et LCS périmédullaire**, PDF p. 4. La continuité embryologique et la présence du canal sont distinguées du trajet adulte dominant. Le LCS périmédullaire se trouve autour de la moelle dans l’espace sous-arachnoïdien ; la branche centrale n’est pas la voie principale de circulation adulte. Le trajet principal illustré sort du quatrième ventricule vers les espaces sous-arachnoïdiens.
9. **Sous-dural**, PDF p. 6. La séparation de la préparation est artéfactuelle. Le schéma éclaté matérialise un écart de démonstration et non une cavité libre physiologique de LCS. L’espace sous-arachnoïdien, lui, est réel. La comparaison épidurale crânienne/spinale est un complément : potentiel au crâne, réel dans le rachis.
10. **Substance blanche**, PDF p. 8. Le contraste PASS « pas de corps neuronaux, pas de neuropile, aucune synapse » est présenté comme un schéma architectural général. Il ne sert pas à nier toute exception anatomique : des neurones interstitiels sont décrits dans la substance blanche. Les QRM évitent les absolus contestables et distinguent corps neuronal et axone, partie du neurone ; revue Fischer/Kukley.
11. **Substance grise**, PDF p. 7–8. Elle contient aussi axones, myéline et oligodendrocytes. Les cellules satellites et Schwann ne sont pas enseignées comme glies normales du parenchyme central. La présence schématique de synapses agrandies n’est pas présentée comme une résolution de microscopie optique standard.
12. **Périnèvre**, PDF p. 11. Priorité au détail histologique de TN1 : couches de cellules périneurales spécialisées, avec lames basales et quelques fibres, pas un simple TC dense. Le raccourci de certains ouvrages d’anatomie générale ne remplace pas cette description. Le nombre « environ une dizaine » est descriptif, pas une constante imposée au modèle.
13. **Paranèvre**, PDF p. 11. Terme conservé dans le sens précis de la ronéo (enveloppe/interface externe). Sa terminologie varie suivant les ouvrages ; pas de prétention à une définition universelle.
14. **Ganglions**, PDF p. 12. Absence habituelle de relais synaptique dans le ganglion sensitif spinal classique, synapses dans le ganglion autonome. Le complément morphologique utilise « pseudounipolaire » pour les neurones spinaux et ne confond pas cellules satellites et capsule conjonctive.
15. **Somatique/autonome.** TN1 emploie l’aide-mémoire volontaire/automatique. Le module conserve les fonctions somatiques sensitives et motrices et ne laisse pas entendre que tous les circuits somatiques exigent une décision consciente : les réflexes existent. Les axes fonctionnel et anatomique restent séparés.

## Compléments vérifiés sur internet

Pages consultées le 17 octobre 2026 ; les liens suivants ont effectivement fourni leur texte (HTTP 200). La réponse anti-robot de `NCBI Bookshelf NBK519007` n’a pas été retenue comme lecture vérifiée ni comme référence du module.

| Référence | Utilisation dans le module |
| --- | --- |
| [OpenStax 12.2 — Nervous Tissue](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue) | Morphologie neurone/glies, oligodendrocyte/Schwann, internœuds, nœuds et conduction. |
| [OpenStax 13.1 — The Embryologic Perspective](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-1-the-embryologic-perspective) | Tube neural, crêtes neurales et origine du tissu nerveux entérique. |
| [OpenStax 13.2 — The Central Nervous System](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system) | Régions de l’encéphale, noyaux, corps calleux, racines et moelle. |
| [OpenStax 13.3 — Circulation and the Central Nervous System](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-3-circulation-and-the-central-nervous-system) | Méninges, replis, sinus, ventricules et voie classique de circulation/résorption du LCS. |
| [OpenStax 13.4 — The Peripheral Nervous System](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-4-the-peripheral-nervous-system) | Nerfs, ganglions, racines, plexus, distinction des nerfs crâniens moteurs/sensitifs. |
| [OpenStax 23.1 — Overview of the Digestive System](https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system) | Couches digestives et rôles/topographie des plexus. |
| [Daneman et Prat, 2015 — The Blood–Brain Barrier](https://pmc.ncbi.nlm.nih.gov/articles/PMC4292164/) | Endothélium barrière, péricytes et pieds astrocytaires. |
| [Solár et al., 2020 — Choroid plexus and the blood-cerebrospinal fluid barrier in disease](https://pmc.ncbi.nlm.nih.gov/articles/PMC7201396/) | Capillaires fenêtrés et épithélium choroïdien à jonctions serrées. |
| [Serra et Simard, 2023 — Adherens, tight, and gap junctions in ependymal cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC10079940/) | Nuance des propriétés de l’interface épendymaire, sans assimilation à la barrière choroïdienne. |
| [Dasgupta et Jeong, 2019 — Developmental biology of the meninges](https://pmc.ncbi.nlm.nih.gov/articles/PMC6520190/) | Origines régionales mixtes des méninges. |
| [Ginhoux et al., 2013 — Origin and differentiation of microglia](https://pmc.ncbi.nlm.nih.gov/articles/PMC3627983/) | Origine embryonnaire du sac vitellin et rôle macrophagique de la microglie. |
| [Louveau et al., 2015 — Structural and functional features of central nervous system lymphatics](https://pmc.ncbi.nlm.nih.gov/articles/PMC4506234/) | Lymphatiques duraux et connexion aux ganglions cervicaux ; étude principalement murine, sans chiffre transposé à l’humain. |
| [Fischer et Kukley, 2025 — Hidden in the white matter](https://pmc.ncbi.nlm.nih.gov/articles/PMC12255840/) | Neurones interstitiels et limite de la simplification architecturale SB/SG. |

Les sources sont utilisées pour des synthèses originales brèves. Les images, figures et modèles de ces ressources ne sont pas incorporés au module. L’accessibilité en ligne ne vaut pas permission de copier un modèle ou une lame.

## Entraînement

`content.js` contient **12 QRM originaux**, chacun avec cinq propositions A–E et une ou plusieurs réponses exactes. Chaque proposition dispose d’une correction et d’un identifiant de structure pour la visualisation. Les pages de TN1 de la question sont explicites.

| QRM original | Pages PDF | Clé de correction |
| --- | --- | --- |
| Organisation et classifications | 2–3 | ACE |
| Reconnaître la substance grise | 7–9 | ACD |
| Décomposer le neuropile | 7–8 | ACD |
| Architecture de la substance blanche | 8–10 | ACD |
| Traverser les méninges | 5–6 | ABC |
| Compartiments et interfaces | 4–5 | ABD |
| Localisation et origine des glies | 3–4, 7–8 | ACE |
| Ouvrir un nerf | 11 | ABCE |
| Comparer les gaines | 11 | ACD |
| Comparer les ganglions | 12 | ABD |
| Placer les plexus entériques | 3, 13 | ABD |
| Compartiments du LCS | 4–5 | ACD |

Aucune question n’est étiquetée annale authentique. Les extraits QRM 30–32 de la ronéo n’ont pas été recopiés : aucun droit de redistribution n’a été établi. Les questions originales évitent les erreurs documentaires identifiées et les exceptions non pertinentes au niveau PASS.

Huit tableaux de comparaison sont fournis : substance grise/blanche, oligodendrocyte/Schwann, ganglion sensitif/autonome, BHE/barrière sang-LCS, organisation cérébrale/médullaire, enveloppes crâniennes/spinales, trois méninges et deux plexus entériques. Les compléments y sont annoncés dans la note.

## Limites de représentation à conserver dans l’interface

- Morphologies, trajets et proportions non métriques ; aucun inventaire de tous les nerfs ou noyaux.
- Changement de géométrie annoncé lors du passage d’une région à un tissu, une cellule ou une microstructure.
- Coupes géométriques de modèles schématiques, pas des coupes d’imagerie médicale validées.
- Colorations simulées, pas de photographies histologiques ; pas d’usage diagnostique.
- Circulation du LCS schématique, sans débit, pulsation ni quantification des voies de drainage ; le canal central reste secondaire.
- Détails neuronaux et gliaux enrichis par des compléments clairement référencés, sans prétendre que TN1 contient le cours cellulaire complet.
- Pas de validation par un enseignant ni de garantie d’exhaustivité anatomique ; les formulations discordantes de la ronéo sont visibles comme telles.
