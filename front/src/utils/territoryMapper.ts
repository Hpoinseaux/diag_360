import { TerritoryData } from "@/types/territory";

const parseNullableNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Maps API responses to the TerritoryData type.
 */
export const mapApiToTerritoryData = (record: any): TerritoryData => {
  return {
    id: record.id,
    code_siren: record.code_siren,
    name: record.name,
    type: record.type ?? null,
    population: record.population ?? null,
    department: record.department ?? null,
    region: record.region ?? null,
    score: parseNullableNumber(record.score) ?? 0,
    score_water: parseNullableNumber(record.score_water),
    score_food: parseNullableNumber(record.score_food),
    score_housing: parseNullableNumber(record.score_housing),
    score_healthcare: parseNullableNumber(record.score_healthcare),
    score_security: parseNullableNumber(record.score_security),
    score_education: parseNullableNumber(record.score_education),
    score_social_cohesion: parseNullableNumber(record.score_social_cohesion),
    score_nature: parseNullableNumber(record.score_nature),
    score_local_economy: parseNullableNumber(record.score_local_economy),
    score_energy: parseNullableNumber(record.score_energy),
    score_mobility: parseNullableNumber(record.score_mobility),
    data_year: record.data_year ?? null,
  };
};

/**
 * Creates mock TerritoryData for territories not in the database.
 */
export const createMockTerritoryData = (
  code: string,
  name: string,
  type: string,
  baseScore: number
): TerritoryData => {
  const variance = () => Math.random() * 10 - 5;
  return {
    id: code,
    code_siren: code,
    name,
    type,
    population: null,
    department: null,
    region: null,
    score: baseScore,
    score_water: baseScore + variance(),
    score_food: baseScore + variance(),
    score_housing: baseScore + variance(),
    score_healthcare: baseScore + variance(),
    score_security: baseScore + variance(),
    score_education: baseScore + variance(),
    score_social_cohesion: baseScore + variance(),
    score_nature: baseScore + variance(),
    score_local_economy: baseScore + variance(),
    score_energy: baseScore + variance(),
    score_mobility: baseScore + variance(),
    data_year: 2024,
  };
};
