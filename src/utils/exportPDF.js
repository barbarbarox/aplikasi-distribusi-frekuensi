import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ═══════════════════════════════════════════════════
   COLORS
═══════════════════════════════════════════════════ */
const C = {
  primary:  [37,  99, 235],
  secondary:[100, 116, 139],
  accent:   [16,  185, 129],
  purple:   [139,  92, 246],
  amber:    [245, 158,  11],
  dark:     [15,  23,  42],
  rowAlt:   [241, 245, 252],
  border:   [226, 232, 240],
  white:    [255, 255, 255],
};

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function sectionBox(doc, y, label, [r, g, b]) {
  doc.setFillColor(r, g, b);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(label, 18, y + 5.5);
  return y + 12;
}

function infoBox(doc, lines, y, [r, g, b] = C.accent) {
  const lineH = 4.5;
  const pad   = 4;
  const boxH  = lines.length * lineH + pad * 2;
  // light tinted bg
  doc.setFillColor(
    Math.min(255, r + 210),
    Math.min(255, g + 55),
    Math.min(255, b + 55)
  );
  doc.setFillColor(245, 249, 255);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, boxH, 2, 2, 'FD');
  doc.setFillColor(r, g, b);
  doc.rect(14, y, 3, boxH, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 50, 80);
  lines.forEach((ln, i) => doc.text(ln, 20, y + pad + i * lineH + 2));
  return y + boxH + 4;
}

function checkPage(doc, y, needed = 20) {
  if (y + needed > 278) { doc.addPage(); return 16; }
  return y;
}

function drawHLine(doc, x1, x2, y) {
  doc.setDrawColor(200, 210, 225);
  doc.setLineWidth(0.25);
  doc.line(x1, y, x2, y);
}

/* ═══════════════════════════════════════════════════
   RENDER CHART → BASE64 IMAGE
   Menggunakan offscreen Canvas + Chart.js native
═══════════════════════════════════════════════════ */
function renderChartToBase64(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width  = 900;
    canvas.height = 420;

    // Background putih
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chart = new ChartJS(canvas, config);

    // Tunggu animasi selesai (atau force stop)
    chart.update('none');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const img = canvas.toDataURL('image/png');
        chart.destroy();
        canvas.remove();
        resolve(img);
      });
    });
  });
}

/* ─── Histogram ─── */
async function buildHistogramImage(classes) {
  const labels = classes.map(c => `${c.lowerEdge}-${c.upperEdge}`);
  const data   = classes.map(c => c.frequency);

  return renderChartToBase64({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frekuensi',
        data,
        backgroundColor: 'rgba(37,99,235,0.75)',
        borderColor:     'rgba(37,99,235,1)',
        borderWidth: 1,
        borderRadius: 0,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      }],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Histogram Distribusi Frekuensi',
          color: '#1e293b',
          font: { size: 15, weight: '700', family: 'Arial' },
          padding: { bottom: 16 },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Tepi Kelas (Batas Nyata)', color: '#475569', font: { size: 11 } },
          ticks: { color: '#64748b' },
          grid:  { color: 'rgba(0,0,0,0.06)' },
        },
        y: {
          title: { display: true, text: 'Frekuensi (f)', color: '#475569', font: { size: 11 } },
          ticks: { color: '#64748b', stepSize: 1 },
          grid:  { color: 'rgba(0,0,0,0.06)' },
          beginAtZero: true,
        },
      },
    },
  });
}

/* ─── Poligon Frekuensi ─── */
async function buildPolygonImage(classes, interval) {
  const midpoints   = classes.map(c => c.midpoint);
  const frequencies = classes.map(c => c.frequency);
  const startMid    = midpoints[0] - interval;
  const endMid      = midpoints[midpoints.length - 1] + interval;
  const allMids     = [startMid, ...midpoints, endMid];
  const allFreqs    = [0, ...frequencies, 0];

  return renderChartToBase64({
    type: 'line',
    data: {
      labels: allMids.map(String),
      datasets: [{
        label: 'Frekuensi',
        data: allFreqs,
        borderColor:          'rgba(109,40,217,1)',
        backgroundColor:      'rgba(109,40,217,0.12)',
        pointBackgroundColor: 'rgba(109,40,217,1)',
        pointBorderColor:     '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.2,
        fill: true,
      }],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Poligon Frekuensi',
          color: '#1e293b',
          font: { size: 15, weight: '700', family: 'Arial' },
          padding: { bottom: 16 },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Titik Tengah (Mid Point)', color: '#475569', font: { size: 11 } },
          ticks: { color: '#64748b' },
          grid:  { color: 'rgba(0,0,0,0.06)' },
        },
        y: {
          title: { display: true, text: 'Frekuensi (f)', color: '#475569', font: { size: 11 } },
          ticks: { color: '#64748b', stepSize: 1 },
          grid:  { color: 'rgba(0,0,0,0.06)' },
          beginAtZero: true,
        },
      },
    },
  });
}

/* ─── Ogive ─── */
async function buildOgiveImage(classes, cumulativeLess, cumulativeMore, totalFrequency) {
  const firstLower = classes[0].lowerEdge;
  const lastUpper  = classes[classes.length - 1].upperEdge;

  const posLabels = [String(firstLower), ...cumulativeLess.map(i => String(i.edge))];
  const posValues = [0, ...cumulativeLess.map(i => i.cumFrequency)];

  const negLabels = [...cumulativeMore.map(i => String(i.edge)), String(lastUpper)];
  const negValues = [...cumulativeMore.map(i => i.cumFrequency), 0];

  const allSet = new Set([...posLabels, ...negLabels]);
  const allLabels = Array.from(allSet).map(Number).sort((a,b)=>a-b).map(String);

  const posMap = {}; posLabels.forEach((l,i) => posMap[l] = posValues[i]);
  const negMap = {}; negLabels.forEach((l,i) => negMap[l] = negValues[i]);

  return renderChartToBase64({
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [
        {
          label: 'Ogive Positif (Kurang Dari)',
          data: allLabels.map(l => posMap[l] !== undefined ? posMap[l] : null),
          borderColor:          'rgba(5,150,105,1)',
          backgroundColor:      'rgba(5,150,105,0.08)',
          pointBackgroundColor: 'rgba(5,150,105,1)',
          pointBorderColor:     '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.3,
          spanGaps: true,
          fill: true,
        },
        {
          label: 'Ogive Negatif (Lebih Dari)',
          data: allLabels.map(l => negMap[l] !== undefined ? negMap[l] : null),
          borderColor:          'rgba(217,119,6,1)',
          backgroundColor:      'rgba(217,119,6,0.08)',
          pointBackgroundColor: 'rgba(217,119,6,1)',
          pointBorderColor:     '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.3,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#334155', font: { size: 11 }, usePointStyle: true },
        },
        title: {
          display: true,
          text: 'Ogive (Kurva Frekuensi Kumulatif)',
          color: '#1e293b',
          font: { size: 15, weight: '700', family: 'Arial' },
          padding: { bottom: 16 },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Tepi Kelas (Batas Nyata)', color: '#475569', font: { size: 11 } },
          ticks: { color: '#64748b' },
          grid:  { color: 'rgba(0,0,0,0.06)' },
        },
        y: {
          title: { display: true, text: 'Frekuensi Kumulatif', color: '#475569', font: { size: 11 } },
          ticks: { color: '#64748b', stepSize: Math.max(1, Math.floor(totalFrequency / 5)) },
          grid:  { color: 'rgba(0,0,0,0.06)' },
          beginAtZero: true,
        },
      },
    },
  });
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export async function exportToPDF(result, filename = 'distribusi_frekuensi.pdf') {
  if (!result) throw new Error('Data hasil kalkulasi tidak ditemukan.');

  const { steps, classes, cumulativeLess, cumulativeMore, totalFrequency } = result;

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = doc.internal.pageSize.getWidth();

  /* ───── Render semua chart dulu (async) ───── */
  const [histImg, polyImg, ogiveImg] = await Promise.all([
    buildHistogramImage(classes),
    buildPolygonImage(classes, steps.i),
    buildOgiveImage(classes, cumulativeLess, cumulativeMore, totalFrequency),
  ]);

  /* ══════════════════════════════════════════
     HEADER COVER
  ════════════════════════════════════════════ */
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, W, 42, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Laporan Distribusi Frekuensi', W / 2, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Statistika Deskriptif — Kalkulator Otomatis', W / 2, 24, { align: 'center' });
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text(`Dicetak: ${dateStr}  •  n = ${steps.n} data`, W / 2, 32, { align: 'center' });

  let y = 50;

  /* ══════════════════════════════════════════
     SECTION 1 — LANGKAH PENYELESAIAN
  ════════════════════════════════════════════ */
  y = sectionBox(doc, y, '📐  LANGKAH PENYELESAIAN', C.primary);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Langkah', 'Hasil']],
    body: [
      ['1', 'Jumlah Data (n)',           `n = ${steps.n}`],
      ['2', 'Nilai Minimum & Maksimum',  `Xmin = ${steps.min},  Xmax = ${steps.max}`],
      ['3', 'Jangkauan (R)',             `R = ${steps.max} − ${steps.min} = ${steps.range}`],
      ['4', 'Banyaknya Kelas (Sturges)', `k = 1 + 3,3 × log₁₀(${steps.n}) = ${steps.kRaw}  →  k = ${steps.k} kelas`],
      ['5', 'Panjang Interval (i)',      `i = ${steps.range}/${steps.k} = ${steps.iRaw}  →  i = ${steps.i}`],
    ],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, textColor: C.dark },
    headStyles: { fillColor: C.primary, textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 65 } },
    tableLineColor: C.border, tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 5;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text('Data Terurut:', 14, y); y += 4;
  const sortedLines = doc.splitTextToSize(steps.sorted.join(', '), 182);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.secondary);
  doc.setFontSize(7.5);
  doc.text(sortedLines, 14, y);
  y += sortedLines.length * 4 + 10;

  /* ══════════════════════════════════════════
     SECTION 2 — TABEL DISTRIBUSI FREKUENSI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 55);
  y = sectionBox(doc, y, '📊  TABEL DISTRIBUSI FREKUENSI', C.primary);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kelas / Interval', 'Titik Tengah (X)', 'Turus', 'Frekuensi (f)']],
    body: classes.map(c => [c.index, c.label, c.midpoint, c.tally || '-', c.frequency]),
    foot: [['', 'Jumlah', '', '', totalFrequency]],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center', textColor: C.dark },
    headStyles: { fillColor: C.primary, textColor: [255,255,255], fontStyle: 'bold' },
    footStyles: { fillColor: [220, 235, 255], textColor: C.dark, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: { 1: { halign: 'left' } },
    tableLineColor: C.border, tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 4;
  y = infoBox(doc, [
    `Dibangun dari ${steps.n} data menggunakan Aturan Sturges: k = ${steps.k} kelas, interval i = ${steps.i}.`,
    'Titik Tengah (X) = (Batas Bawah + Batas Atas) / 2 — mewakili nilai data dalam setiap kelas.',
    `Total frekuensi seluruh kelas = n = ${totalFrequency}.`,
  ], y, C.primary);

  /* ══════════════════════════════════════════
     SECTION 3 — FREKUENSI RELATIF
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 60);
  y = sectionBox(doc, y, '📈  TABEL FREKUENSI RELATIF', C.purple);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kelas', 'Frekuensi (f)', 'f / n', 'Desimal', 'Persen (%)']],
    body: classes.map(c => [c.index, c.label, c.frequency, `${c.frequency}/${totalFrequency}`, c.relativeDecimal, `${c.relativePercent}%`]),
    foot: [['', 'Jumlah', totalFrequency, `${totalFrequency}/${totalFrequency}`, '1.0000', '100%']],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, halign: 'center', textColor: C.dark },
    headStyles: { fillColor: C.purple, textColor: [255,255,255], fontStyle: 'bold' },
    footStyles: { fillColor: [240, 235, 255], textColor: C.dark, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: { 1: { halign: 'left' } },
    tableLineColor: C.border, tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 4;
  y = infoBox(doc, [
    `Rumus: f_relatif = f / n = f / ${totalFrequency} — hasil dibagi total data, nilai antara 0 dan 1.`,
    'Kolom "Persen (%)" = desimal × 100. Total persentase seluruh kelas selalu = 100%.',
    'Berguna membandingkan proporsi kelas tanpa terpengaruh ukuran sampel.',
  ], y, C.purple);

  /* ══════════════════════════════════════════
     SECTION 4 — KUMULATIF KURANG DARI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 55);
  y = sectionBox(doc, y, '📉  TABEL FREKUENSI KUMULATIF "KURANG DARI"', C.accent);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Tepi Atas Kelas', 'Keterangan', 'Frekuensi Kumulatif']],
    body: cumulativeLess.map((item, i) => [i + 1, item.edge, item.label, item.cumFrequency]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center', textColor: C.dark },
    headStyles: { fillColor: C.accent, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: { 2: { halign: 'left' }, 3: { fontStyle: 'bold', textColor: C.accent } },
    tableLineColor: C.border, tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 4;
  y = infoBox(doc, [
    'Dibangun dengan menjumlahkan frekuensi berurutan dari atas ke bawah: fk_i = f₁ + f₂ + … + fᵢ.',
    `Baris terakhir = n = ${totalFrequency} (semua data berada di bawah tepi atas kelas terakhir).`,
    'Digunakan untuk membangun Ogive Positif dan menentukan persentil/median.',
  ], y, C.accent);

  /* ══════════════════════════════════════════
     SECTION 5 — KUMULATIF LEBIH DARI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, 55);
  y = sectionBox(doc, y, '📉  TABEL FREKUENSI KUMULATIF "LEBIH DARI"', C.amber);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Tepi Bawah Kelas', 'Keterangan', 'Frekuensi Kumulatif']],
    body: cumulativeMore.map((item, i) => [i + 1, item.edge, item.label, item.cumFrequency]),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3.5, halign: 'center', textColor: C.dark },
    headStyles: { fillColor: C.amber, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: C.rowAlt },
    columnStyles: { 2: { halign: 'left' }, 3: { fontStyle: 'bold', textColor: [160, 90, 0] } },
    tableLineColor: C.border, tableLineWidth: 0.1,
  });

  y = doc.lastAutoTable.finalY + 4;
  y = infoBox(doc, [
    `Dimulai dari n = ${totalFrequency}, dikurangi frekuensi setiap kelas secara berurutan ke bawah.`,
    'Baris pertama selalu = n (semua data ≥ tepi bawah kelas pertama).',
    'Digunakan untuk Ogive Negatif. Perpotongan dua Ogive = estimasi Median distribusi.',
  ], y, C.amber);

  /* ══════════════════════════════════════════
     SECTION 6 — HISTOGRAM
  ════════════════════════════════════════════ */
  doc.addPage();
  y = 16;
  y = sectionBox(doc, y, '📊  HISTOGRAM DISTRIBUSI FREKUENSI', C.primary);

  const chartW = 182;
  const chartH = Math.round(chartW * 420 / 900); // maintain aspect
  doc.addImage(histImg, 'PNG', 14, y, chartW, chartH);
  y += chartH + 5;

  y = infoBox(doc, [
    'Histogram adalah diagram batang yang batangnya saling bersentuhan (tidak ada jarak).',
    'Sumbu-x: Tepi Kelas (Batas Nyata) — Sumbu-y: Frekuensi (f) setiap kelas.',
    'Luas setiap batang sebanding dengan frekuensi kelas tersebut.',
    'Cocok untuk melihat bentuk distribusi data: simetri, menceng kanan/kiri (skewed), dsb.',
  ], y, C.primary);

  /* ══════════════════════════════════════════
     SECTION 7 — POLIGON FREKUENSI
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, chartH + 40);
  y = sectionBox(doc, y, '📈  POLIGON FREKUENSI', C.purple);

  doc.addImage(polyImg, 'PNG', 14, y, chartW, chartH);
  y += chartH + 5;

  y = infoBox(doc, [
    'Segmen garis terhubung ke titik tepat di atas Titik Tengah (midpoint) setiap kelas.',
    'Garis diperluas ke kiri dan kanan dengan frekuensi = 0 agar kurva menyentuh sumbu-x.',
    'Sumbu-x: Titik Tengah Kelas — Sumbu-y: Frekuensi (f).',
    'Luas area di bawah Poligon = luas total Histogram (merepresentasikan total data yang sama).',
  ], y, C.purple);

  /* ══════════════════════════════════════════
     SECTION 8 — OGIVE
  ════════════════════════════════════════════ */
  y = checkPage(doc, y, chartH + 50);
  y = sectionBox(doc, y, '📉  OGIVE (KURVA FREKUENSI KUMULATIF)', C.accent);

  doc.addImage(ogiveImg, 'PNG', 14, y, chartW, chartH);
  y += chartH + 5;

  // Tentukan perkiraan median (titik perpotongan ogive)
  const midIdx      = Math.floor(cumulativeLess.length / 2);
  const examplePt   = cumulativeLess[midIdx] || cumulativeLess[cumulativeLess.length - 1];

  y = infoBox(doc, [
    'Ogive Positif (Kurang Dari): kurva naik — menunjukkan jumlah data < tepi atas kelas.',
    'Ogive Negatif (Lebih Dari): kurva turun — menunjukkan jumlah data ≥ tepi bawah kelas.',
    `Contoh baca: terdapat ${examplePt.cumFrequency} data yang nilainya kurang dari ${examplePt.edge}.`,
    'Perpotongan Ogive Positif dan Negatif = estimasi nilai Median distribusi frekuensi.',
  ], y, C.accent);

  /* ══════════════════════════════════════════
     FOOTER SETIAP HALAMAN
  ════════════════════════════════════════════ */
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawHLine(doc, 14, W - 14, 287);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 170, 185);
    doc.text('Kalkulator Distribusi Frekuensi Pintar  •  Statistika Deskriptif', 14, 292);
    doc.text(`Halaman ${p} / ${totalPages}`, W - 14, 292, { align: 'right' });
  }

  doc.save(filename);
}
