import { cn } from "@/lib/utils";

interface AlignmentScoreProps {
  score: number;
  className?: string;
}

export function AlignmentScore({ score, className }: AlignmentScoreProps) {
  const getScoreColor = () => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 60) return "text-primary";
    if (score >= 30) return "text-amber-400";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 90) return "Highly Aligned";
    if (score >= 60) return "Mostly Aligned";
    if (score >= 30) return "Partially Aligned";
    return "Highly Contradictory";
  };

  const getGradient = () => {
    if (score >= 90) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-primary to-cyan-400";
    if (score >= 30) return "from-amber-500 to-amber-400";
    return "from-destructive to-red-400";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative w-40 h-40">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={cn("transition-all duration-1000 ease-out", `stroke-current ${getScoreColor()}`)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 8px currentColor)`,
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold", getScoreColor())}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Score
          </span>
        </div>
      </div>

      <div className={cn(
        "px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r",
        getGradient(),
        "text-background"
      )}>
        {getScoreLabel()}
      </div>
    </div>
  );
}
