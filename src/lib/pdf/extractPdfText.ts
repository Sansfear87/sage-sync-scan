export async function extractPdfText(file: File): Promise<string> {
  // ✅ dynamic import prevents Vite prebundle
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf");

  // ✅ disable worker completely
  (pdfjs as any).GlobalWorkerOptions.workerSrc = "";
  (pdfjs as any).disableWorker = true;

  const buffer = await file.arrayBuffer();

  const pdf = await (pdfjs as any).getDocument({
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


