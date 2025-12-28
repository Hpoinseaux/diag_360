import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  allIndicators,
  needLabels,
  IndicatorDetailed,
} from "@/data/indicatorsDetailedData";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  X,
  Home,
  Droplets,
  Utensils,
  House,
  HeartPulse,
  Shield,
  GraduationCap,
  Users,
  TreePine,
  Factory,
  Zap,
  Car,
  SlidersHorizontal,
} from "lucide-react";

// Icônes par besoin
const needIcons: Record<string, React.ReactNode> = {
  score_water: <Droplets className="w-4 h-4" />,
  score_food: <Utensils className="w-4 h-4" />,
  score_housing: <House className="w-4 h-4" />,
  score_healthcare: <HeartPulse className="w-4 h-4" />,
  score_security: <Shield className="w-4 h-4" />,
  score_education: <GraduationCap className="w-4 h-4" />,
  score_social_cohesion: <Users className="w-4 h-4" />,
  score_nature: <TreePine className="w-4 h-4" />,
  score_local_economy: <Factory className="w-4 h-4" />,
  score_energy: <Zap className="w-4 h-4" />,
  score_mobility: <Car className="w-4 h-4" />,
};

// Types d'objectifs avec couleurs
const objectiveTypes = [
  { value: "Subsistance", label: "Subsistance", color: "bg-red-500" },
  { value: "Gestion de crise", label: "Gestion de crise", color: "bg-amber-500" },
  { value: "Soutenabilité", label: "Soutenabilité", color: "bg-emerald-500" },
];

const indicatorTypes = [
  { value: "Action", label: "Action" },
  { value: "État", label: "État" },
];

const sourceTypes = [
  { value: "Donnée publique", label: "Donnée publique" },
  { value: "Enquête territoire", label: "Enquête" },
  { value: "Calcul dérivé", label: "Calcul" },
];

const Indicators = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const urlSearch = searchParams.get("search");

  const [search, setSearch] = useState(urlSearch ? decodeURIComponent(urlSearch) : "");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterObjective, setFilterObjective] = useState<string>("all");
  const [filterIndicatorType, setFilterIndicatorType] = useState<string>("all");
  const [filterSourceType, setFilterSourceType] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Comptage par besoin pour les badges
  const countsByNeed = useMemo(() => {
    const counts: Record<string, number> = { all: allIndicators.length };
    Object.keys(needLabels).forEach((key) => {
      counts[key] = allIndicators.filter(
        (ind) => ind.primaryNeed === key || ind.secondaryNeeds?.includes(key)
      ).length;
    });
    return counts;
  }, []);

  // Filtrage des indicateurs
  const filteredIndicators = useMemo(() => {
    let result = [...allIndicators];

    // Recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (ind) =>
          ind.label.toLowerCase().includes(searchLower) ||
          ind.id.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par besoin (onglet actif)
    if (activeTab !== "all") {
      result = result.filter(
        (ind) =>
          ind.primaryNeed === activeTab ||
          ind.secondaryNeeds?.includes(activeTab)
      );
    }

    // Filtres avancés
    if (filterObjective !== "all") {
      result = result.filter((ind) => ind.objectiveType === filterObjective);
    }
    if (filterIndicatorType !== "all") {
      result = result.filter((ind) => ind.indicatorType === filterIndicatorType);
    }
    if (filterSourceType !== "all") {
      result = result.filter((ind) => ind.sourceType === filterSourceType);
    }

    // Tri par besoin principal
    result.sort((a, b) => a.primaryNeed.localeCompare(b.primaryNeed));

    return result;
  }, [search, activeTab, filterObjective, filterIndicatorType, filterSourceType]);

  // Indicateur sélectionné
  const selectedIndicator = selectedId
    ? allIndicators.find((ind) => ind.id === selectedId)
    : null;

  // Navigation entre indicateurs
  const currentIndex = selectedIndicator
    ? filteredIndicators.findIndex((ind) => ind.id === selectedId)
    : -1;
  const prevIndicator = currentIndex > 0 ? filteredIndicators[currentIndex - 1] : null;
  const nextIndicator =
    currentIndex < filteredIndicators.length - 1
      ? filteredIndicators[currentIndex + 1]
      : null;

  const navigateToIndicator = (id: string) => {
    setSearchParams({ id });
  };

  const clearFilters = () => {
    setSearch("");
    setActiveTab("all");
    setFilterObjective("all");
    setFilterIndicatorType("all");
    setFilterSourceType("all");
  };

  const hasAdvancedFilters =
    filterObjective !== "all" ||
    filterIndicatorType !== "all" ||
    filterSourceType !== "all";

  const activeFiltersCount = [filterObjective, filterIndicatorType, filterSourceType].filter(f => f !== "all").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Référentiel des indicateurs</span>
          {selectedIndicator && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground truncate max-w-[200px]">
                {selectedIndicator.id}
              </span>
            </>
          )}
        </div>

        <div className="flex gap-6 min-h-[calc(100vh-200px)]">
          {/* Sidebar - Liste des indicateurs */}
          <aside className="w-[380px] flex-shrink-0 space-y-4">
            <div className="sticky top-4 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Référentiel des indicateurs
              </h1>

              {/* Recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un indicateur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Onglets par besoin */}
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Filtrer par besoin</p>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`h-8 px-3 text-xs rounded-full border transition-colors flex items-center gap-1.5 ${
                        activeTab === "all"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent border-border"
                      }`}
                    >
                      Tous
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-background/50">
                        {countsByNeed.all}
                      </Badge>
                    </button>
                    {Object.entries(needLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        title={label}
                        className={`h-8 px-2 text-xs rounded-full border transition-colors flex items-center gap-1 ${
                          activeTab === key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent border-border"
                        }`}
                      >
                        {needIcons[key]}
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-background/50">
                          {countsByNeed[key]}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </Tabs>
              </div>

              {/* Nom du besoin sélectionné */}
              {activeTab !== "all" && (
                <div className="flex items-center justify-between mb-3 p-2 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium text-primary flex items-center gap-2">
                    {needIcons[activeTab]}
                    {needLabels[activeTab]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("all")}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Filtres avancés (collapsible) */}
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters} className="mb-3">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3 h-3" />
                      Filtres avancés
                      {activeFiltersCount > 0 && (
                        <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  {/* Type d'objectif */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Type d'objectif</p>
                    <div className="flex flex-wrap gap-1.5">
                      {objectiveTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFilterObjective(filterObjective === type.value ? "all" : type.value)}
                          className={`h-7 px-2.5 text-xs rounded-full border transition-colors flex items-center gap-1.5 ${
                            filterObjective === type.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-border"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${type.color}`} />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type d'indicateur */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Type d'indicateur</p>
                    <div className="flex flex-wrap gap-1.5">
                      {indicatorTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFilterIndicatorType(filterIndicatorType === type.value ? "all" : type.value)}
                          className={`h-7 px-2.5 text-xs rounded-full border transition-colors ${
                            filterIndicatorType === type.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-border"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type de source */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Type de source</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sourceTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFilterSourceType(filterSourceType === type.value ? "all" : type.value)}
                          className={`h-7 px-2.5 text-xs rounded-full border transition-colors ${
                            filterSourceType === type.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-border"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasAdvancedFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterObjective("all");
                        setFilterIndicatorType("all");
                        setFilterSourceType("all");
                      }}
                      className="w-full h-7 text-xs text-muted-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Effacer les filtres avancés
                    </Button>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Compteur de résultats */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">
                  {filteredIndicators.length} indicateur{filteredIndicators.length > 1 ? "s" : ""}
                </p>
                {(search || activeTab !== "all" || hasAdvancedFilters) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs text-muted-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Tout effacer
                  </Button>
                )}
              </div>

              {/* Liste des indicateurs */}
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[200px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredIndicators.map((indicator) => (
                    <button
                      key={indicator.id}
                      onClick={() => navigateToIndicator(indicator.id)}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        selectedId === indicator.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 opacity-60">
                          {needIcons[indicator.primaryNeed]}
                        </span>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] opacity-60 block">
                            {indicator.id}
                          </span>
                          <span className="line-clamp-2">{indicator.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* Main content - Détail de l'indicateur */}
          <div className="flex-1 bg-card rounded-xl border border-border p-6 overflow-auto">
            {selectedIndicator ? (
              <IndicatorDetail
                indicator={selectedIndicator}
                prevIndicator={prevIndicator}
                nextIndicator={nextIndicator}
                onNavigate={navigateToIndicator}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">Sélectionnez un indicateur</p>
                <p className="text-sm">
                  Cliquez sur un indicateur dans la liste pour voir sa fiche détaillée.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface IndicatorDetailProps {
  indicator: IndicatorDetailed;
  prevIndicator: IndicatorDetailed | null;
  nextIndicator: IndicatorDetailed | null;
  onNavigate: (id: string) => void;
}

const IndicatorDetail = ({
  indicator,
  prevIndicator,
  nextIndicator,
  onNavigate,
}: IndicatorDetailProps) => {
  // Tous les besoins associés
  const allNeeds = [
    indicator.primaryNeed,
    ...(indicator.secondaryNeeds || []),
  ];

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-sm text-muted-foreground">
            {indicator.id}
          </span>
          <h2 className="text-xl font-bold text-foreground mt-1">
            {indicator.label}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={!prevIndicator}
            onClick={() => prevIndicator && onNavigate(prevIndicator.id)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!nextIndicator}
            onClick={() => nextIndicator && onNavigate(nextIndicator.id)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tableau des métadonnées */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-1/4">Propriété</TableHead>
              <TableHead>Valeur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Besoins associés</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {allNeeds.map((need, idx) => (
                    <Badge
                      key={need}
                      variant={idx === 0 ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {needIcons[need]}
                      <span className="text-xs">{needLabels[need]}</span>
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Type d'objectif</TableCell>
              <TableCell>
                <Badge
                  variant={
                    indicator.objectiveType === "Subsistance"
                      ? "destructive"
                      : indicator.objectiveType === "Gestion de crise"
                      ? "default"
                      : "secondary"
                  }
                >
                  {indicator.objectiveType}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Type d'indicateur</TableCell>
              <TableCell>
                <Badge variant="outline">{indicator.indicatorType}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Type de source</TableCell>
              <TableCell>
                <Badge variant="outline">{indicator.sourceType}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Separator />

      {/* Sections détaillées */}
      <div className="space-y-6">
        <Section title="Description" content={indicator.description} />
        <Section title="Justification" content={indicator.justification} />
        <Section title="Bornage" content={indicator.bornage} />
        <Section
          title="Accéder à l'indicateur"
          content={
            indicator.accessUrl ? (
              <a
                href={indicator.accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {indicator.accessUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : undefined
          }
        />
        <Section
          title="Sources"
          content={
            indicator.sources && indicator.sources.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {indicator.sources.map((source, idx) => (
                  <li key={idx}>{source}</li>
                ))}
              </ul>
            ) : undefined
          }
        />
      </div>

      {/* Navigation bas de page */}
      <Separator />
      <div className="flex items-center justify-between">
        {prevIndicator ? (
          <Button
            variant="ghost"
            onClick={() => onNavigate(prevIndicator.id)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{prevIndicator.label}</span>
          </Button>
        ) : (
          <div />
        )}
        {nextIndicator && (
          <Button
            variant="ghost"
            onClick={() => onNavigate(nextIndicator.id)}
            className="flex items-center gap-2"
          >
            <span className="truncate max-w-[200px]">{nextIndicator.label}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const Section = ({
  title,
  content,
}: {
  title: string;
  content?: React.ReactNode;
}) => (
  <div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    {content ? (
      <div className="text-muted-foreground text-sm">{content}</div>
    ) : (
      <p className="text-muted-foreground/50 text-sm italic">
        Information non renseignée
      </p>
    )}
  </div>
);

export default Indicators;
