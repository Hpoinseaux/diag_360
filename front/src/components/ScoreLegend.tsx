const LEGEND_ITEMS = [
  { label: "Excellent", color: "hsl(142, 76%, 36%)", range: "80-100" },
  { label: "Bon", color: "hsl(152, 55%, 45%)", range: "70-79" },
  { label: "Modéré", color: "hsl(84, 60%, 50%)", range: "60-69" },
  { label: "À améliorer", color: "hsl(45, 93%, 58%)", range: "50-59" },
  { label: "Insuffisant", color: "hsl(25, 95%, 53%)", range: "40-49" },
  { label: "Critique", color: "hsl(0, 72%, 51%)", range: "< 40" },
];

export const ScoreLegend = () => {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        Légende des scores
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="text-xs">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground ml-1">({item.range})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
