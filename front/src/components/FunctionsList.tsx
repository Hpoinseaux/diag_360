import { useState } from "react";
import { TerritoryData, getFunctionsFromTerritory, getScoreColor } from "@/types/territory";
import { IndicatorDetailSheet } from "./IndicatorDetailSheet";
import { NeedDetailDialog, NeedDetailData } from "./NeedDetailDialog";
import { ChevronRight, Info } from "lucide-react";
import { needsDetailedData } from "@/data/needsDetailedData";

interface FunctionsListProps {
  data: TerritoryData;
}

export const FunctionsList = ({ data }: FunctionsListProps) => {
  const functions = getFunctionsFromTerritory(data);
  const sortedFunctions = [...functions].sort((a, b) => b.score - a.score);

  const [selectedFunction, setSelectedFunction] = useState<{
    key: string;
    name: string;
    code: string;
    score: number;
  } | null>(null);

  const [selectedNeed, setSelectedNeed] = useState<NeedDetailData | null>(null);

  const handleNeedClick = (needKey: string) => {
    const needData = needsDetailedData.find(n => n.key === needKey);
    if (needData) {
      setSelectedNeed(needData);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground mb-4">Détail des 11 fonctions-clés</h4>
        {sortedFunctions.map((func, index) => (
          <div
            key={index}
            className="group hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-mono text-muted-foreground w-7 flex-shrink-0">
                  {func.code}
                </span>
                <button
                  onClick={() => handleNeedClick(func.key)}
                  className="text-sm text-foreground font-medium truncate hover:text-primary hover:underline transition-colors text-left flex items-center gap-1"
                >
                  {func.name}
                  <Info className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span 
                  className="text-sm font-bold"
                  style={{ color: getScoreColor(func.score) }}
                >
                  {func.score.toFixed(1)}
                </span>
                <button
                  onClick={() => setSelectedFunction({
                    key: func.key,
                    name: func.name,
                    code: func.code,
                    score: func.score,
                  })}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
                  title="Voir les indicateurs"
                >
                  <span className="hidden sm:inline">Indicateurs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div 
              onClick={() => setSelectedFunction({
                key: func.key,
                name: func.name,
                code: func.code,
                score: func.score,
              })}
              className="cursor-pointer"
            >
              <div className="h-2 bg-muted rounded-full overflow-hidden ml-9">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${func.score}%`,
                    backgroundColor: getScoreColor(func.score),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <IndicatorDetailSheet
        open={selectedFunction !== null}
        onOpenChange={(open) => !open && setSelectedFunction(null)}
        needKey={selectedFunction?.key || ""}
        needName={selectedFunction?.name || ""}
        needCode={selectedFunction?.code || ""}
        baseScore={selectedFunction?.score || 0}
        territory={data}
      />

      <NeedDetailDialog
        open={selectedNeed !== null}
        onOpenChange={(open) => !open && setSelectedNeed(null)}
        need={selectedNeed}
      />
    </>
  );
};
