// Données détaillées des indicateurs pour la page de référence
// Structure enrichie avec description, justification, bornage, sources

import { indicatorsByNeed, Indicator } from "./indicatorsData";

export interface IndicatorDetailed extends Indicator {
  objectiveType: "Subsistance" | "Gestion de crise" | "Soutenabilité";
  indicatorType: "Action" | "État";
  sourceType: "Donnée publique" | "Enquête territoire" | "Calcul dérivé";
  description?: string;
  justification?: string;
  bornage?: string;
  accessUrl?: string;
  sources?: string[];
}

// Mapping des besoins vers leurs labels lisibles
export const needLabels: Record<string, string> = {
  score_water: "Avoir accès à l'eau douce",
  score_food: "Se nourrir",
  score_housing: "Se loger",
  score_healthcare: "Se soigner",
  score_security: "Être en sécurité",
  score_education: "S'informer et s'instruire",
  score_social_cohesion: "Vivre ensemble et faire société",
  score_nature: "Être en lien avec la nature",
  score_local_economy: "Produire et s'approvisionner localement",
  score_energy: "Avoir accès à l'énergie",
  score_mobility: "Se déplacer",
};

// Enrichissement des indicateurs avec les métadonnées
// Note: Les descriptions, justifications et sources sont partiellement renseignées
// Les données manquantes seront complétées ultérieurement

const enrichIndicator = (
  indicator: Indicator,
  overrides: Partial<IndicatorDetailed> = {}
): IndicatorDetailed => {
  // Attribution automatique du type d'objectif basé sur la catégorie
  const objectiveTypeMap: Record<string, "Subsistance" | "Gestion de crise" | "Soutenabilité"> = {
    Vitaux: "Subsistance",
    Essentiels: "Gestion de crise",
    Induits: "Soutenabilité",
  };

  // Attribution du type d'indicateur (Action vs État) basé sur des mots-clés
  // Action : indicateurs mesurant une action, un plan, un schéma, une mise en œuvre
  // État : indicateurs mesurant un état, une mesure, un taux, une conformité
  const isAction = 
    indicator.label.includes("Existence") ||
    indicator.label.includes("Identification") ||
    indicator.label.includes("Mise en œuvre") ||
    indicator.label.includes("Reconnaissance") ||
    indicator.label.includes("Plan") ||
    indicator.label.includes("Schéma") ||
    indicator.label.includes("Projet") ||
    indicator.label.includes("Stratégie") ||
    indicator.label.includes("Programme");

  // Attribution du type de source basé sur des mots-clés
  const getSourceType = (): "Donnée publique" | "Enquête territoire" | "Calcul dérivé" => {
    if (isAction) return "Enquête territoire";
    if (indicator.label.includes("ratio") || indicator.label.includes("indice")) return "Calcul dérivé";
    return "Donnée publique";
  };

  return {
    ...indicator,
    objectiveType: objectiveTypeMap[indicator.category] || "Soutenabilité",
    indicatorType: isAction ? "Action" : "État",
    sourceType: getSourceType(),
    ...overrides,
  };
};

// Indicateurs enrichis avec métadonnées détaillées
export const indicatorsDetailed: IndicatorDetailed[] = [
  // Eau
  enrichIndicator(indicatorsByNeed.score_water[0], {
    description: "Cet indicateur mesure si le territoire est couvert par un outil de planification de la ressource en eau : SAGE (Schéma d'Aménagement et de Gestion des Eaux), PGRE (Plan de Gestion de la Ressource en Eau), PTGE (Projet de Territoire pour la Gestion de l'Eau) ou contrat de milieu.",
    justification: "La planification de la gestion de l'eau est essentielle pour anticiper les tensions sur la ressource et organiser les usages de manière concertée.",
    bornage: "0 = Aucun outil de planification ; 100 = Couverture complète par au moins un outil à jour",
    sources: ["Agences de l'eau", "DREAL", "EPTB"],
    sourceType: "Enquête territoire",
  }),
  enrichIndicator(indicatorsByNeed.score_water[1], {
    description: "Vérifie l'existence d'un schéma directeur de l'eau potable actualisé (moins de 10 ans) sur le territoire de l'EPCI.",
    justification: "Un schéma directeur à jour permet d'avoir une vision prospective des besoins en eau potable et des investissements nécessaires.",
    bornage: "0 = Pas de schéma ou schéma de plus de 10 ans ; 100 = Schéma à jour et mis en œuvre",
    sources: ["Service eau potable de l'EPCI", "Syndicats des eaux"],
    sourceType: "Enquête territoire",
  }),
  enrichIndicator(indicatorsByNeed.score_water[2], {
    description: "Présence d'un agent technique ou administratif identifié comme référent sur les questions relatives à l'eau au sein de la collectivité.",
    justification: "L'identification d'un référent permet une meilleure coordination des actions et une expertise dédiée sur les enjeux de l'eau.",
    bornage: "0 = Aucun référent identifié ; 100 = Référent clairement identifié avec fiche de poste",
    sources: ["Organigramme de l'EPCI"],
    sourceType: "Enquête territoire",
  }),
  enrichIndicator(indicatorsByNeed.score_water[4], {
    description: "Pourcentage des analyses de l'eau distribuée conformes aux normes physicochimiques (nitrates, pesticides, métaux lourds, etc.).",
    justification: "La conformité physicochimique garantit une eau potable sans polluants chimiques dangereux pour la santé.",
    bornage: "Score linéaire de 0 à 100 selon le taux de conformité",
    accessUrl: "https://orobnat.sante.gouv.fr/orobnat/afficherPage.do?methode=menu&usd=AEP&idRegion=",
    sources: ["ARS - SISE-Eaux", "Base OROBNAT"],
    sourceType: "Donnée publique",
  }),
  enrichIndicator(indicatorsByNeed.score_water[5], {
    description: "Pourcentage des analyses de l'eau distribuée conformes aux normes microbiologiques (bactéries, virus, parasites).",
    justification: "La conformité microbiologique est essentielle pour prévenir les maladies hydriques.",
    bornage: "Score linéaire de 0 à 100 selon le taux de conformité",
    accessUrl: "https://orobnat.sante.gouv.fr/orobnat/afficherPage.do?methode=menu&usd=AEP&idRegion=",
    sources: ["ARS - SISE-Eaux", "Base OROBNAT"],
    sourceType: "Donnée publique",
  }),
  enrichIndicator(indicatorsByNeed.score_water[14], {
    description: "L'ILVNC mesure les pertes d'eau dans le réseau de distribution par kilomètre de canalisation et par jour.",
    justification: "Un réseau performant minimise les pertes et préserve la ressource en eau.",
    bornage: "0 = ILVNC > 15 m³/km/j ; 100 = ILVNC < 1.5 m³/km/j",
    accessUrl: "https://www.services.eaufrance.fr/",
    sources: ["SISPEA", "Rapports RPQS"],
    sourceType: "Donnée publique",
  }),
  enrichIndicator(indicatorsByNeed.score_water[16], {
    description: "Volume d'eau prélevé pour l'alimentation en eau potable rapporté à la population du territoire.",
    justification: "Indicateur de la pression sur la ressource liée aux usages domestiques.",
    bornage: "Score inversé : plus la consommation est faible, meilleur est le score",
    sources: ["Agences de l'eau", "BNPE"],
    sourceType: "Donnée publique",
  }),

  // Alimentation
  ...indicatorsByNeed.score_food.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("SAU") 
        ? "Mesure la part de la surface agricole utile par rapport à la superficie totale du territoire."
        : undefined,
      sources: ind.label.includes("agricole") ? ["Agreste", "RGA"] : undefined,
    })
  ),

  // Logement
  ...indicatorsByNeed.score_housing.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("PLH")
        ? "Le Plan Local de l'Habitat définit la politique locale de l'habitat et les objectifs de production de logements."
        : ind.label.includes("précarité énergétique")
        ? "Mesure la part des ménages consacrant plus de 8% de leur revenu aux dépenses énergétiques du logement."
        : undefined,
      sources: ind.label.includes("logement") ? ["INSEE", "RPLS", "Filocom"] : undefined,
    })
  ),

  // Santé
  ...indicatorsByNeed.score_healthcare.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("APL")
        ? "L'Accessibilité Potentielle Localisée mesure l'adéquation entre l'offre et la demande de soins à l'échelle fine."
        : undefined,
      accessUrl: ind.label.includes("APL") ? "https://drees.shinyapps.io/apl/" : undefined,
      sources: ind.label.includes("APL") ? ["DREES", "CNAM"] : undefined,
    })
  ),

  // Sécurité
  ...indicatorsByNeed.score_security.map((ind) => enrichIndicator(ind)),

  // Éducation
  ...indicatorsByNeed.score_education.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("PAT")
        ? "Le Projet Alimentaire Territorial fédère les acteurs locaux autour d'une stratégie alimentaire durable."
        : undefined,
    })
  ),

  // Cohésion sociale
  ...indicatorsByNeed.score_social_cohesion.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("interdécile")
        ? "Le rapport interdécile mesure les inégalités de revenus entre les 10% les plus riches et les 10% les plus pauvres."
        : undefined,
      sources: ind.label.includes("interdécile") ? ["INSEE", "Filosofi"] : undefined,
    })
  ),

  // Nature
  ...indicatorsByNeed.score_nature.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("ABC")
        ? "L'Atlas de la Biodiversité Communale est un inventaire des espèces et habitats présents sur le territoire."
        : undefined,
      sources: ind.label.includes("surface") ? ["Cerema", "OCS GE"] : undefined,
    })
  ),

  // Économie locale
  ...indicatorsByNeed.score_local_economy.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("tarification incitative")
        ? "La tarification incitative fait varier le coût du service déchets selon la quantité produite par le ménage."
        : undefined,
      sources: ind.label.includes("déchets") ? ["ADEME", "SINOE"] : undefined,
    })
  ),

  // Énergie
  ...indicatorsByNeed.score_energy.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("PCAET")
        ? "Le Plan Climat Air Énergie Territorial définit les objectifs et actions de la collectivité en matière de transition énergétique."
        : undefined,
      sources: ind.label.includes("GES") ? ["ADEME", "ORCAE"] : undefined,
    })
  ),

  // Mobilité
  ...indicatorsByNeed.score_mobility.map((ind) =>
    enrichIndicator(ind, {
      description: ind.label.includes("domicile-travail")
        ? "Part modale de la voiture dans les déplacements pendulaires des actifs du territoire."
        : undefined,
      sources: ind.label.includes("déplacements") ? ["INSEE", "Enquêtes mobilité"] : undefined,
    })
  ),
];

// Dédupliquer les indicateurs (certains peuvent apparaître dans plusieurs besoins)
const uniqueIds = new Set<string>();
export const allIndicators: IndicatorDetailed[] = indicatorsDetailed.filter((ind) => {
  if (uniqueIds.has(ind.id)) return false;
  uniqueIds.add(ind.id);
  return true;
});

// Fonctions de filtrage
export const getIndicatorsByNeed = (needKey: string): IndicatorDetailed[] =>
  allIndicators.filter(
    (ind) => ind.primaryNeed === needKey || ind.secondaryNeeds?.includes(needKey)
  );

export const getIndicatorsByObjectiveType = (
  type: "Subsistance" | "Gestion de crise" | "Soutenabilité"
): IndicatorDetailed[] => allIndicators.filter((ind) => ind.objectiveType === type);

export const getIndicatorsByIndicatorType = (
  type: "Action" | "État"
): IndicatorDetailed[] => allIndicators.filter((ind) => ind.indicatorType === type);

export const getIndicatorsBySourceType = (
  type: "Donnée publique" | "Enquête territoire" | "Calcul dérivé"
): IndicatorDetailed[] => allIndicators.filter((ind) => ind.sourceType === type);

export const getIndicatorById = (id: string): IndicatorDetailed | undefined =>
  allIndicators.find((ind) => ind.id === id);
