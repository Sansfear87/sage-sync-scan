import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAGE_SYSTEM_PROMPT = `You are S.A.G.E — Structured Autonomous Generation & Evaluation.

You are an autonomous document analysis agent. Your goal is to analyze documents and detect alignment or discrepancies.

You MUST follow this EXACT 6-step process and output format:

====================
STEP 0: OCR & TEXT NORMALIZATION
====================
- Clean the extracted text from each document
- Remove noise or broken formatting
- Fix incomplete sentences if possible
- Preserve original meaning
- Label each as "Document 1 – Extracted Text", etc.

====================
STEP 1: DOCUMENT SUMMARIZATION
====================
- Summarize each document independently
- Use 2–3 bullet points per document
- Focus on: Key claims, Decisions, Policies, Intent
- Ignore filler or stylistic language

====================
STEP 2: CROSS-DOCUMENT COMPARISON
====================
- Compare all document summaries together
- Identify: Common claims, Differing interpretations, Conflicting statements

====================
STEP 3: DISCREPANCY DETECTION
====================
- Detect inconsistencies, contradictions, or misalignments
- For each discrepancy: Mention which documents are involved and explain why they conflict

====================
STEP 4: ALIGNMENT SCORING
====================
- Assign a single alignment score between 0 and 100
- Score interpretation:
  - 90–100 → Highly aligned
  - 60–89 → Mostly aligned with minor inconsistencies
  - 30–59 → Partially aligned with significant discrepancies
  - 0–29 → Highly contradictory
- Output ONLY the number on a single line like: ALIGNMENT_SCORE: 78

====================
STEP 5: ALIGNMENT EXPLANATION
====================
- Explain why this alignment score was assigned
- Keep the explanation simple, logical, and non-technical

====================
OUTPUT FORMAT (STRICT)
====================
- Clearly label each step as: STEP 0, STEP 1, STEP 2, STEP 3, STEP 4, STEP 5
- Use bullet points and clear headings
- Be concise, structured, and analytical
- Do not skip any step
- For STEP 4, include the score in this exact format: ALIGNMENT_SCORE: [number]`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documents } = await req.json();

    if (!documents || documents.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 documents are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format documents for the prompt
    const documentsText = documents.map((doc: { name: string; content: string }, i: number) => 
      `=== DOCUMENT ${i + 1}: ${doc.name} ===\n${doc.content}`
    ).join('\n\n');

    const userPrompt = `Analyze the following ${documents.length} documents for alignment and discrepancies:\n\n${documentsText}`;

    console.log(`Analyzing ${documents.length} documents...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SAGE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Streaming analysis response...');
    
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in analyze-documents:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
