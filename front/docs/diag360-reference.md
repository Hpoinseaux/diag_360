# Référentiel Diag360

## Présentation

Le **Diagnostic 360°** est un outil de diagnostic de la résilience territoriale basé sur la **Théorie du Donut** de Kate Raworth. Il permet aux collectivités territoriales d'évaluer leur capacité à répondre aux besoins essentiels de leurs habitants tout en respectant les limites planétaires.

## Les 11 Besoins (Fonctions-clés)

Le Diag360 évalue la capacité d'un territoire à répondre à **11 besoins fondamentaux** :

### Besoins Vitaux (BV)

| Code | Intitulé exact | Clé technique |
|------|----------------|---------------|
| BV1 | Avoir accès à l'eau douce | `score_water` |
| BV2 | Se nourrir | `score_food` |
| BV3 | Se loger | `score_housing` |
| BV4 | Se soigner | `score_healthcare` |
| BV5 | Être en sécurité | `score_security` |

### Besoins Essentiels (BE)

| Code | Intitulé exact | Clé technique |
|------|----------------|---------------|
| BE1 | S'informer et s'instruire | `score_education` |
| BE2 | Vivre ensemble et faire société | `score_social_cohesion` |
| BE3 | Être en lien avec la nature | `score_nature` |

### Besoins Induits (BI)

| Code | Intitulé exact | Clé technique |
|------|----------------|---------------|
| BI1 | Produire et s'approvisionner localement | `score_local_economy` |
| BI2 | Avoir accès à l'énergie | `score_energy` |
| BI3 | Se déplacer | `score_mobility` |

## Les 3 Types d'Objectifs

Chaque besoin est évalué selon 3 types d'objectifs :

1. **Subsistance** : Capacité actuelle à répondre au besoin
2. **Gestion de crise** : Capacité à maintenir le service en situation dégradée
3. **Soutenabilité** : Capacité à assurer le besoin de manière durable

## Échelle de notation

Les scores sont exprimés sur une échelle de **0 à 100** :

| Plage | Niveau | Description |
|-------|--------|-------------|
| 80-100 | Excellent | Très bonne résilience |
| 60-79 | Bon | Bonne capacité de réponse |
| 40-59 | Moyen | Des améliorations sont nécessaires |
| 20-39 | Faible | Vulnérabilités significatives |
| 0-19 | Critique | Actions urgentes requises |

## Sources de données

Les indicateurs du Diag360 proviennent de sources officielles :

- **Observatoire des Territoires** (observatoire-des-territoires.gouv.fr)
- **INSEE Local** (statistiques-locales.insee.fr)
- **Territoires au Futur** (territoiresaufutur.fr)
- **Eau France** (eaufrance.fr)
- **ODDetT** - Objectifs de Développement Durable et Territoires
- **Cartosanté** (cartosante.atlasante.fr)
- **Mon Diagnostic Artificialisation**
- **Data.caf** (data.caf.fr)

## Références

- Site officiel : [diag360.org](https://diag360.org)
- Théorie du Donut : Kate Raworth, *Doughnut Economics* (2017)
