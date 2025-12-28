export interface TerritoryData {
  id: string;
  code_siren: string;
  name: string;
  type: string | null;
  population: number | null;
  department: string | null;
  region: string | null;
  score: number;
  // Besoins Vitaux
  score_water: number | null;        // BV1 - Avoir accès à l'eau potable
  score_food: number | null;         // BV2 - Se nourrir
  score_housing: number | null;      // BV3 - Avoir un toit
  score_healthcare: number | null;   // BV4 - Se soigner
  score_security: number | null;     // BV5 - Se sentir en sécurité
  // Besoins Essentiels
  score_education: number | null;    // BE1 - S'informer et s'instruire
  score_social_cohesion: number | null; // BE2 - Vivre ensemble et faire société
  score_nature: number | null;       // BE3 - Être en lien avec la nature
  // Besoins Induits
  score_local_economy: number | null; // BI1 - Produire et s'approvisionner localement
  score_energy: number | null;       // BI2 - Avoir accès à l'énergie
  score_mobility: number | null;     // BI3 - Se déplacer
  data_year: number | null;
}

export interface FunctionScore {
  name: string;
  score: number;
  key: string;
  code: string;
}

export const RESILIENCE_FUNCTIONS: { name: string; key: keyof TerritoryData; code: string }[] = [
  // Besoins Vitaux
  { code: "BV1", name: "Avoir accès à l'eau douce", key: "score_water" },
  { code: "BV2", name: "Se nourrir", key: "score_food" },
  { code: "BV3", name: "Se loger", key: "score_housing" },
  { code: "BV4", name: "Se soigner", key: "score_healthcare" },
  { code: "BV5", name: "Être en sécurité", key: "score_security" },
  // Besoins Essentiels
  { code: "BE1", name: "S'informer et s'instruire", key: "score_education" },
  { code: "BE2", name: "Vivre ensemble et faire société", key: "score_social_cohesion" },
  { code: "BE3", name: "Être en lien avec la nature", key: "score_nature" },
  // Besoins Induits
  { code: "BI1", name: "Produire et s'approvisionner localement", key: "score_local_economy" },
  { code: "BI2", name: "Avoir accès à l'énergie", key: "score_energy" },
  { code: "BI3", name: "Se déplacer", key: "score_mobility" },
];

export const getFunctionsFromTerritory = (territory: TerritoryData): FunctionScore[] => {
  return RESILIENCE_FUNCTIONS.map((func) => ({
    name: func.name,
    key: func.key,
    code: func.code,
    score: (territory[func.key] as number | null) ?? 0,
  }));
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return "hsl(152, 55%, 33%)"; // Dark green
  if (score >= 60) return "hsl(142, 76%, 36%)"; // Green
  if (score >= 40) return "hsl(84, 60%, 50%)"; // Yellow-green
  if (score >= 20) return "hsl(45, 93%, 58%)"; // Yellow-orange
  return "hsl(25, 95%, 53%)"; // Orange
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bon";
  if (score >= 40) return "Moyen";
  if (score >= 20) return "Faible";
  return "Critique";
};
