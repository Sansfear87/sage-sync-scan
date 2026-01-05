import { Brain } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="gradient-text">S.A.G.E.</span>
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider">
              Structured Autonomous Generation & Evaluation
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
