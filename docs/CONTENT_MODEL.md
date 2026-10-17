# Préparer les contenus suivants

Cette première livraison ne contient aucun nouveau modèle scientifique, aucune question et aucun moteur d’entraînement. Les fonctionnalités décrites ci-dessous sont une spécification d’extension, pas des fonctions déjà disponibles.

## Références et validation scientifique

Chaque futur module doit associer un titre, une matière/UE, des objectifs, les sources consultées, leur édition, la date de consultation et un état de relecture. Préférer les cours de Lyon Sud disponibles et autorisés. Distinguer les faits établis, les simplifications de représentation et les points incertains ; afficher ces distinctions près du contenu concerné. Une illustration schématique ne constitue pas une mesure ni un document histologique réel.

Identifier les pièges QCM avec une justification, sans en déduire une fréquence d’examen sans données. Préciser les conventions temporelles en embryologie. Ne pas attribuer à un enseignant un propos ou une question sans document justificatif. Les QCM générés par IA doivent porter cette mention et être relus avant utilisation.

## Provenance d’une future question

Champs à conserver, même si plusieurs sont `null` lorsqu’ils sont inconnus :

| Champ | Règle |
| --- | --- |
| `id`, `revision` | Identifiant stable et version de la correction. |
| `ue`, `subject`, `topics` | UE2 ou UE5 ; matière et thèmes détaillés. |
| `kind` | `authentic_exam`, `tutorat_training` ou `original_training` ; affiché dans l’interface. |
| `generated_by_ai` | Booléen explicite ; ne transforme jamais une question originale en annale. |
| `year`, `session`, `teacher` | Vérifiés par un document pour les épreuves authentiques ; inconnus signalés, jamais inventés. |
| `source` | Titre, organisme, URL ou nom du document importé, page, numéro de question et date de consultation. |
| `evidence` | Référence vérifiable à la preuve de provenance ; obligatoire pour `authentic_exam` et `tutorat_training`. |
| `reuse` | Conditions de diffusion, accès public ou réservé, licence ou autorisation documentée. La consultation publique ne suffit pas à autoriser la redistribution. |
| `stem`, `propositions` | Énoncé ; exactement cinq propositions identifiées A, B, C, D et E. |
| `is_correct`, `explanation` | Une vérité et une explication sourcée pour chaque proposition. |
| `references`, `pitfalls` | Références scientifiques et pièges expliqués ; les erreurs non vérifiées ne deviennent pas des conseils. |
| `review` | État de relecture et date ; séparer les extractions non vérifiées du contenu utilisable en entraînement. |

Une question peut avoir une à cinq propositions justes selon le périmètre demandé. En cas de document importé divergent, garder la donnée originale et signaler le conflit avant la mise en entraînement. Une correction manquante ne doit pas être reconstruite silencieusement.

## Séances futures

- Entraînement : sélection de une à cinq réponses, validation explicite, correction détaillée A–E après validation.
- Examen : correction différée à la fin, durée et barème affichés avant le début. Ne pas présenter un barème pédagogique comme le barème officiel Lyon Sud sans source à jour.
- Historique : conserver la version des questions, les réponses, le mode, la date et la durée ; statistiques par UE, matière et piège. Préciser la portée de ces statistiques, sans percentile ni classement fictif.
- Stockage : commencer par un stockage local versionné, avec export et suppression par l’utilisateur. Préciser les limites de conservation Safari et l’absence de synchronisation tant qu’un système de compte n’existe pas.

## Import personnel futur

Prévoir un sélecteur de PDF et un formulaire de provenance, sans demander d’identifiants Moodle. Lire et stocker les fichiers sur l’appareil pour un usage personnel ; ne pas les inclure dans le dépôt, les commits, GitHub Pages ou un service externe. L’utilisateur doit pouvoir retirer ses documents. Aucun import n’est actif dans cette livraison.

Un fichier importé n’est pas automatiquement une annale authentifiée. L’extraction/OCR, l’attribution des propositions, les réponses et les références doivent être vérifiées. Conserver le lien vers la page du PDF et distinguer les corrections originales du document, les corrections proposées et les incertitudes.
