import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, AlertTriangle, Leaf, ChevronRight } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface NeedIndicator {
  name: string;
  url: string;
}

export interface NeedDetailData {
  key: string;
  name: string;
  icon: LucideIcon;
  categoryType: "Vital" | "Essentiel" | "Induit";
  description: string;
  detailedDescription: string;
  indicators: {
    transverses?: NeedIndicator[];
    subsistance?: {
      description: string;
      items: NeedIndicator[];
    };
    gestionCrise?: {
      description: string;
      items: NeedIndicator[];
    };
    soutenabilite?: {
      description: string;
      items: NeedIndicator[];
    };
  };
}

interface NeedDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  need: NeedDetailData | null;
}

const categoryColors = {
  Vital: "bg-red-500/10 text-red-600 border-red-200",
  Essentiel: "bg-amber-500/10 text-amber-600 border-amber-200",
  Induit: "bg-blue-500/10 text-blue-600 border-blue-200",
};

// Helper function to create a search-friendly indicator name
const createIndicatorSearchParam = (name: string) => {
  return encodeURIComponent(name.substring(0, 30));
};

export function NeedDetailDialog({ open, onOpenChange, need }: NeedDetailDialogProps) {
  if (!need) return null;

  const Icon = need.icon;

  const IndicatorLink = ({ indicator, colorClass }: { indicator: NeedIndicator; colorClass: string }) => (
    <li className="flex items-start gap-2">
      <span className={`${colorClass} mt-1`}>•</span>
      <Link 
        to={`/indicateurs?search=${createIndicatorSearchParam(indicator.name)}`}
        onClick={() => onOpenChange(false)}
        className={`text-sm text-muted-foreground hover:${colorClass.replace('text-', '')} transition-colors flex items-center gap-1 group`}
      >
        {indicator.name}
        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </li>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-display font-bold text-foreground">
                {need.name}
              </DialogTitle>
              <Badge variant="outline" className={`mt-2 ${categoryColors[need.categoryType]}`}>
                Besoin {need.categoryType}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Description détaillée */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                {need.detailedDescription}
              </p>
            </div>

            <Separator />

            {/* Indicateurs */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Indicateurs
              </h3>

              <div className="space-y-5">
                {/* Indicateurs transverses */}
                {need.indicators.transverses && need.indicators.transverses.length > 0 && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Indicateurs transverses aux trois objectifs
                    </h4>
                    <ul className="space-y-2">
                      {need.indicators.transverses.map((indicator, idx) => (
                        <IndicatorLink key={idx} indicator={indicator} colorClass="text-primary" />
                      ))}
                    </ul>
                  </div>
                )}

                {/* Subsistance */}
                {need.indicators.subsistance && need.indicators.subsistance.items.length > 0 && (
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-200/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-semibold text-emerald-700">Subsistance</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      {need.indicators.subsistance.description}
                    </p>
                    <ul className="space-y-2">
                      {need.indicators.subsistance.items.map((indicator, idx) => (
                        <IndicatorLink key={idx} indicator={indicator} colorClass="text-emerald-600" />
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gestion de crise */}
                {need.indicators.gestionCrise && need.indicators.gestionCrise.items.length > 0 && (
                  <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-200/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <h4 className="text-sm font-semibold text-orange-700">Gestion de crise</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      {need.indicators.gestionCrise.description}
                    </p>
                    <ul className="space-y-2">
                      {need.indicators.gestionCrise.items.map((indicator, idx) => (
                        <IndicatorLink key={idx} indicator={indicator} colorClass="text-orange-600" />
                      ))}
                    </ul>
                  </div>
                )}

                {/* Soutenabilité */}
                {need.indicators.soutenabilite && need.indicators.soutenabilite.items.length > 0 && (
                  <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-200/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-teal-600" />
                      <h4 className="text-sm font-semibold text-teal-700">Soutenabilité</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      {need.indicators.soutenabilite.description}
                    </p>
                    <ul className="space-y-2">
                      {need.indicators.soutenabilite.items.map((indicator, idx) => (
                        <IndicatorLink key={idx} indicator={indicator} colorClass="text-teal-600" />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
