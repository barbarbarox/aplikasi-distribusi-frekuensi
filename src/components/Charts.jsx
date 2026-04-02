import { useState, useMemo } from 'react';
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
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_TABS = [
  { id: 'histogram', label: '📊 Histogram' },
  { id: 'polygon', label: '📈 Poligon Frekuensi' },
  { id: 'ogive', label: '📉 Ogive' },
];

/* ─── Penjelasan per grafik ─── */
function HistogramInfo() {
  return (
    <div className="chart-info-box chart-info-blue">
      <div className="chart-info-header">
        <span className="chart-info-icon">📊</span>
        <span className="chart-info-title">Apa itu Histogram?</span>
      </div>
      <p className="chart-info-body">
        Histogram adalah diagram batang yang digunakan untuk menyajikan distribusi frekuensi data
        berkelompok. Berbeda dengan diagram batang biasa, pada histogram <strong>batang-batang
        saling bersentuhan</strong> (tidak ada jarak) karena setiap batang mewakili satu kelas/interval
        yang berurutan dan kontinu.
      </p>
      <ul className="chart-info-list">
        <li>Sumbu horizontal (<em>x</em>) mewakili <strong>tepi kelas</strong> (batas nyata kelas)</li>
        <li>Sumbu vertikal (<em>y</em>) mewakili <strong>frekuensi</strong> setiap kelas</li>
        <li>Luas setiap batang sebanding dengan frekuensi kelas tersebut</li>
        <li>Cocok untuk melihat bentuk distribusi data (simetri, menceng kanan/kiri, dll.)</li>
      </ul>
    </div>
  );
}

function PolygonInfo() {
  return (
    <div className="chart-info-box chart-info-purple">
      <div className="chart-info-header">
        <span className="chart-info-icon">📈</span>
        <span className="chart-info-title">Apa itu Poligon Frekuensi?</span>
      </div>
      <p className="chart-info-body">
        <strong>Poligon Frekuensi</strong> menggunakan segmen garis yang terhubung ke titik-titik yang
        terletak tepat di atas <strong>nilai titik tengah kelas</strong>. Ketinggian dari titik-titik
        tersebut sesuai dengan frekuensi kelas masing-masing, dan segmen garis <strong>diperluas ke
        kanan dan ke kiri</strong> sehingga grafik dimulai dan berakhir pada sumbu horizontal
        (frekuensi = 0).
      </p>
      <ul className="chart-info-list">
        <li>Sumbu horizontal (<em>x</em>) mewakili <strong>titik tengah kelas</strong> (midpoint)</li>
        <li>Sumbu vertikal (<em>y</em>) mewakili <strong>frekuensi</strong> setiap kelas</li>
        <li>Titik tambahan di kiri dan kanan dengan frekuensi 0 memastikan grafik "tertutup" ke sumbu-x</li>
        <li>Berguna untuk membandingkan dua atau lebih distribusi data dalam satu grafik</li>
      </ul>
      <div className="chart-info-note">
        💡 <strong>Catatan:</strong> Luas area di bawah Poligon Frekuensi sama dengan luas
        keseluruhan Histogram — keduanya merepresentasikan total frekuensi data yang sama.
      </div>
    </div>
  );
}

function OgiveInfo({ result }) {
  const { cumulativeLess, classes } = result;

  // Cari contoh pembacaan: nilai kumulatif mendekati 68% dari total, atau gunakan data nyata
  const totalFreq = result.totalFrequency;
  // Ambil titik tengah dari daftar kumulatif kurang dari sebagai contoh pembacaan
  const midIdx = Math.floor(cumulativeLess.length / 2);
  const examplePoint = cumulativeLess[midIdx] || cumulativeLess[cumulativeLess.length - 1];

  return (
    <div className="chart-info-box chart-info-emerald">
      <div className="chart-info-header">
        <span className="chart-info-icon">📉</span>
        <span className="chart-info-title">Apa itu Ogive?</span>
      </div>
      <p className="chart-info-body">
        <strong>Ogive</strong> adalah grafik garis yang menggambarkan <strong>frekuensi
        kumulatif</strong>, seperti daftar distribusi frekuensi kumulatif. Batas-batas kelas
        dihubungkan oleh segmen garis yang dimulai dari <strong>batas bawah kelas pertama</strong> dan
        berakhir pada <strong>batas atas kelas terakhir</strong>. Ogive berguna untuk menentukan
        jumlah nilai di bawah nilai tertentu.
      </p>
      <ul className="chart-info-list">
        <li>
          <strong>Ogive Positif (Kurang Dari):</strong> menghitung berapa banyak data yang
          bernilai <em>kurang dari</em> tepi atas kelas — kurva naik dari kiri ke kanan
        </li>
        <li>
          <strong>Ogive Negatif (Lebih Dari):</strong> menghitung berapa banyak data yang
          bernilai <em>lebih dari atau sama dengan</em> tepi bawah kelas — kurva turun dari kiri ke kanan
        </li>
        <li>Perpotongan kedua kurva menunjukkan estimasi <strong>nilai median</strong> distribusi</li>
      </ul>

      {/* Contoh pembacaan dinamis berdasarkan data nyata */}
      <div className="chart-info-example">
        <div className="chart-info-example-header">
          <span>📖</span> Contoh Pembacaan Ogive dari Data Ini
        </div>
        <p>
          Berdasarkan Ogive Positif (Kurang Dari), terdapat{' '}
          <strong className="highlight-val">{examplePoint.cumFrequency} data</strong> yang
          memiliki nilai <strong>kurang dari {examplePoint.edge}</strong>.
          {examplePoint.cumFrequency === totalFreq && (
            <span> (seluruh data berada di bawah batas atas kelas terakhir)</span>
          )}
        </p>
        <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Lihat pada grafik di atas: posisi <strong>{examplePoint.edge}</strong> pada sumbu-x
          berkorespondensi dengan frekuensi kumulatif{' '}
          <strong>{examplePoint.cumFrequency}</strong> pada sumbu-y.
        </p>
      </div>

      <div className="chart-info-note">
        💡 <strong>Tips:</strong> Arahkan kursor ke titik pada grafik untuk melihat nilai frekuensi
        kumulatif secara tepat pada setiap batas kelas.
      </div>
    </div>
  );
}

export default function Charts({ result }) {
  const [activeChart, setActiveChart] = useState('histogram');

  if (!result) return null;

  const { classes, cumulativeLess, cumulativeMore, totalFrequency } = result;

  // ===== HISTOGRAM =====
  const histogramData = useMemo(() => {
    const edgeLabels = classes.map(
      (cls) => `${cls.lowerEdge} - ${cls.upperEdge}`
    );
    return {
      labels: edgeLabels,
      datasets: [
        {
          label: 'Frekuensi',
          data: classes.map((cls) => cls.frequency),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 0,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
      ],
    };
  }, [classes]);

  const histogramOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Histogram Distribusi Frekuensi',
          color: '#f1f5f9',
          font: { size: 16, weight: '600', family: 'Inter' },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(26, 31, 53, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            title: (items) => `Tepi Kelas: ${items[0].label}`,
            label: (item) => `Frekuensi: ${item.raw}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tepi Kelas (Batas Nyata)',
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
          },
          ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          title: {
            display: true,
            text: 'Frekuensi (f)',
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
          },
          ticks: {
            color: '#64748b',
            font: { size: 11, family: 'Inter' },
            stepSize: 1,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  // ===== POLYGON =====
  const polygonData = useMemo(() => {
    // Add zero-frequency endpoints
    const midpoints = classes.map((cls) => cls.midpoint);
    const frequencies = classes.map((cls) => cls.frequency);
    const interval = result.steps.i;

    const startMid = midpoints[0] - interval;
    const endMid = midpoints[midpoints.length - 1] + interval;

    const allMids = [startMid, ...midpoints, endMid];
    const allFreqs = [0, ...frequencies, 0];

    return {
      labels: allMids.map(String),
      datasets: [
        {
          label: 'Frekuensi',
          data: allFreqs,
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          pointBackgroundColor: 'rgba(139, 92, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.2,
          fill: true,
        },
      ],
    };
  }, [classes, result.steps.i]);

  const polygonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Poligon Frekuensi',
          color: '#f1f5f9',
          font: { size: 16, weight: '600', family: 'Inter' },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(26, 31, 53, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(139,92,246,0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            title: (items) => `Titik Tengah: ${items[0].label}`,
            label: (item) => `Frekuensi: ${item.raw}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Titik Tengah (Mid Point)',
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
          },
          ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          title: {
            display: true,
            text: 'Frekuensi (f)',
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
          },
          ticks: {
            color: '#64748b',
            font: { size: 11, family: 'Inter' },
            stepSize: 1,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  // ===== OGIVE =====
  const ogiveData = useMemo(() => {
    // Ogive Positif (Kurang Dari)
    const lessLabels = cumulativeLess.map((item) => String(item.edge));
    const lessValues = cumulativeLess.map((item) => item.cumFrequency);
    // Prepend starting point at first lower edge with 0
    const firstLowerEdge = classes[0].lowerEdge;
    const posLabels = [String(firstLowerEdge), ...lessLabels];
    const posValues = [0, ...lessValues];

    // Ogive Negatif (Lebih Dari)
    const moreLabels = cumulativeMore.map((item) => String(item.edge));
    const moreValues = cumulativeMore.map((item) => item.cumFrequency);
    // Append ending point at last upper edge with 0
    const lastUpperEdge = classes[classes.length - 1].upperEdge;
    const negLabels = [...moreLabels, String(lastUpperEdge)];
    const negValues = [...moreValues, 0];

    // Combine unique labels
    const allLabelsSet = new Set([...posLabels, ...negLabels]);
    const allLabels = Array.from(allLabelsSet)
      .map(Number)
      .sort((a, b) => a - b)
      .map(String);

    // Map values to aligned labels
    const posMap = {};
    posLabels.forEach((l, i) => (posMap[l] = posValues[i]));
    const negMap = {};
    negLabels.forEach((l, i) => (negMap[l] = negValues[i]));

    return {
      labels: allLabels,
      datasets: [
        {
          label: 'Ogive Positif (Kurang Dari)',
          data: allLabels.map((l) => (posMap[l] !== undefined ? posMap[l] : null)),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.3,
          spanGaps: true,
        },
        {
          label: 'Ogive Negatif (Lebih Dari)',
          data: allLabels.map((l) => (negMap[l] !== undefined ? negMap[l] : null)),
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          pointBackgroundColor: 'rgba(245, 158, 11, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.3,
          spanGaps: true,
        },
      ],
    };
  }, [classes, cumulativeLess, cumulativeMore]);

  const ogiveOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
          },
        },
        title: {
          display: true,
          text: 'Ogive (Kurva Frekuensi Kumulatif)',
          color: '#f1f5f9',
          font: { size: 16, weight: '600', family: 'Inter' },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(26, 31, 53, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(16,185,129,0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tepi Kelas (Batas Nyata)',
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
          },
          ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          title: {
            display: true,
            text: 'Frekuensi Kumulatif',
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
          },
          ticks: {
            color: '#64748b',
            font: { size: 11, family: 'Inter' },
            stepSize: Math.max(1, Math.floor(totalFrequency / 5)),
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true,
        },
      },
    }),
    [totalFrequency]
  );

  return (
    <div className="card fade-in">
      <h2 className="card-title">
        <span className="icon amber">📊</span>
        Visualisasi Data
      </h2>

      {/* Chart Tabs */}
      <div className="chart-tabs">
        {CHART_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`chart-tab ${activeChart === tab.id ? 'active' : ''}`}
            onClick={() => setActiveChart(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div className="chart-container">
        {activeChart === 'histogram' && (
          <Bar data={histogramData} options={histogramOptions} />
        )}
        {activeChart === 'polygon' && (
          <Line data={polygonData} options={polygonOptions} />
        )}
        {activeChart === 'ogive' && (
          <Line data={ogiveData} options={ogiveOptions} />
        )}
      </div>

      {/* Penjelasan per Grafik */}
      <div className="chart-explanation fade-in" key={activeChart}>
        {activeChart === 'histogram' && <HistogramInfo />}
        {activeChart === 'polygon' && <PolygonInfo />}
        {activeChart === 'ogive' && <OgiveInfo result={result} />}
      </div>
    </div>
  );
}
