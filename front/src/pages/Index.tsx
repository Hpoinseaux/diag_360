import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { FranceMap } from "@/components/FranceMap";
import { SearchSiren } from "@/components/SearchSiren";
import { TerritoryModal } from "@/components/TerritoryModal";
import { ScoreLegend } from "@/components/ScoreLegend";
import { TerritoryData } from "@/types/territory";
import { BarChart3, BookOpen, Zap, ChevronDown, Info, MapPin, Target, Globe, Heart, Lightbulb, Leaf, Users } from "lucide-react";

const Index = () => {
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTerritorySelect = (territory: TerritoryData) => {
    setSelectedTerritory(territory);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-10 md:py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 animate-fade-in">
              Diagnostic 360° de
              <span className="text-gradient"> Résilience Territoriale</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Évaluez la vulnérabilité et la résilience de votre intercommunalité grâce aux 11 fonctions-clés.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Box */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl border-2 border-primary/20 p-6 md:p-8 shadow-lg">
            <p className="text-center text-muted-foreground mb-6 text-base md:text-lg">
              Un outil gratuit permettant aux élus locaux d'évaluer la résilience de leur territoire 
              face aux défis écologiques, économiques et sociaux.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* 164 indicateurs */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">164</div>
                <div className="text-sm text-muted-foreground">indicateurs</div>
              </div>

              {/* Types d'indicateurs */}
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Indicateurs d'état
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Indicateurs d'action
                </span>
              </div>

              {/* 11 besoins humains */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">11</div>
                <div className="text-sm text-muted-foreground">besoins humains</div>
              </div>

              {/* Objectifs */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Objectifs :</div>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-foreground font-medium">Subsistance</span>
                  <span className="text-foreground font-medium">Soutenabilité</span>
                  <span className="text-foreground font-medium">Gestion de crise</span>
                </div>
              </div>
            </div>

            {/* Données */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Données ouvertes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-primary bg-transparent"></div>
                  <span className="text-muted-foreground">Données internes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arrow indicator */}
      <div className="flex justify-center py-6">
        <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
      </div>

      {/* CTA Buttons */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Explorez les indicateurs */}
            <Link 
              to="/indicateurs"
              className="group bg-card hover:bg-card/80 rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Explorez les indicateurs
                </h3>
                <p className="text-sm text-muted-foreground">
                  Découvrez les 164 indicateurs utilisés pour évaluer la résilience territoriale
                </p>
              </div>
            </Link>

            {/* Diagnostic-Flash - CTA principal */}
            <Link 
              to="/diagnostic-flash"
              className="group bg-primary hover:bg-primary/90 rounded-xl border border-primary p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-xl bg-primary-foreground/20">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground">
                  Découvrez un diagnostic-flash
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  Évaluez la résilience de votre territoire à partir des données ouvertes
                </p>
              </div>
            </Link>

            {/* Appropriez vous la méthode */}
            <Link 
              to="/methodologie"
              className="group bg-card hover:bg-card/80 rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Appropriez-vous la méthode
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comprenez la méthodologie basée sur la Théorie du Donut de Kate Raworth
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Carte des Intercommunalités
                </h2>
                <p className="text-sm text-muted-foreground">
                  ~1200 EPCI • Cliquez pour voir le diagnostic
                </p>
              </div>
            </div>
            <FranceMap onTerritoryClick={handleTerritorySelect} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ScoreLegend />

            {/* Search */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-3">Recherche rapide</h4>
              <SearchSiren onTerritoryFound={handleTerritorySelect} />
            </div>

            {/* Features */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-3">Fonctionnalités</h4>
              <div className="space-y-3">
                {[
                  { icon: MapPin, label: "Carte EPCI interactive zoomable" },
                  { icon: BarChart3, label: "11 fonctions-clés analysées" },
                  { icon: Target, label: "Diagnostic par intercommunalité" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 rounded bg-primary/10">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">
                    À propos des EPCI
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Les EPCI (Établissements Publics de Coopération Intercommunale) regroupent 
                    les communes pour exercer des compétences partagées. Le diagnostic 360° 
                    évalue leur résilience selon la théorie du donut.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="container mx-auto px-4 py-12 space-y-12">
        
        {/* About the Project */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">Le Projet Diag360</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Le <strong className="text-foreground">Diagnostic 360°</strong> est un outil gratuit et accessible 
                permettant aux élus locaux d'évaluer la résilience de leur territoire face aux défis 
                écologiques, économiques et sociaux.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Basé sur des données publiques et ouvertes (INSEE, Observatoire des Territoires, 
                Eau France...), il offre une photographie instantanée des vulnérabilités et des 
                forces de chaque intercommunalité.
              </p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-foreground">Objectifs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Identifier les vulnérabilités territoriales</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Prioriser les actions de résilience</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Comparer les territoires entre eux</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">L'Équipe</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Le Diag360 est porté par une équipe pluridisciplinaire réunissant des experts en 
                transition écologique, développement territorial et analyse de données.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ce projet est développé comme un <strong className="text-foreground">commun numérique</strong>, 
                gratuit et accessible à tous, dans une logique de service public.
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-secondary/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Partenaires institutionnels</h4>
                <p className="text-xs text-muted-foreground">
                  Collaboration avec les observatoires territoriaux, les DREAL et les réseaux 
                  d'élus engagés dans la transition.
                </p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Sources de données</h4>
                <p className="text-xs text-muted-foreground">
                  INSEE, Observatoire des Territoires, Eau France, Cartosanté, Data.caf, 
                  Mon Diagnostic Artificialisation.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Pour en savoir plus sur le référentiel Diag360, consultez{" "}
              <a 
                href="https://diag360.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                diag360.org
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-4 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-1">
            Diagnostic 360° — Un commun numérique gratuit et accessible à tous
          </p>
          <p className="text-xs">
            Données EPCI: OpenDataSoft / IGN / INSEE • Méthodologie Kate Raworth
          </p>
        </div>
      </footer>

      {/* Territory Modal */}
      <TerritoryModal
        territory={selectedTerritory}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Index;
