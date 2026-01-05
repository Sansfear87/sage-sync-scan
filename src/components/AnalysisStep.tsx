import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface AnalysisStepProps {
  step: number;
  title: string;
  content: string;
  status: "pending" | "active" | "complete";
  isLast?: boolean;
}

export function AnalysisStep({
  step,
  title,
  content,
  status,
  isLast = false,
}: AnalysisStepProps) {
  return (
    <div className="flex gap-4">
      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "step-indicator",
            status === "active" && "step-indicator-active",
            status === "complete" && "step-indicator-complete",
            status === "pending" && "step-indicator-pending"
          )}
        >
          {status === "complete" ? (
            <Check className="w-4 h-4" />
          ) : status === "active" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            step
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-px flex-1 min-h-8 mt-2 transition-colors duration-300",
              status === "complete" ? "bg-primary/50" : "bg-border"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <h3
          className={cn(
            "text-sm font-semibold mb-2 transition-colors duration-300",
            status === "active" && "text-primary",
            status === "complete" && "text-foreground",
            status === "pending" && "text-muted-foreground"
          )}
        >
          STEP {step}: {title}
        </h3>
        {status !== "pending" && content && (
          <div
            className={cn(
              "glass-card p-4 text-sm font-mono leading-relaxed animate-fade-in",
              status === "active" && "border-primary/30"
            )}
          >
            <div className="whitespace-pre-wrap text-muted-foreground">
              {content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
