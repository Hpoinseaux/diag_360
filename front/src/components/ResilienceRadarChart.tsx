import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TerritoryData, getFunctionsFromTerritory } from "@/types/territory";
import { getScoreColor } from "@/data/mockTerritories";

interface ResilienceRadarChartProps {
  data: TerritoryData;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = getScoreColor(data.score);
    return (
      <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
        <p className="font-medium text-sm text-foreground">{data.name}</p>
        <p className="font-semibold" style={{ color }}>
          Score: {data.score.toFixed(1)}/100
        </p>
      </div>
    );
  }
  return null;
};

export const ResilienceRadarChart = ({ data }: ResilienceRadarChartProps) => {
  const functions = getFunctionsFromTerritory(data);
  const chartData = functions.map((f) => ({
    ...f,
    shortName: f.name.length > 20 ? f.name.substring(0, 18) + "..." : f.name,
  }));

  // Couleur de fond basée sur le score global du territoire
  const globalScore = data.score ?? 50;
  const globalFillColor = getScoreColor(globalScore);

  // Fonction de rendu pour les points - reçoit les props de Recharts
  const renderCustomDot = (props: any) => {
    const { cx, cy, index } = props;
    
    if (typeof cx !== 'number' || typeof cy !== 'number' || typeof index !== 'number') {
      return null;
    }
    
    // Récupérer le score directement depuis chartData avec l'index
    const pointData = chartData[index];
    const score = pointData?.score ?? 0;
    const color = getScoreColor(score);

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={7}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <defs>
            <linearGradient id={`radarGradient-${data.code_siren}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={globalFillColor} stopOpacity={0.5} />
              <stop offset="100%" stopColor={globalFillColor} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <PolarAngleAxis
            dataKey="shortName"
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 10,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#9ca3af"
            fill={`url(#radarGradient-${data.code_siren})`}
            fillOpacity={1}
            strokeWidth={1.5}
            dot={renderCustomDot}
            activeDot={renderCustomDot}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
