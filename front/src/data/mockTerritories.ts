export interface TerritoryData {
  id: string;
  code: string; // EPCI SIREN code
  name: string;
  siren: string;
  population: number;
  score: number;
  type: string; // Type of EPCI (Métropole, CA, CC, CU)
  functions: {
    name: string;
    score: number;
    fullMark: number;
  }[];
}

export const RESILIENCE_FUNCTIONS = [
  "S'informer et s'instruire",
  "Être en capacité de se soigner",
  "Se sentir en sécurité",
  "Se nourrir",
  "Avoir un toit",
  "Avoir accès à l'eau potable",
  "Être en capacité de se déplacer",
  "Produire et s'approvisionner localement",
  "Avoir accès à l'énergie",
  "Être en lien avec la nature",
  "Vivre ensemble et faire société",
];

// Generate consistent scores based on SIREN code
const generateFunctions = (siren: string) => {
  const seed = parseInt(siren.slice(-4)) || 1000;
  return RESILIENCE_FUNCTIONS.map((name, index) => ({
    name,
    score: Math.round((40 + ((seed * (index + 1) * 7) % 50)) * 10) / 10,
    fullMark: 100,
  }));
};

const calculateOverallScore = (functions: { score: number }[]) => {
  const avg = functions.reduce((acc, f) => acc + f.score, 0) / functions.length;
  return Math.round(avg * 10) / 10;
};

// Cache for territories loaded from GeoJSON
const territoriesCache = new Map<string, TerritoryData>();

export const createTerritoryFromGeoProperties = (properties: any): TerritoryData => {
  const siren = properties.epci_code || properties.code_siren || properties.siren || "";
  const name = properties.epci_name || properties.nom || properties.libepci || "Inconnu";
  const type = properties.epci_type || properties.nature_epci || "EPCI";
  
  // Check cache first
  if (territoriesCache.has(siren)) {
    return territoriesCache.get(siren)!;
  }
  
  const functions = generateFunctions(siren);
  const territory: TerritoryData = {
    id: siren,
    code: siren,
    name,
    siren,
    population: properties.population || 0,
    type,
    functions,
    score: calculateOverallScore(functions),
  };
  
  territoriesCache.set(siren, territory);
  return territory;
};

export const getTerritoryBySiren = (siren: string): TerritoryData | undefined => {
  if (territoriesCache.has(siren)) {
    return territoriesCache.get(siren);
  }
  // Generate a placeholder if not found
  const functions = generateFunctions(siren);
  return {
    id: siren,
    code: siren,
    name: `EPCI ${siren}`,
    siren,
    population: 0,
    type: "EPCI",
    functions,
    score: calculateOverallScore(functions),
  };
};

export const getTerritoryByCode = (code: string): TerritoryData | undefined => {
  return getTerritoryBySiren(code);
};

export const getAllCachedTerritories = (): TerritoryData[] => {
  return Array.from(territoriesCache.values());
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return "hsl(142, 76%, 36%)";
  if (score >= 70) return "hsl(152, 55%, 45%)";
  if (score >= 60) return "hsl(84, 60%, 50%)";
  if (score >= 50) return "hsl(45, 93%, 58%)";
  if (score >= 40) return "hsl(25, 95%, 53%)";
  return "hsl(0, 72%, 51%)";
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Bon";
  if (score >= 60) return "Modéré";
  if (score >= 50) return "À améliorer";
  if (score >= 40) return "Insuffisant";
  return "Critique";
};

// Sample EPCI for search autocomplete (populated from GeoJSON)
export let sampleEPCIs: { code: string; name: string }[] = [];

export const setSampleEPCIs = (epcis: { code: string; name: string }[]) => {
  sampleEPCIs = epcis;
};
