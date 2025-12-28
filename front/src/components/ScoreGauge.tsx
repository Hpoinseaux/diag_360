import { getScoreColor, getScoreLabel } from "@/data/mockTerritories";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export const ScoreGauge = ({ score, size = "md" }: ScoreGaugeProps) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const strokeWidth = size === "sm" ? 4 : size === "md" ? 6 : 8;
  const radius = size === "sm" ? 35 : size === "md" ? 55 : 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="absolute transform -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center z-10">
        <span 
          className={`font-bold ${textSizes[size]}`}
          style={{ color }}
        >
          {score.toFixed(0)}
        </span>
        <p className={`${labelSizes[size]} text-muted-foreground font-medium`}>
          {label}
        </p>
      </div>
    </div>
  );
};
