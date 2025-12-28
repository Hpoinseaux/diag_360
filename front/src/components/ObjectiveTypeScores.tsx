import { TerritoryData, RESILIENCE_FUNCTIONS } from "@/types/territory";
import { getScoreColor, getScoreLabel } from "@/types/territory";
import { Target, Activity, Leaf, Play, BarChart3 } from "lucide-react";

interface ObjectiveTypeScoresProps {
  data: TerritoryData;
}

// Mapping des besoins par type d'objectif
const OBJECTIVE_TYPES = {
  "Subsistance": {
    label: "Subsistance",
    description: "Capacité actuelle à répondre aux besoins",
    icon: Target,
    needKeys: ["score_water", "score_food", "score_housing", "score_healthcare", "score_security"],
  },
  "Gestion de crise": {
    label: "Gestion de crise",
    description: "Capacité à maintenir le service en situation dégradée",
    icon: Activity,
    needKeys: ["score_education", "score_social_cohesion", "score_nature"],
  },
  "Soutenabilité": {
    label: "Soutenabilité",
    description: "Capacité à assurer les besoins de manière durable",
    icon: Leaf,
    needKeys: ["score_local_economy", "score_energy", "score_mobility"],
  },
};

// Types d'indicateurs Action / État
const INDICATOR_TYPES = {
  "Action": {
    label: "Indicateurs d'action",
    description: "Mesure les actions entreprises par le territoire",
    icon: Play,
    // Les indicateurs d'action concernent : planification, référents, dispositifs mis en œuvre
    needKeys: ["score_water", "score_food", "score_education", "score_local_economy", "score_energy"],
  },
  "État": {
    label: "Indicateurs d'état",
    description: "Mesure la situation actuelle du territoire",
    icon: BarChart3,
    // Les indicateurs d'état concernent : conformité, taux, couverture, accessibilité
    needKeys: ["score_housing", "score_healthcare", "score_security", "score_social_cohesion", "score_nature", "score_mobility"],
  },
};

const calculateAverageScore = (data: TerritoryData, needKeys: string[]): number => {
  const scores = needKeys
    .map((key) => data[key as keyof TerritoryData] as number | null)
    .filter((score): score is number => score !== null && score !== undefined);
  
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

const ScoreBar = ({ score, label }: { score: number; label: string }) => {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${score}%`, 
              backgroundColor: color 
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-[100px] justify-end">
        <span className="text-sm font-semibold" style={{ color }}>
          {score.toFixed(0)}
        </span>
        <span className="text-xs text-muted-foreground">
          {scoreLabel}
        </span>
      </div>
    </div>
  );
};

export const ObjectiveTypeScores = ({ data }: ObjectiveTypeScoresProps) => {
  return (
    <div className="space-y-6">
      {/* Scores par type d'objectif */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Scores par type d'objectif
        </h4>
        <div className="space-y-4">
          {Object.entries(OBJECTIVE_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            const score = calculateAverageScore(data, config.needKeys);
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                </div>
                <ScoreBar score={score} label={config.label} />
                <p className="text-xs text-muted-foreground pl-6">{config.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-border" />

      {/* Scores par type d'indicateur */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Scores par type d'indicateur
        </h4>
        <div className="space-y-4">
          {Object.entries(INDICATOR_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            const score = calculateAverageScore(data, config.needKeys);
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                </div>
                <ScoreBar score={score} label={config.label} />
                <p className="text-xs text-muted-foreground pl-6">{config.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
