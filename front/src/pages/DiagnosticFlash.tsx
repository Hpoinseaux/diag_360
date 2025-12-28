import { useState } from "react";
import { Header } from "@/components/Header";
import { FranceMap } from "@/components/FranceMap";
import { SearchSiren } from "@/components/SearchSiren";
import { TerritoryModal } from "@/components/TerritoryModal";
import { ScoreLegend } from "@/components/ScoreLegend";
import { TerritoryData } from "@/types/territory";
import { Info, MapPin, BarChart3, Target, Zap } from "lucide-react";

const DiagnosticFlash = () => {
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
        <div className="container mx-auto px-4 py-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Diagnostic-Flash Territorial
              </h1>
            </div>
            <p className="text-base text-muted-foreground mb-2">
              Découvrez un aperçu de la résilience de votre territoire à partir des données ouvertes.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-6">
              Recherchez par SIREN ou nom d'EPCI, ou cliquez sur la carte pour sélectionner une intercommunalité.
            </p>

            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchSiren onTerritoryFound={handleTerritorySelect} />
            </div>
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
                    À propos du Diagnostic-Flash
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ce diagnostic est basé uniquement sur les données ouvertes. Pour un diagnostic 
                    complet incluant les données internes de votre collectivité, contactez-nous.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2">Statistiques</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <span className="block text-2xl font-bold text-primary">~1200</span>
                  <span className="text-xs text-muted-foreground">EPCI</span>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <span className="block text-2xl font-bold text-primary">11</span>
                  <span className="text-xs text-muted-foreground">Fonctions-clés</span>
                </div>
              </div>
            </div>
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

export default DiagnosticFlash;
