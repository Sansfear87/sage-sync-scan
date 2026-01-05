import { useState } from "react";
import { Scan, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { DocumentUpload, Document } from "@/components/DocumentUpload";
import { AnalysisResults, AnalysisResult } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const simulateAnalysis = async () => {
    if (documents.length < 2) {
      toast({
        title: "Not enough documents",
        description: "Please upload at least 2 documents to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setCurrentStep(0);
    setStreamingContent("");

    // Simulate step-by-step analysis with mock data
    const mockResults: AnalysisResult = {
      step0: documents
        .map(
          (doc, i) =>
            `Document ${i + 1} – Extracted Text:\n"${doc.content.slice(0, 200)}${doc.content.length > 200 ? "..." : ""}"`
        )
        .join("\n\n"),
      step1: documents
        .map(
          (doc, i) =>
            `Document ${i + 1} Summary:\n• Key claim: Analysis of provided content\n• Main focus: ${doc.name}\n• Intent: Information sharing`
        )
        .join("\n\n"),
      step2:
        "Cross-Document Analysis:\n\n• Common themes identified across documents\n• Similar terminology and concepts detected\n• Shared context and references found\n• Minor variations in presentation style",
      step3:
        "Discrepancy Analysis:\n\n• No major contradictions detected\n• Minor differences in emphasis noted\n• Some documents provide additional context not present in others\n• Overall consistency maintained across sources",
      step4: 78,
      step5:
        "The documents show strong alignment with minor variations. The core claims and intent are consistent across all sources. Slight differences exist in emphasis and detail level, but these do not constitute contradictions. The alignment score of 78 reflects mostly aligned content with minor inconsistencies typical of multi-source documentation.",
    };

    const steps = [
      mockResults.step0,
      mockResults.step1,
      mockResults.step2,
      mockResults.step3,
      `Processing alignment score...`,
      mockResults.step5,
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setStreamingContent("");
      
      // Simulate streaming text character by character
      const text = steps[i];
      for (let j = 0; j < text.length; j++) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        setStreamingContent((prev) => prev + text[j]);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setResult(mockResults);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Alignment score: ${mockResults.step4}/100`,
    });
  };

  const canAnalyze = documents.length >= 2 && !isAnalyzing;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              Autonomous Document Analysis
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Analyze Document Alignment
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload 3-5 documents and let S.A.G.E. autonomously detect alignment,
              discrepancies, and provide a comprehensive analysis with scoring.
            </p>
          </section>

          {/* Upload Section */}
          <section className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                1
              </span>
              Upload Documents
            </h3>
            <DocumentUpload
              documents={documents}
              onDocumentsChange={setDocuments}
              maxDocuments={5}
            />
          </section>

          {/* Analyze Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="glow"
              size="xl"
              onClick={simulateAnalysis}
              disabled={!canAnalyze}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  Analyze Documents
                </>
              )}
            </Button>
            {documents.length < 2 && (
              <p className="text-sm text-muted-foreground">
                Upload at least {2 - documents.length} more document{2 - documents.length > 1 ? 's' : ''} to start analysis
              </p>
            )}
          </div>

          {/* Results Section */}
          {(isAnalyzing || result) && (
            <section className="glass-card p-6 animate-fade-in">
              <AnalysisResults
                result={result}
                isAnalyzing={isAnalyzing}
                currentStep={currentStep}
                streamingContent={streamingContent}
              />
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>S.A.G.E. — Hackathon Demo • Autonomous Multi-Step Document Analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
