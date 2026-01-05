export async function extractPdfText(file: File): Promise<string> {
  // ✅ dynamic import → prevents Vite prebundle
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf");

  const buffer = await file.arrayBuffer();

  const pdf = await (pdfjs as any).getDocument({
    data: buffer,
    disableWorker: true, // ✅ correct place
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    text += con
