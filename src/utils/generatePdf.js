// generatePdf.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import tinosFont from "../fonts/tinos/TinosRegular.js";

// Inicjalizacja IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PDFDatabase", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pdfs")) {
        db.createObjectStore("pdfs", { keyPath: "fileName" });
      }
    };
  });
};

// Zapisywanie PDF do IndexedDB
const savePDFToIndexedDB = async (fileName, pdfBlob) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(["pdfs"], "readwrite");
    const store = transaction.objectStore("pdfs");

    await store.put({
      fileName: fileName,
      blob: pdfBlob,
      timestamp: new Date().getTime(),
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Błąd IndexedDB:", error);
    return false;
  }
};

export function generatePDF(formData, setGeneratedFiles) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.addFileToVFS("Tinos-Regular.ttf", tinosFont);
  doc.addFont("Tinos-Regular.ttf", "Tinos", "normal");
  doc.setFont("Tinos");

  const img = new window.Image();
  img.src = "./image/delegacja.png";

  img.onload = async () => {
    try {
      doc.addImage(img, "PNG", 0, 0, 297, 210);
      doc.setFontSize(12);

      const druzyny_pdf = `${formData.gospodarze} - ${formData.goscie}`;

      doc.text(String(formData.liga), 58, 57);
      doc.text(druzyny_pdf, 30, 68);
      doc.text(String(formData.miejsce), 42, 75);
      doc.text(String(formData.data), 35, 81);
      doc.text(String(formData.godz), 80, 81);
      doc.text(String(formData.ekwiwalentBrutto), 115, 99);
      doc.text(String(formData.koszty), 115, 107);
      doc.text(String(formData.podstawa), 115, 114);
      doc.text(String(formData.podatek), 115, 121);
      doc.text(String(formData.ekwiwalentNetto), 115, 129);
      doc.text(String(formData.odbiorkwoty), 45, 155);
      doc.text(String(formData.slownie), 24, 163);
      doc.text(String(formData.data), 20, 175);
      doc.text(String(formData.data), 166, 178);

      const fileName =
        formData.gospodarze && formData.goscie
          ? `ekwiwalent_${formData.gospodarze.replace(/\s+/g, "_")}_${formData.goscie.replace(/\s+/g, "_")}.pdf`
          : "ekwiwalent.pdf";

      // Pobieranie PDF jako Blob
      const pdfBlob = doc.output("blob");

      // Zapisywanie do IndexedDB
      await savePDFToIndexedDB(fileName, pdfBlob);

      // Zapisywanie do dysku
      doc.save(fileName);

      // Aktualizacja listy plików w localStorage (tylko nazwy, nie Bloba)
      setGeneratedFiles((prevFiles) => {
        const updatedFiles = [fileName, ...prevFiles];
        if (updatedFiles.length > 10) updatedFiles.pop();
        localStorage.setItem("generatedFiles", JSON.stringify(updatedFiles));
        return updatedFiles;
      });

      console.log(`✅ PDF "${fileName}" został zapisany do IndexedDB`);
    } catch (error) {
      console.error("Błąd przy generowaniu PDF:", error);
      alert("⚠️ Błąd przy generowaniu PDF!");
    }
  };

  img.onerror = () => {
    alert("⚠️ Błąd ładowania obrazu delegacja.png");
  };
}
