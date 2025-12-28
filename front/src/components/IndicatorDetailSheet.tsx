import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TerritoryData, getScoreColor } from "@/types/territory";
import { 
  generateIndicatorScores, 
  categoryLabels, 
  Indicator 
} from "@/data/indicatorsData";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Info,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface IndicatorDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needKey: string;
  needName: string;
  needCode: string;
  baseScore: number;
  territory: TerritoryData;
}

const getScoreIcon = (score: number) => {
  if (score >= 70) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (score >= 40) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
};

const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (category) {
    case "Vitaux":
      return "destructive";
    case "Essentiels":
      return "default";
    case "Induits":
      return "secondary";
    default:
      return "outline";
  }
};

// Helper function to create a search-friendly indicator name
const createIndicatorSearchParam = (name: string) => {
  return encodeURIComponent(name.substring(0, 30));
};

export const IndicatorDetailSheet = ({
  open,
  onOpenChange,
  needKey,
  needName,
  needCode,
  baseScore,
  territory,
}: IndicatorDetailSheetProps) => {
  const indicators = generateIndicatorScores(needKey, baseScore);

  // Trier par score (du plus faible au plus élevé pour identifier les points d'amélioration)
  const sortedIndicators = [...indicators].sort((a, b) => (a.score || 0) - (b.score || 0));

  // Compter les indicateurs par niveau
  const criticalCount = indicators.filter(i => (i.score || 0) < 40).length;
  const warningCount = indicators.filter(i => (i.score || 0) >= 40 && (i.score || 0) < 70).length;
  const goodCount = indicators.filter(i => (i.score || 0) >= 70).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: getScoreColor(baseScore) }}
            >
              {needCode}
            </div>
            <div className="flex-1 min-w-0">
              <Link 
                to={`/methodologie?need=${needKey}`}
                className="hover:text-primary transition-colors"
              >
                <SheetTitle className="text-lg leading-tight hover:underline inline-flex items-center gap-1">
                  {needName}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </SheetTitle>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                {territory.name}
              </p>
            </div>
          </div>

          {/* Score summary */}
          <div className="flex items-center gap-4 mt-4 p-3 bg-secondary/30 rounded-lg">
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: getScoreColor(baseScore) }}
              >
                {baseScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Score global</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex-1 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold text-green-600">{goodCount}</div>
                <div className="text-muted-foreground">Bons</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-600">{warningCount}</div>
                <div className="text-muted-foreground">Moyens</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">{criticalCount}</div>
                <div className="text-muted-foreground">Critiques</div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-280px)] mt-4 pr-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Info className="w-4 h-4" />
              <span>{indicators.length} indicateurs évalués</span>
            </div>

            {sortedIndicators.map((indicator, index) => (
              <IndicatorCard key={indicator.id} indicator={indicator} index={index} onClose={() => onOpenChange(false)} />
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">À propos de cette note</h4>
            <p className="text-xs text-muted-foreground">
              Le score de {baseScore.toFixed(1)} pour "{needName}" est calculé comme 
              la moyenne pondérée des {indicators.length} indicateurs ci-dessus. 
              Les données proviennent de sources publiques officielles (INSEE, 
              ADEME, Ministères, etc.) et sont mises à jour annuellement.
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const IndicatorCard = ({ indicator, index, onClose }: { indicator: Indicator; index: number; onClose: () => void }) => {
  const score = indicator.score || 0;
  
  return (
    <Link 
      to={`/indicateurs?search=${createIndicatorSearchParam(indicator.label)}`}
      onClick={onClose}
      className="block group p-3 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getScoreIcon(score)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
            {indicator.label}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={getCategoryBadgeVariant(indicator.category)}
              className="text-[10px] px-1.5 py-0"
            >
              {categoryLabels[indicator.category]?.label || indicator.category}
            </Badge>
            {indicator.secondaryNeeds && indicator.secondaryNeeds.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                +{indicator.secondaryNeeds.length} besoin{indicator.secondaryNeeds.length > 1 ? 's' : ''} lié{indicator.secondaryNeeds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="text-right">
            <div 
              className="text-lg font-bold"
              style={{ color: getScoreColor(score) }}
            >
              {score.toFixed(0)}
            </div>
            <div className="text-[10px] text-muted-foreground">/100</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
    </Link>
  );
};
