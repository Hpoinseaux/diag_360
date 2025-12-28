export interface TerritoryApiResponse {
  id: string;
  code_siren: string;
  name: string;
  type: string | null;
  population: number | null;
  department: string | null;
  region: string | null;
  score: number;
  score_water: number | null;
  score_food: number | null;
  score_housing: number | null;
  score_healthcare: number | null;
  score_security: number | null;
  score_education: number | null;
  score_social_cohesion: number | null;
  score_nature: number | null;
  score_local_economy: number | null;
  score_energy: number | null;
  score_mobility: number | null;
  data_year: number | null;
}

export interface TerritoryListResponse {
  items: TerritoryApiResponse[];
  total: number;
}

export interface FlashReportMetric {
  code: string;
  name: string;
  value: number;
  interpretation: string;
}

export interface FlashReportResponse {
  territory_name: string;
  code_siren: string;
  baseline_score: number;
  adjusted_score: number;
  metrics: FlashReportMetric[];
  summary: string;
}

export interface FlashReportRequest {
  code_siren: string;
  scores: Record<string, number>;
  comments?: string;
}
