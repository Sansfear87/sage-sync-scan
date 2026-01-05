import * as pdfjsLib from "pdfjs-dist";

// ✅ Pin to a CDNJS-available worker version
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    text += content.items
      .map((item: any) => item.str)
      .join(" ") + "\n";
  }

  return text.trim();
}
