import { useState, memo, useEffect, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { TerritoryData, getScoreColor } from "@/types/territory";
import { listTerritories } from "@/api/territories";
import { mapApiToTerritoryData, createMockTerritoryData } from "@/utils/territoryMapper";
import { Loader2, AlertTriangle, RefreshCcw, Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FranceMapProps {
  onTerritoryClick: (territory: TerritoryData) => void;
}

// Primary: Departments (reliable, local file)
// TODO: Find reliable EPCI GeoJSON source - OpenDataSoft format has array properties that cause issues
const EPCI_GEO_URL = "/data/departements.geojson";

// Fallback: Departments (local file for reliability)
const DEPT_GEO_URL = "/data/departements.geojson";

// Cache configuration
const CACHE_KEY_EPCI = "epci_geojson_cache";
const CACHE_KEY_TIMESTAMP = "epci_geojson_timestamp";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cache utilities
const getFromCache = (): any | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
    if (!timestamp) return null;
    
    const cacheTime = parseInt(timestamp, 10);
    if (Date.now() - cacheTime > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY_EPCI);
      localStorage.removeItem(CACHE_KEY_TIMESTAMP);
      return null;
    }
    
    const cached = localStorage.getItem(CACHE_KEY_EPCI);
    if (!cached) return null;
    
    return JSON.parse(cached);
  } catch (e) {
    console.warn("Cache read error:", e);
    return null;
  }
};

const saveToCache = (data: any): boolean => {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(CACHE_KEY_EPCI, json);
    localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
    return true;
  } catch (e) {
    console.warn("Cache write error (storage full?):", e);
    return false;
  }
};

const clearCache = () => {
  localStorage.removeItem(CACHE_KEY_EPCI);
  localStorage.removeItem(CACHE_KEY_TIMESTAMP);
  (window as any).__geoLoggedOnce = false;
  console.log("Cache cleared");
};

// Filter to keep only metropolitan France (exclude DOM-TOMs)
const filterMetropole = (geojson: any): any => {
  if (!geojson?.features) return geojson;
  
  const getFirstCoord = (coords: any): [number, number] | null => {
    if (!Array.isArray(coords)) return null;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return [coords[0], coords[1]];
    }
    return getFirstCoord(coords[0]);
  };
  
  const filtered = {
    ...geojson,
    features: geojson.features.filter((feature: any) => {
      const coords = feature.geometry?.coordinates;
      if (!coords) return false;
      
      const point = getFirstCoord(coords);
      if (!point) return false;
      
      const [lon, lat] = point;
      // Metropolitan France: lon between -6 and 10, lat between 41 and 51.5
      return lon >= -6 && lon <= 10 && lat >= 41 && lat <= 51.5;
    })
  };
  
  console.log(`Filtered: ${filtered.features.length}/${geojson.features.length} features (métropole only)`);
  return filtered;
};

// Helper to extract first value from array (OpenDataSoft format) or return value directly
const extractValue = (value: any): string => {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
};

// Generate mock score based on SIREN for visual consistency
const generateMockScore = (siren: string): number => {
  if (!siren) return 50;
  let hash = 0;
  for (let i = 0; i < siren.length; i++) {
    hash = ((hash << 5) - hash) + siren.charCodeAt(i);
    hash = hash & hash;
  }
  // Wide range: 10-90 for better color variance
  return 10 + Math.abs(hash % 80);
};

const FranceMapContent = ({ onTerritoryClick }: FranceMapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [dataSource, setDataSource] = useState<"epci" | "dept">("epci");
  const [fromCache, setFromCache] = useState(false);
  const [dbTerritories, setDbTerritories] = useState<Map<string, TerritoryData>>(new Map());
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    score: number;
    code: string;
    type: string;
  } | null>(null);

  // Load territories from API
  useEffect(() => {
    const loadDbTerritories = async () => {
      try {
        const { items } = await listTerritories({ limit: 2000, order_by: "name" });
        const map = new Map<string, TerritoryData>();
        items.forEach((territory) => {
          map.set(territory.code_siren, mapApiToTerritoryData(territory));
        });
        setDbTerritories(map);
      } catch (error) {
        console.error("Failed to load territories from API", error);
      }
    };
    loadDbTerritories();
  }, []);

  // Load GeoJSON data with caching
  const loadData = useCallback(async (source: "epci" | "dept") => {
    try {
      setIsLoading(true);
      setError(null);
      setFromCache(false);
      
      // Try cache first for EPCI
      if (source === "epci") {
        const cached = getFromCache();
        if (cached) {
          console.log("Using cached EPCI data");
          const filtered = filterMetropole(cached);
          setGeoData(filtered);
          setDataSource("epci");
          setFromCache(true);
          setIsLoading(false);
          return;
        }
      }
      
      const url = source === "epci" ? EPCI_GEO_URL : DEPT_GEO_URL;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("Erreur de chargement");
      }
      
      const data = await response.json();
      
      // Debug logging
      console.log("=== GeoJSON Debug ===");
      console.log("Total features:", data.features?.length);
      console.log("Sample feature properties (first 3):");
      data.features?.slice(0, 3).forEach((f: any, i: number) => {
        console.log(`Feature ${i}:`, f.properties);
      });
      
      // Filter for metropolitan France and set data
      const filtered = filterMetropole(data);
      setGeoData(filtered);
      setDataSource(source);
      
      // Cache the original EPCI data (not filtered, to allow re-filtering)
      if (source === "epci") {
        saveToCache(data);
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error(`Error loading ${source} data:`, err);
      
      if (source === "epci") {
        console.log("Falling back to departments...");
        loadData("dept");
      } else {
        setError("Impossible de charger les données géographiques");
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData("epci");
  }, [loadData]);

  const handleClearCache = useCallback(() => {
    clearCache();
    loadData("epci");
  }, [loadData]);

  const getTerritoryFromGeo = useCallback((props: any, geoKey?: string): TerritoryData => {
    // Debug: log ALL property keys on first call to understand structure
    if (!(window as any).__geoLoggedOnce) {
      console.log("=== ALL PROPERTY KEYS ===");
      console.log(Object.keys(props));
      console.log("=== FIRST 5 PROPERTY VALUES ===");
      Object.entries(props).slice(0, 10).forEach(([k, v]) => {
        console.log(`${k}:`, v);
      });
      (window as any).__geoLoggedOnce = true;
    }

    // Try multiple property name patterns (OpenDataSoft uses various naming conventions)
    const code = extractValue(props.epci_code) 
      || extractValue(props.epci_siren)
      || extractValue(props.siren)
      || extractValue(props.code_siren) 
      || extractValue(props.code_epci)
      || extractValue(props.code) 
      || geoKey // Use geo key as fallback for unique identification
      || "";
    
    const name = extractValue(props.epci_name) 
      || extractValue(props.nom_epci)
      || extractValue(props.nom) 
      || extractValue(props.libepci) 
      || extractValue(props.lib_epci)
      || "Inconnu";
    
    const type = extractValue(props.epci_type) 
      || extractValue(props.nature_epci)
      || extractValue(props.nature) 
      || "EPCI";

    // Check if we have this territory in the database
    const dbTerritory = dbTerritories.get(code);
    if (dbTerritory) {
      return dbTerritory;
    }

    // Return mock data for territories not in DB
    const mockScore = generateMockScore(code);
    return createMockTerritoryData(code, name, type, mockScore);
  }, [dbTerritories]);

  const handleClick = useCallback((geo: any) => {
    const territory = getTerritoryFromGeo(geo.properties, geo.rsmKey);
    onTerritoryClick(territory);
  }, [onTerritoryClick, getTerritoryFromGeo]);

  const handleMouseEnter = useCallback((geo: any) => {
    const props = geo.properties;
    const territory = getTerritoryFromGeo(props, geo.rsmKey);
    const code = territory.code_siren;
    
    setHoveredId(code);
    setTooltipContent({
      name: territory.name,
      score: territory.score,
      code: territory.code_siren,
      type: territory.type || "EPCI",
    });
  }, [getTerritoryFromGeo]);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltipContent(null);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <AlertTriangle className="w-8 h-8" />
          <span className="text-sm">{error}</span>
          <Button variant="outline" size="sm" onClick={() => loadData("dept")}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <span className="text-sm font-medium text-foreground block">
                Chargement {dataSource === "epci" ? "des EPCI" : "des départements"}...
              </span>
              <span className="text-xs text-muted-foreground">
                {dataSource === "epci" ? "~1200 intercommunalités" : "96 départements"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="aspect-[4/5] max-w-xl mx-auto">
        {geoData && (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [2.5, 46.5],
              scale: 2300,
            }}
            style={{ width: "100%", height: "100%", backgroundColor: "#f1f5f9" }}
          >
            <ZoomableGroup center={[2.5, 46.5]} zoom={1} minZoom={0.8} maxZoom={12}>
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const territory = getTerritoryFromGeo(geo.properties, geo.rsmKey);
                    const fillColor = getScoreColor(territory.score);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleClick(geo)}
                        onMouseEnter={() => handleMouseEnter(geo)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          default: {
                            fill: fillColor,
                            stroke: "#1a1a2e",
                            strokeWidth: 0.15,
                            outline: "none",
                            cursor: "pointer",
                          },
                          hover: {
                            fill: fillColor,
                            stroke: "#000000",
                            strokeWidth: 0.5,
                            outline: "none",
                            cursor: "pointer",
                            filter: "brightness(1.15) saturate(1.1)",
                          },
                          pressed: {
                            fill: fillColor,
                            stroke: "#2d6a4f",
                            strokeWidth: 0.8,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>

      {/* Tooltip overlay */}
      {tooltipContent && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg px-4 py-3 pointer-events-none animate-scale-in z-10 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {tooltipContent.type || (dataSource === "epci" ? "EPCI" : "Département")}
            </span>
          </div>
          <p className="font-semibold text-foreground text-sm leading-tight mb-1">
            {tooltipContent.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Score:</span>
            <span
              className="font-bold text-sm"
              style={{ color: getScoreColor(tooltipContent.score) }}
            >
              {tooltipContent.score.toFixed(1)}/100
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
            {dataSource === "epci" ? `SIREN: ${tooltipContent.code}` : `Code: ${tooltipContent.code}`} • Cliquez pour le diagnostic
          </p>
        </div>
      )}

      {/* Data source indicator + zoom instructions */}
      {!isLoading && !error && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-md px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">
            <span className="hidden sm:inline">Molette pour zoomer • Glisser pour déplacer</span>
            <span className="sm:hidden">Pincez pour zoomer</span>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-md px-2 py-1 text-[10px] text-primary font-medium flex items-center gap-1">
            {fromCache && <Database className="w-3 h-3" />}
            {dataSource === "epci" ? "EPCI" : "Départements"}
            {fromCache && <span className="text-primary/70">(cache)</span>}
          </div>
          {fromCache && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Vider cache
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const FranceMap = memo(FranceMapContent);
