import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TerritoryData } from "@/types/territory";
import { ResilienceRadarChart } from "./ResilienceRadarChart";
import { ScoreGauge } from "./ScoreGauge";
import { FunctionsList } from "./FunctionsList";
import { ObjectiveTypeScores } from "./ObjectiveTypeScores";
import { MapPin, Users, Building2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TerritoryModalProps {
  territory: TerritoryData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TerritoryModal = ({
  territory,
  open,
  onOpenChange,
}: TerritoryModalProps) => {
  if (!territory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header compact */}
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg md:text-xl font-display leading-tight">
                {territory.name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {territory.type || "EPCI"}
                </Badge>
                {territory.region && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {territory.region}
                  </span>
                )}
                <span>SIREN: {territory.code_siren}</span>
                {territory.population && territory.population > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {territory.population.toLocaleString("fr-FR")} hab.
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Score global à gauche + Titre/mention à droite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Score global - Colonne gauche */}
          <div className="flex flex-col items-center justify-center border-r border-border pr-4">
            <ScoreGauge score={territory.score} size="lg" />
            <p className="text-sm text-muted-foreground mt-2 font-semibold">Score global</p>
          </div>

          {/* Titre et mention explicative - Colonne droite */}
          <div className="flex flex-col justify-center space-y-3 pl-4">
            <h2 className="text-lg md:text-xl font-display font-bold text-primary">
              Pré-diagnostic 360° de la résilience territoriale
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ce résultat est une pré-visualisation incomplète du diagnostic 360° de la résilience territoriale de ce territoire, établie à partir des données ouvertes disponibles en ligne. L'établissement d'une version complète Diagnostic 360° requiert le renseignement d'autres indicateurs internes aux collectivités, et son résultat est réservé aux collectivités locales.
            </p>
          </div>
        </div>

        {/* Layout principal : Radar + Scores par type */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Radar - Colonne centrale, plus grande */}
          <div className="lg:col-span-2 bg-card rounded-xl p-4 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">
              Diagnostic 360° - Vue Radar
            </h3>
            <div className="h-[280px] md:h-[320px]">
              <ResilienceRadarChart data={territory} />
            </div>
          </div>

          {/* Scores par type - Colonne droite */}
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-xl p-4">
              <ObjectiveTypeScores data={territory} />
            </div>
          </div>
        </div>

        {/* CTA pour les élus - Positionné après le radar, avant les fonctions */}
        <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6 text-center">
          <p className="text-base md:text-lg text-foreground font-medium mb-4">
            Vous êtes élu·e ou agent territorial et souhaitez en savoir plus sur la résilience de votre territoire ?
          </p>
          <Button asChild size="lg" variant="default" className="gap-2 text-base px-8">
            <Link to="/contact-collectivite" onClick={() => onOpenChange(false)}>
              En savoir plus
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Liste des fonctions */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <FunctionsList data={territory} />
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Méthodologie Diagnostic 360° · Scores calculés à partir d'indicateurs publics
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
