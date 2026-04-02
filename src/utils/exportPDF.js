import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─────────────────────────────────────────────
   Warna & style dokumen
─────────────────────────────────────────────── */
const COLORS = {
  primary:    [37,  99, 235],   // biru
  secondary:  [100, 116, 139],  // slate
  accent:     [16,  185, 129],  // emerald
  purple:     [139,  92, 246],
  amber:      [245, 158,  11],
  dark:       [15,  23,  42],
  light:      [248, 250, 252],
  border:     [226, 232, 240],
  headerBg:   [37,  99, 235],
  rowAlt:     [241, 245, 249],
  white:      [255, 255, 255],
};

/* ─────────────────────────────────────────────
   Helper: tulis garis horizontal
─────────────────────────────────────────────── */
function drawHLine(doc, x1, x2, y, r = 200, g = 210, b = 220, lw = 0.2) {
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
}

/* ─────────────────────────────────────────────
   Helper: kotak berwarna (section header)
─────────────────────────────────────────────── */
function sectionBox(doc, y, label, emoji, [r, g, b]) {
  doc.setFillColor(r, g, b);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`${emoji}  ${label}`, 18, y + 5.5);
  return y + 12;
}

/* ─────────────────────────────────────────────
   Helper: blok teks biasa
─────────────────────────────────────────────── */
function bodyText(doc, text, x, y, maxW = 182, size = 8.5, color = COLORS.dark) {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.45) + 2;
}

/* ─────────────────────────────────────────────
   Helper: kotak keterangan / info box
─────────────────────────────────────────────── */
function infoBox(doc, lines, y, [r, g, b] = COLORS.accent) {
  const lineH = 4.5;
  const pad = 4;
  const boxH = lines.length * lineH + pad * 2;
  doc.setFillColor(r + 200 > 255 ? 240 : r + 200, g + 50 > 255 ? 249 : g + 50, b + 50 > 255 ? 245 : b + 50);
  doc.setFillColor(240, 249, 245);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, boxH, 2, 2, 'FD');
  // left border stripe
  doc.setFillColor(r, g, b);
  doc.rect(14, y, 3, boxH, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 60, 50);
  lines.forEach((ln, i) => {
    doc.text(ln, 20, y + pad + i * lineH + 2);
  });
  return y + boxH + 4;
}

/* ─────────────────────────────────────────────
   Helper: cek & tambah halaman baru
─────────────────────────────────────────────── */
function checkPage(doc, y, needed = 20) {
  if (y + needed > 280) {
    doc.addPage();
    return 16;
  }
  return y;
}

/* ─────────────────────────────────────────────
   MAIN EXPORT FUNCTION
─────────────────────────────────────────────── */
export async function exportToPDF(result, filename = 'distribusi_frekuensi.pdf') {
  if (!result) throw new Error('Data hasil kalkulasi tidak ditemukan.');

  const { steps, classes, cumulativeLess, cumulativeMore, totalFrequency } = result;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 210
  const pageW = 182; // content width (margin 14 kiri & kanan)

  /* ══════════════════════════════════════════
     HALAMAN 1 — COVER / HEADER
  ════════════════════════════════════════════ */
  // Background header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, W, 42, 'F');

  // Judul
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Laporan Distribusi Frekuensi', W / 2, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Statistika Deskriptif — Kalkulator Otomatis', W / 2, 24, { align: 'center' });

  // Meta info
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text(`Dicetak: ${dateStr}  •  n = ${steps.n} data`, W / 2, 32, { align: 'center' });

  let y = 50;

  /* ══════════════════════════════════════════
     SECTION 1 — LANGKAH PENYELESAIAN
  ════════════════════════════════════════════ */
  y = sectionBox(doc, y, 'LANGKAH PENYELESAIAN', '📐', COLORS.primary);

  // Sub-steps table
  const stepRows = [
    ['1', 'Jumlah Data (n)', `n = ${steps.n}`],
    ['2', 'Nilai Minimum', `Xmin = ${steps.min}`],
    ['3', 'Nilai Maksimum', `Xmax = ${steps.max}`],
    ['4', 'Jangkauan (R)', `R = Xmax − Xmin = ${steps.max} − ${steps.min} = ${steps.range}`],
    ['5', 'Banyaknya Kelas (Sturges)', `k = 1 + 3,3 × log₁₀(${steps.n}) = ${steps.kRaw}  →  k = ${steps.k} kelas`],
    ['6', 'Panjang Interval (i)', `i = R/k = ${steps.range}/${steps.k} = ${steps.iRaw}  →  i = ${steps.i}`],
    ['7', 'Batas Kelas Pertama', `Dimulai dari nilai terkecil: ${steps.min}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['No', 'Langkah', 'Hasil']],
    body: stepRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, textColor: COLORS.dark },
    headStyles: { fillColor: COLORS.primary, textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 65 }, 2: {} },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 8;
  y = checkPage(doc, y, 30);

  // Data terurut
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Data Terurut (Ascending):', 14, y);
  y += 5;
  const sortedStr = steps.sorted.join(', ');
  const sortedLines = doc.splitTextToSize(sortedStr, pageW);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.secondary);
  doc.text(sortedLines, 14, y);
  y += sortedLines.length * 4.5 + 10;

  /* ══════════════════════════════════════════
     SECTION 2 — TABEL DISTRIBUSI FREKUENSI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 50);
  y = sectionBox(doc, y, 'TABEL DISTRIBUSI FREKUENSI', '📊', COLORS.primary);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kelas / Interval', 'Titik Tengah (X)', 'Turus', 'Frekuensi (f)']],
    body: classes.map(c => [c.index, c.label, c.midpoint, c.tally || '-', c.frequency]),
    foot: [['', 'Jumlah', '', '', totalFrequency]],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center', textColor: COLORS.dark },
    headStyles: { fillColor: COLORS.primary, textColor: [255,255,255], fontStyle: 'bold' },
    footStyles: { fillColor: [220, 235, 255], textColor: COLORS.dark, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: { 1: { halign: 'left' } },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 5;
  y = checkPage(doc, y, 40);

  // Penjelasan tabel distribusi frekuensi
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Cara Membaca Tabel Distribusi Frekuensi:', 14, y);
  y += 5;

  const dfLines = [
    `Tabel ini diperoleh dari data mentah (n = ${steps.n}) yang dikelompokkan ke dalam ${steps.k} kelas interval`,
    `menggunakan Aturan Sturges (k = 1 + 3,3 × log n). Setiap baris mewakili satu kelas dengan panjang`,
    `interval i = ${steps.i}. Kolom "Titik Tengah" dihitung sebagai rata-rata batas bawah dan batas atas kelas,`,
    `sedangkan kolom "Frekuensi" menunjukkan banyaknya data yang jatuh di dalam kelas tersebut.`,
    `Total frekuensi seluruh kelas = n = ${totalFrequency}.`,
  ];

  y = infoBox(doc, dfLines, y, COLORS.primary);
  y += 4;

  /* ══════════════════════════════════════════
     SECTION 3 — TABEL FREKUENSI RELATIF
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 60);
  y = sectionBox(doc, y, 'TABEL FREKUENSI RELATIF', '📈', COLORS.purple);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kelas', 'Frekuensi (f)', 'Perbandingan (f/n)', 'Desimal', 'Persen (%)']],
    body: classes.map(c => [
      c.index, c.label, c.frequency,
      `${c.frequency}/${totalFrequency}`, c.relativeDecimal, `${c.relativePercent}%`,
    ]),
    foot: [['', 'Jumlah', totalFrequency, `${totalFrequency}/${totalFrequency}`, '1.0000', '100%']],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, halign: 'center', textColor: COLORS.dark },
    headStyles: { fillColor: COLORS.purple, textColor: [255,255,255], fontStyle: 'bold' },
    footStyles: { fillColor: [240, 235, 255], textColor: COLORS.dark, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: { 1: { halign: 'left' } },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 5;
  y = checkPage(doc, y, 40);

  // Penjelasan frekuensi relatif
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.purple);
  doc.text('Cara Membaca Tabel Frekuensi Relatif:', 14, y);
  y += 5;

  const frLines = [
    `Frekuensi Relatif diperoleh dengan membagi frekuensi tiap kelas (f) dengan total data (n = ${totalFrequency}).`,
    `Formula: f_relatif = f / n`,
    `Kolom "Perbandingan" = f/n dalam bentuk pecahan biasa.`,
    `Kolom "Desimal" = hasil bagi f/n (misalnya 0,2500 artinya 25% dari seluruh data).`,
    `Kolom "Persen" = (f/n) × 100%. Total persentase seluruh kelas selalu = 100%.`,
    `Tabel ini berguna untuk membandingkan proporsi setiap kelas tanpa terpengaruh ukuran sampel.`,
  ];

  y = infoBox(doc, frLines, y, COLORS.purple);
  y += 4;

  /* ══════════════════════════════════════════
     SECTION 4 — TABEL FREKUENSI KUMULATIF KURANG DARI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 60);
  y = sectionBox(doc, y, 'TABEL FREKUENSI KUMULATIF "KURANG DARI"', '📉', COLORS.accent);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Tepi Atas Kelas', 'Keterangan', 'Frekuensi Kumulatif']],
    body: cumulativeLess.map((item, i) => [i + 1, item.edge, item.label, item.cumFrequency]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center', textColor: COLORS.dark },
    headStyles: { fillColor: COLORS.accent, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: { 2: { halign: 'left' }, 3: { fontStyle: 'bold', textColor: COLORS.accent } },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 5;
  y = checkPage(doc, y, 45);

  // Penjelasan kumulatif kurang dari
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text('Cara Membaca Tabel Kumulatif "Kurang Dari":', 14, y);
  y += 5;

  const fkLessLines = [
    `Frekuensi Kumulatif "Kurang Dari" menghitung berapa banyak data yang nilainya LEBIH KECIL`,
    `dari tepi atas (batas nyata atas) kelas tersebut.`,
    `Cara membangun: fk_i = f_1 + f_2 + ... + f_i  (akumulasi dari atas ke bawah).`,
    `Baris terakhir selalu sama dengan n = ${totalFrequency} (seluruh data berada di bawah tepi atas kelas terakhir).`,
    `Digunakan untuk membangun grafik Ogive Positif dan mencari nilai persentil/median distribusi.`,
  ];

  y = infoBox(doc, fkLessLines, y, COLORS.accent);
  y += 4;

  /* ══════════════════════════════════════════
     SECTION 5 — TABEL FREKUENSI KUMULATIF LEBIH DARI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 60);
  y = sectionBox(doc, y, 'TABEL FREKUENSI KUMULATIF "LEBIH DARI"', '📉', [245, 158, 11]);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Tepi Bawah Kelas', 'Keterangan', 'Frekuensi Kumulatif']],
    body: cumulativeMore.map((item, i) => [i + 1, item.edge, item.label, item.cumFrequency]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center', textColor: COLORS.dark },
    headStyles: { fillColor: [245, 158, 11], textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: { 2: { halign: 'left' }, 3: { fontStyle: 'bold', textColor: [180, 100, 0] } },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 5;
  y = checkPage(doc, y, 45);

  // Penjelasan kumulatif lebih dari
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 100, 0);
  doc.text('Cara Membaca Tabel Kumulatif "Lebih Dari":', 14, y);
  y += 5;

  const fkMoreLines = [
    `Frekuensi Kumulatif "Lebih Dari" menghitung berapa banyak data yang nilainya LEBIH BESAR ATAU SAMA`,
    `dengan tepi bawah (batas nyata bawah) kelas tersebut.`,
    `Cara membangun: dimulai dari n = ${totalFrequency} pada kelas pertama, lalu dikurangi f tiap kelas secara berurutan.`,
    `Baris pertama selalu = n = ${totalFrequency} (semua data ≥ tepi bawah kelas pertama).`,
    `Digunakan untuk membangun grafik Ogive Negatif. Perpotongan Ogive Positif & Negatif = estimasi Median.`,
  ];

  y = infoBox(doc, fkMoreLines, y, [245, 158, 11]);
  y += 4;

  /* ══════════════════════════════════════════
     SECTION 6 — DETAIL KELAS (Tepi & Titik Tengah)
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 60);
  y = sectionBox(doc, y, 'DETAIL KELAS (TEPI & TITIK TENGAH)', '🔢', COLORS.secondary);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Interval', 'Tepi Bawah', 'Tepi Atas', 'Titik Tengah (X)', 'Frekuensi (f)']],
    body: classes.map(c => [c.index, c.label, c.lowerEdge, c.upperEdge, c.midpoint, c.frequency]),
    foot: [['', 'Jumlah', '', '', '', totalFrequency]],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, halign: 'center', textColor: COLORS.dark },
    headStyles: { fillColor: COLORS.secondary, textColor: [255,255,255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.rowAlt, textColor: COLORS.dark, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: { 1: { halign: 'left' } },
    tableLineColor: COLORS.border,
    tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 5;
  y = checkPage(doc, y, 25);

  const detailLines = [
    `Tepi Bawah (Batas Nyata Bawah) = Batas Bawah − 0,5`,
    `Tepi Atas  (Batas Nyata Atas)  = Batas Atas  + 0,5`,
    `Titik Tengah = (Batas Bawah + Batas Atas) / 2 = (BB + BA) / 2`,
  ];
  y = infoBox(doc, detailLines, y, COLORS.secondary);

  /* ══════════════════════════════════════════
     FOOTER setiap halaman
  ════════════════════════════════════════════ */
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawHLine(doc, 14, W - 14, 287, 180, 190, 200, 0.3);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 170, 185);
    doc.text('Kalkulator Distribusi Frekuensi Pintar  •  Statistika Deskriptif', 14, 292);
    doc.text(`Halaman ${p} / ${totalPages}`, W - 14, 292, { align: 'right' });
  }

  doc.save(filename);
}
