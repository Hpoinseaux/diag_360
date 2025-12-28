import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Target,
  AlertTriangle,
  Leaf,
  Activity,
  FileText,
  Database,
  Calculator,
  ExternalLink,
  Scale,
  ChevronRight
} from "lucide-react";
import { NeedDetailDialog, NeedDetailData } from "@/components/NeedDetailDialog";
import { needsDetailedData } from "@/data/needsDetailedData";

const Methodology = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNeed, setSelectedNeed] = useState<NeedDetailData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check if there's a need parameter in the URL and open the corresponding dialog
  useEffect(() => {
    const needKey = searchParams.get("need");
    if (needKey) {
      const need = needsDetailedData.find(n => n.key === needKey);
      if (need) {
        setSelectedNeed(need);
        setDialogOpen(true);
        // Clear the URL parameter after opening
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  const needsCategories = [
    {
      category: "Besoins Vitaux",
      categoryColor: "bg-red-500/10 text-red-600 border-red-200",
      description: "Des besoins physiologiques et sanitaires dont la survie de l'être humain dépend. Abraham Maslow les présente comme socle de sa pyramide.",
      items: needsDetailedData.filter(n => n.categoryType === "Vital")
    },
    {
      category: "Besoins Essentiels",
      categoryColor: "bg-amber-500/10 text-amber-600 border-amber-200",
      description: "Des besoins indispensables pour la vie en société. Ils correspondent aux tranches intermédiaires et supérieures de la pyramide de Maslow.",
      items: needsDetailedData.filter(n => n.categoryType === "Essentiel")
    },
    {
      category: "Besoins Induits",
      categoryColor: "bg-blue-500/10 text-blue-600 border-blue-200",
      description: "Ils sont nécessaires pour répondre aux besoins vitaux et essentiels.",
      items: needsDetailedData.filter(n => n.categoryType === "Induit")
    }
  ];

  const handleNeedClick = (need: NeedDetailData) => {
    setSelectedNeed(need);
    setDialogOpen(true);
  };

  const objectives = [
    {
      icon: Target,
      name: "Subsistance",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      description: "La subsistance se définit comme le fait de satisfaire à ses besoins élémentaires. Avant tout, la résilience implique en effet de répondre au « plancher social » des besoins humains.",
      question: "Le territoire répond-il actuellement aux besoins fondamentaux de ses habitants ?"
    },
    {
      icon: AlertTriangle,
      name: "Gestion de crise",
      color: "bg-orange-500/10 text-orange-600 border-orange-200",
      description: "Pour être qualifiée de résiliente, cette capacité à pourvoir aux besoins de base doit être effective en toute situation, y compris lorsque le territoire subit des chocs ou des stress pouvant heurter sa stabilité. La collectivité doit être en capacité d'affronter ces crises inéluctables et de continuer à répondre aux besoins fondamentaux de ses habitants pendant ces crises.",
      question: "Le territoire peut-il maintenir les services essentiels en situation de crise ?"
    },
    {
      icon: Leaf,
      name: "Soutenabilité",
      color: "bg-teal-500/10 text-teal-600 border-teal-200",
      description: "Dans un monde post-carbone, la collectivité doit permettre à ses habitants de répondre à leurs besoins avec le plus faible impact environnemental possible, afin de ne pas dépasser les « plafonds écologiques ». Cet objectif vise à traduire à l'échelon local la notion de limites planétaires. Si la résilience ne s'accompagne pas de soutenabilité, elle creuse sa propre tombe.",
      question: "Le territoire répond-il à ses besoins dans le respect des limites planétaires ?"
    }
  ];

  const indicatorTypes = [
    {
      icon: Activity,
      name: "Indicateurs d'état",
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      description: "Ils décrivent un état de résilience actuel du territoire. On peut aussi les concevoir comme des indicateurs de résultat de l'action passée des acteurs du territoire.",
      examples: ["Part de la surface agricole en bio", "Taux de pauvreté", "Densité de médecins généralistes"]
    },
    {
      icon: FileText,
      name: "Indicateurs d'action",
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      description: "Ils s'intéressent à des actions structurantes qui ont pu être développées dans les années récentes par les pouvoirs publics. À la différence des indicateurs d'état, il s'agit de paramètres sur lesquels la collectivité peut avoir une influence directe au cours du mandat électif en cours.",
      examples: ["Existence d'un Plan Climat", "Mise en place d'un Projet Alimentaire Territorial", "Identification d'un élu-référent"]
    }
  ];

  const sourceTypes = [
    {
      icon: Database,
      name: "Donnée publique",
      color: "bg-sky-500/10 text-sky-600 border-sky-200",
      description: "Données issues de bases de données publiques nationales, accessibles en open data. Ces données permettent une comparaison objective entre territoires et sont mises à jour régulièrement par les institutions."
    },
    {
      icon: FileText,
      name: "Enquête territoire",
      color: "bg-violet-500/10 text-violet-600 border-violet-200",
      description: "Données collectées directement auprès de la collectivité par auto-évaluation. Ces indicateurs permettent de capturer des informations qualitatives sur les actions menées localement."
    },
    {
      icon: Calculator,
      name: "Calcul dérivé",
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      description: "Indicateurs calculés à partir de plusieurs sources de données combinées. Ces calculs permettent de créer des indicateurs synthétiques reflétant des situations complexes."
    }
  ];

  const sources = [
    { name: "Observatoire des Territoires", url: "https://www.observatoire-des-territoires.gouv.fr/", description: "Portail de données territoriales de l'ANCT" },
    { name: "INSEE Local", url: "https://statistiques-locales.insee.fr/", description: "Statistiques locales de l'INSEE" },
    { name: "Territoires au Futur", url: "https://territoiresaufutur.org/", description: "Plateforme d'indicateurs de transition" },
    { name: "ODDetT", url: "https://oddett.lab.sspcloud.fr/", description: "ODD et Territoires" },
    { name: "Eau France", url: "https://www.eaufrance.fr/", description: "Portail de l'eau en France" },
    { name: "Cartosanté", url: "https://cartosante.atlasante.fr/", description: "Cartographie de l'offre de soins" },
    { name: "Terristory", url: "https://terristory.fr/", description: "Données énergie-climat territoriales" },
    { name: "CRATER / Territoires Fertiles", url: "https://crater.resiliencealimentaire.org/", description: "Résilience alimentaire des territoires" },
    { name: "Mon Diagnostic Artificialisation", url: "https://artificialisation.developpement-durable.gouv.fr/", description: "Suivi de l'artificialisation des sols" },
    { name: "Data.caf", url: "https://data.caf.fr/", description: "Données de la CAF" },
    { name: "Ma-cantine", url: "https://ma-cantine.agriculture.gouv.fr/", description: "Suivi Egalim restauration collective" },
    { name: "Diagnostic-mobilité", url: "https://diagnostic-mobilite.fr/", description: "Données de mobilité territoriale" },
    { name: "Fragilité-numérique", url: "https://fragilite-numerique.fr/", description: "Indice de fragilité numérique" },
    { name: "Amenagements-cyclables.fr", url: "https://amenagements-cyclables.fr/", description: "Données sur les aménagements cyclables" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Méthodologie du Diag360°
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Le Diag360° s'appuie sur la Théorie du Donut de Kate Raworth pour évaluer la résilience territoriale 
            à travers 11 besoins fondamentaux, garantissant un plancher social tout en respectant les plafonds écologiques.
          </p>
        </div>

        {/* Les 11 Besoins */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Les 11 Besoins Fondamentaux
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-8">
            La notion de « fonction-clé » définit l'ensemble des rôles, structures, propriétés qui permettent 
            de répondre au sein d'un territoire aux besoins vitaux, essentiels et induits des citoyen·ne·s, 
            et donc de garantir la poursuite du "vivre ensemble".
          </p>

          <div className="space-y-8">
            {needsCategories.map((category) => (
              <Card key={category.category} className="border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={category.categoryColor}>
                      {category.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((need) => {
                      const Icon = need.icon;
                      return (
                        <button 
                          key={need.key}
                          onClick={() => handleNeedClick(need)}
                          className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-primary/30 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="font-semibold text-sm text-foreground flex-1">
                              {need.name}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {need.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <NeedDetailDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          need={selectedNeed} 
        />

        <Separator className="my-12" />

        {/* Les 3 Types d'Objectifs */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Les 3 Types d'Objectifs de Résilience
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Chaque besoin est évalué selon trois dimensions complémentaires qui permettent d'appréhender 
            la résilience dans toutes ses composantes temporelles.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {objectives.map((objective) => {
              const Icon = objective.icon;
              return (
                <Card key={objective.name} className="border-border/50 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${objective.color.split(' ')[0]}`}>
                        <Icon className={`w-5 h-5 ${objective.color.split(' ')[1]}`} />
                      </div>
                      <Badge variant="outline" className={objective.color}>
                        {objective.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {objective.description}
                    </p>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                      <p className="text-xs font-medium text-foreground italic">
                        "{objective.question}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Les 2 Types d'Indicateurs */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Les 2 Types d'Indicateurs
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-8">
            L'outil observe l'état de la résilience du territoire, résultant de ses caractéristiques propres 
            et de son histoire, mais il interroge aussi l'action récente des pouvoirs publics locaux.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {indicatorTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.name} className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color.split(' ')[0]}`}>
                        <Icon className={`w-5 h-5 ${type.color.split(' ')[1]}`} />
                      </div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {type.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Exemples :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example) => (
                          <Badge key={example} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Méthode de Pondération */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Méthode de Pondération
            </h2>
          </div>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Un coefficient de pondération est un facteur que l'on applique à une valeur afin lui donner 
                un poids plus important dans une moyenne générale. La pondération permet de refléter 
                l'importance ou la contribution relative de chaque indicateur.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <h4 className="font-semibold text-foreground mb-2">Pondération égale</h4>
                  <p className="text-sm text-muted-foreground">
                    Par défaut, tous les indicateurs ont une pondération de 1, considérant qu'ils sont d'égale importance.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <h4 className="font-semibold text-foreground mb-2">Pondération par critères</h4>
                  <p className="text-sm text-muted-foreground">
                    Coefficients ajustés selon le type de besoins (vitaux, essentiels, induits) et le type d'indicateur.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <h4 className="font-semibold text-foreground mb-2">Pondération personnalisée</h4>
                  <p className="text-sm text-muted-foreground">
                    Ajustable par les collectivités selon leurs spécificités et enjeux territoriaux particuliers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Les 3 Types de Sources */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Les 3 Types de Sources de Données
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sourceTypes.map((source) => {
              const Icon = source.icon;
              return (
                <Card key={source.name} className="border-border/50 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${source.color.split(' ')[0]}`}>
                        <Icon className={`w-5 h-5 ${source.color.split(' ')[1]}`} />
                      </div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {source.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Sources de Données */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <ExternalLink className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Sources de Données
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Les indicateurs du Diag360° s'appuient sur des sources de données officielles et fiables, 
            permettant une comparaison objective entre territoires.
          </p>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {source.name}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {source.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Méthodologie basée sur le{" "}
            <a 
              href="https://diag360.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Diag360° de la résilience territoriale
            </a>
            , inspiré de la Théorie du Donut de Kate Raworth.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Methodology;
