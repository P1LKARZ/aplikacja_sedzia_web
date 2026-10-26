// generatePdf.js
import { jsPDF } from "jspdf";
import tinosFont from "../fonts/tinos/TinosRegular.js";

export function generatePDF(formData) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.addFileToVFS("Tinos-Regular.ttf", tinosFont);
  doc.addFont("Tinos-Regular.ttf", "Tinos", "normal");
  doc.setFont("Tinos");

  const img = new window.Image();
  img.src = "./image/delegacja.png";

  img.onload = () => {
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

      doc.save(fileName);
    } catch (error) {
      console.error("Błąd przy generowaniu PDF:", error);
      alert("⚠️ Błąd przy generowaniu PDF!");
    }
  };

  img.onerror = () => {
    alert("⚠️ Błąd ładowania obrazu delegacja.png");
  };
}
