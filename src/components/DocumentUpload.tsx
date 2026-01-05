import { useCallback, useState } from "react";
import { Upload, FileText, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Document {
  id: string;
  name: string;
  content: string;
  type: "file" | "text";
}

interface DocumentUploadProps {
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  maxDocuments?: number;
}

export function DocumentUpload({
  documents,
  onDocumentsChange,
  maxDocuments = 5,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [documents, maxDocuments]
  );

  const processFiles = async (files: File[]) => {
    const remainingSlots = maxDocuments - documents.length;
    const filesToProcess = files.slice(0, remainingSlots);

    const newDocuments: Document[] = [];

    for (const file of filesToProcess) {
      const content = await file.text();
      newDocuments.push({
        id: crypto.randomUUID(),
        name: file.name,
        content,
        type: "file",
      });
    }

    onDocumentsChange([...documents, ...newDocuments]);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = "";
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;

    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: `Document ${documents.length + 1}`,
      content: textInput,
      type: "text",
    };

    onDocumentsChange([...documents, newDoc]);
    setTextInput("");
    setShowTextInput(false);
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const canAddMore = documents.length < maxDocuments;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-card/50",
          !canAddMore && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          multiple
          accept=".txt,.pdf,.md,.json,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={!canAddMore}
        />
        <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              Drop documents here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse • TXT, PDF, MD, JSON, CSV
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {documents.length}/{maxDocuments} documents uploaded
          </p>
        </div>
      </div>

      {/* Text Input Toggle */}
      {canAddMore && !showTextInput && (
        <Button
          variant="outline"
          onClick={() => setShowTextInput(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Paste text directly
        </Button>
      )}

      {/* Text Input Area */}
      {showTextInput && (
        <div className="glass-card p-4 space-y-3 animate-fade-in">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your document text here..."
            className="w-full h-32 bg-muted/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddText} disabled={!textInput.trim()} size="sm">
              Add Document
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowTextInput(false);
                setTextInput("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="glass-card p-3 flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.content.length.toLocaleString()} characters
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeDocument(doc.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
