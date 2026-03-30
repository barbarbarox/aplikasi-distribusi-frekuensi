import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export the results content as PDF
 * @param {string} elementId - The ID of the element to capture
 * @param {string} filename - Output filename
 */
export async function exportToPDF(elementId, filename = 'distribusi_frekuensi.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element tidak ditemukan untuk export.');
  }

  // Temporarily expand for capture
  const originalOverflow = element.style.overflow;
  element.style.overflow = 'visible';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0a0e1a',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(filename);
  } finally {
    element.style.overflow = originalOverflow;
  }
}
