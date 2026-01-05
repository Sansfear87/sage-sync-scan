import { Document } from "@/components/DocumentUpload";

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-documents`;

export interface AnalysisResult {
  step0: string;
  step1: string;
  step2: string;
  step3: string;
  step4: number;
  step5: string;
  fullContent: string;
}

type OnStepCallback = (step: number, content: string) => void;
type OnCompleteCallback = (result: AnalysisResult) => void;
type OnErrorCallback = (error: string) => void;

export async function analyzeDocuments({
  documents,
  onStep,
  onComplete,
  onError,
}: {
  documents: Document[];
  onStep: OnStepCallback;
  onComplete: OnCompleteCallback;
  onError: OnErrorCallback;
}) {
  try {
    const response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        documents: documents.map(doc => ({
          name: doc.name,
          content: doc.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let textBuffer = '';
    let currentStep = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      // Process line-by-line
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
            
            // Detect which step we're on based on content
            if (fullContent.includes('STEP 5') || fullContent.includes('Step 5')) {
              currentStep = 5;
            } else if (fullContent.includes('STEP 4') || fullContent.includes('Step 4')) {
              currentStep = 4;
            } else if (fullContent.includes('STEP 3') || fullContent.includes('Step 3')) {
              currentStep = 3;
            } else if (fullContent.includes('STEP 2') || fullContent.includes('Step 2')) {
              currentStep = 2;
            } else if (fullContent.includes('STEP 1') || fullContent.includes('Step 1')) {
              currentStep = 1;
            } else if (fullContent.includes('STEP 0') || fullContent.includes('Step 0')) {
              currentStep = 0;
            }
            
            onStep(currentStep, fullContent);
          }
        } catch {
          // Partial JSON, put back and continue
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Parse the full content into structured result
    const result = parseAnalysisResult(fullContent);
    onComplete(result);
  } catch (error) {
    console.error('Analysis error:', error);
    onError(error instanceof Error ? error.message : 'Analysis failed');
  }
}

function parseAnalysisResult(content: string): AnalysisResult {
  // Extract each step's content
  const extractStep = (stepNum: number): string => {
    const patterns = [
      new RegExp(`STEP ${stepNum}[:\\s]*([\\s\\S]*?)(?=STEP ${stepNum + 1}|$)`, 'i'),
      new RegExp(`Step ${stepNum}[:\\s]*([\\s\\S]*?)(?=Step ${stepNum + 1}|$)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  };

  // Extract alignment score
  const scoreMatch = content.match(/ALIGNMENT_SCORE:\s*(\d+)/i) || 
                     content.match(/alignment score[:\s]*(\d+)/i) ||
                     content.match(/score[:\s]*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;

  return {
    step0: extractStep(0),
    step1: extractStep(1),
    step2: extractStep(2),
    step3: extractStep(3),
    step4: Math.min(100, Math.max(0, score)),
    step5: extractStep(5),
    fullContent: content,
  };
}
