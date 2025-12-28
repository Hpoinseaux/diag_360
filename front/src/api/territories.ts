import { apiFetch, buildQuery } from "./client";
import { TerritoryApiResponse, TerritoryListResponse } from "./types";

export interface TerritoryListParams {
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: "name" | "score" | "code";
}

export async function listTerritories(params: TerritoryListParams = {}): Promise<TerritoryListResponse> {
  const query = buildQuery({
    search: params.search,
    limit: params.limit,
    offset: params.offset,
    order_by: params.order_by,
  });
  const suffix = query ? `?${query}` : "";
  return apiFetch<TerritoryListResponse>(`/territories${suffix}`);
}

export async function getTerritoryByCode(codeSiren: string): Promise<TerritoryApiResponse> {
  return apiFetch<TerritoryApiResponse>(`/territories/${codeSiren}`);
}

export async function searchTerritories(term: string, limit = 8): Promise<TerritoryApiResponse[]> {
  const query = buildQuery({ term, limit });
  return apiFetch<TerritoryApiResponse[]>(`/territories/search?${query}`);
}
