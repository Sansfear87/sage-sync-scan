import { useState } from "react";
import { extractPdfText } from "../lib/pdf/extractPdfText";
import { Scan, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { DocumentUpload, Document } from "@/components/DocumentUpload";
import { AnalysisResults, AnalysisResult } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocuments } from "@/lib/api/analyze";

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
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

    await analyzeDocuments({
      documents,
      onStep: (step, content) => {
        setCurrentStep(step);
        setStreamingContent(content);
      },
      onComplete: (analysisResult) => {
        setResult(analysisResult);
        setIsAnalyzing(false);
        toast({
          title: "Analysis Complete",
          description: `Alignment score: ${analysisResult.step4}/100`,
        });
      },
      onError: (error) => {
        setIsAnalyzing(false);
        toast({
          title: "Analysis Failed",
          description: error,
          variant: "destructive",
        });
      },
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
              onClick={handleAnalyze}
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
