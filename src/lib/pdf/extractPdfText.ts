export async function extractPdfText(file: File): Promise<string> {
  // ⛔ Dynamic import (prevents Vite prebundling)
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

  // ⛔ Disable worker completely
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = "";
  (pdfjsLib as any).disableWorker = true;

  const buffer = await file.arrayBuffer();

  const pdf = await (pdfjsLib as any).getDocument({
    data: buffer,
    disableWorker: true,
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }

  return text.trim();
}
