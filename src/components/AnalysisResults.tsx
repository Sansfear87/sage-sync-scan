import { AnalysisStep } from "./AnalysisStep";
import { AlignmentScore } from "./AlignmentScore";
import type { AnalysisResult } from "@/lib/api/analyze";

export type { AnalysisResult };

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  currentStep: number;
  streamingContent: string;
}

const STEP_TITLES = [
  "OCR & TEXT NORMALIZATION",
  "DOCUMENT SUMMARIZATION",
  "CROSS-DOCUMENT COMPARISON",
  "DISCREPANCY DETECTION",
  "ALIGNMENT SCORING",
  "ALIGNMENT EXPLANATION",
];

export function AnalysisResults({
  result,
  isAnalyzing,
  currentStep,
  streamingContent,
}: AnalysisResultsProps) {
  const getStepStatus = (stepIndex: number) => {
    if (!isAnalyzing && result) return "complete";
    if (stepIndex < currentStep) return "complete";
    if (stepIndex === currentStep) return "active";
    return "pending";
  };

  const getStepContent = (stepIndex: number) => {
    if (!isAnalyzing && result) {
      switch (stepIndex) {
        case 0:
          return result.step0;
        case 1:
          return result.step1;
        case 2:
          return result.step2;
        case 3:
          return result.step3;
        case 4:
          return `Alignment Score: ${result.step4}/100`;
        case 5:
          return result.step5;
        default:
          return "";
      }
    }
    if (stepIndex === currentStep) return streamingContent;
    if (stepIndex < currentStep) return "✓ Completed";
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <h2 className="text-lg font-semibold text-foreground">Analysis Results</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Alignment Score - Show when complete */}
      {!isAnalyzing && result && (
        <div className="flex justify-center py-6 animate-fade-in">
          <AlignmentScore score={result.step4} />
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {STEP_TITLES.map((title, index) => (
          <AnalysisStep
            key={index}
            step={index}
            title={title}
            content={getStepContent(index)}
            status={getStepStatus(index)}
            isLast={index === STEP_TITLES.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
