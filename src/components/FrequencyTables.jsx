import { useState } from 'react';

/* ─── Komponen Penjelasan Tabel ─── */
function TableExplanation({ children, color = 'blue' }) {
  const colorMap = {
    blue:   { bg: 'rgba(59,130,246,0.06)',   border: 'rgba(59,130,246,0.2)',   stripe: 'var(--accent-blue)',   title: 'var(--accent-blue)' },
    purple: { bg: 'rgba(139,92,246,0.06)',   border: 'rgba(139,92,246,0.2)',   stripe: 'var(--accent-purple)', title: 'var(--accent-purple)' },
    emerald:{ bg: 'rgba(16,185,129,0.06)',   border: 'rgba(16,185,129,0.2)',   stripe: 'var(--accent-emerald)',title: 'var(--accent-emerald)' },
    amber:  { bg: 'rgba(245,158,11,0.06)',   border: 'rgba(245,158,11,0.2)',   stripe: 'var(--accent-amber)',  title: 'var(--accent-amber)' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div style={{
      marginTop: '16px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '10px',
      padding: '16px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '3px', background: c.stripe, borderRadius: '10px 0 0 10px',
      }} />
      <div style={{ paddingLeft: '8px' }}>
        {children}
      </div>
    </div>
  );
}

function ExplainTitle({ icon, label, color }) {
  const colorVar = {
    blue: 'var(--accent-blue)', purple: 'var(--accent-purple)',
    emerald: 'var(--accent-emerald)', amber: 'var(--accent-amber)',
  }[color] || 'var(--accent-blue)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: colorVar }}>{label}</span>
    </div>
  );
}

function ExplainList({ items }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>▸</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}

function ExplainNote({ children }) {
  return (
    <div style={{
      marginTop: '10px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '6px',
      padding: '9px 13px',
      fontSize: '0.79rem',
      color: 'var(--text-muted)',
      lineHeight: 1.65,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────── */

export default function FrequencyTables({ result }) {
  if (!result) return null;

  const [activeTable, setActiveTable] = useState('basic');
  const [kumulTab, setKumulTab] = useState('less');

  const { classes, cumulativeLess, cumulativeMore, totalFrequency, steps } = result;

  const tables = [
    { id: 'basic',      label: '📊 Distribusi Frekuensi' },
    { id: 'relative',   label: '📈 Frekuensi Relatif' },
    { id: 'cumulative', label: '📉 Frekuensi Kumulatif' },
  ];

  return (
    <div className="card fade-in">
      <h2 className="card-title">
        <span className="icon emerald">📋</span>
        Tabel Distribusi Frekuensi
      </h2>

      {/* Table Tabs */}
      <div className="table-tabs">
        {tables.map((t) => (
          <button
            key={t.id}
            className={`table-tab ${activeTable === t.id ? 'active' : ''}`}
            onClick={() => setActiveTable(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 1. Distribusi Frekuensi ── */}
      {activeTable === 'basic' && (
        <div className="fade-in">
          <div className="table-wrapper">
            <table className="data-table" id="table-basic-freq">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kelas / Interval</th>
                  <th>Titik Tengah (X)</th>
                  <th>Turus / Tally</th>
                  <th>Frekuensi (f)</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.index}>
                    <td>{cls.index}</td>
                    <td style={{ fontWeight: 500, color: '#f1f5f9' }}>{cls.label}</td>
                    <td>{cls.midpoint}</td>
                    <td className="tally">{cls.tally}</td>
                    <td style={{ fontWeight: 600, color: '#3b82f6' }}>{cls.frequency}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>Jumlah</td>
                  <td>{totalFrequency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Penjelasan */}
          <TableExplanation color="blue">
            <ExplainTitle icon="📖" label="Darimana tabel ini berasal?" color="blue" />
            <ExplainList items={[
              `Tabel ini dibentuk dengan mengelompokkan <strong>${totalFrequency} data</strong> ke dalam <strong>${steps.k} kelas</strong> menggunakan <strong>Aturan Sturges</strong>: k = 1 + 3,3 × log₁₀(n) = 1 + 3,3 × log₁₀(${steps.n}) ≈ ${steps.kRaw} → k = ${steps.k}.`,
              `Panjang interval setiap kelas: <strong>i = R / k = ${steps.range} / ${steps.k} = ${steps.iRaw}</strong>, dibulatkan ke atas menjadi <strong>i = ${steps.i}</strong>.`,
              `<strong>Titik Tengah (X)</strong> setiap kelas = (Batas Bawah + Batas Atas) / 2, digunakan sebagai representasi nilai data dalam kelas tersebut.`,
              `<strong>Turus (Tally)</strong> adalah pencatatan manual frekuensi dengan simbol batang — setiap 5 data dikelompokkan.`,
              `<strong>Frekuensi (f)</strong> = banyaknya data yang masuk ke dalam interval kelas tersebut. Total f = n = ${totalFrequency}.`,
            ]} />
            <ExplainNote>
              💡 <strong>Fungsi:</strong> Tabel distribusi frekuensi memudahkan pembacaan data berkelompok, melihat pola sebaran, serta menjadi dasar untuk membuat Histogram dan Poligon Frekuensi.
            </ExplainNote>
          </TableExplanation>
        </div>
      )}

      {/* ── 2. Frekuensi Relatif ── */}
      {activeTable === 'relative' && (
        <div className="fade-in">
          <div className="table-wrapper">
            <table className="data-table" id="table-relative-freq">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kelas</th>
                  <th>Frekuensi (f)</th>
                  <th>Relatif (f/n)</th>
                  <th>Desimal</th>
                  <th>Persen (%)</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.index}>
                    <td>{cls.index}</td>
                    <td style={{ fontWeight: 500, color: '#f1f5f9' }}>{cls.label}</td>
                    <td>{cls.frequency}</td>
                    <td style={{ color: '#f59e0b' }}>{cls.relativeRatio}</td>
                    <td>{cls.relativeDecimal}</td>
                    <td style={{ fontWeight: 600, color: '#8b5cf6' }}>{cls.relativePercent}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Jumlah</td>
                  <td>{totalFrequency}</td>
                  <td>{totalFrequency}/{totalFrequency}</td>
                  <td>1.0000</td>
                  <td>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Penjelasan */}
          <TableExplanation color="purple">
            <ExplainTitle icon="📖" label="Darimana tabel ini berasal?" color="purple" />
            <ExplainList items={[
              `Frekuensi Relatif diturunkan dari tabel distribusi frekuensi biasa. Setiap frekuensi kelas (f) dibagi dengan total data n = ${totalFrequency}.`,
              `<strong>Rumus:</strong> f_relatif = f / n &nbsp;→&nbsp; misalnya kelas pertama: ${classes[0].frequency} / ${totalFrequency} = ${classes[0].relativeDecimal} = ${classes[0].relativePercent}%.`,
              `Kolom <strong>"Relatif (f/n)"</strong> menyajikan hasilnya sebagai pecahan biasa agar hubungan dengan data asli terlihat jelas.`,
              `Kolom <strong>"Desimal"</strong> = pembagian f/n yang dibulatkan 4 angka di belakang koma.`,
              `Kolom <strong>"Persen (%)"</strong> = desimal × 100. Total persen seluruh kelas selalu = <strong>100%</strong>.`,
            ]} />
            <ExplainNote>
              💡 <strong>Fungsi:</strong> Frekuensi Relatif berguna untuk membandingkan proporsi antar kelas atau antar dataset yang berbeda ukuran sampelnya — karena sudah dinormalisasi ke skala 0–1 (atau 0%–100%).
            </ExplainNote>
          </TableExplanation>
        </div>
      )}

      {/* ── 3. Frekuensi Kumulatif ── */}
      {activeTable === 'cumulative' && (
        <div className="fade-in">
          <div className="kumul-tabs">
            <button
              className={`kumul-tab ${kumulTab === 'less' ? 'active' : ''}`}
              onClick={() => setKumulTab('less')}
            >
              📈 Kumulatif &quot;Kurang Dari&quot;
            </button>
            <button
              className={`kumul-tab ${kumulTab === 'more' ? 'active' : ''}`}
              onClick={() => setKumulTab('more')}
            >
              📉 Kumulatif &quot;Lebih Dari&quot;
            </button>
          </div>

          {kumulTab === 'less' && (
            <div className="fade-in">
              <div className="table-wrapper">
                <table className="data-table" id="table-cumul-less">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tepi Atas (Batas Nyata Atas)</th>
                      <th>Keterangan</th>
                      <th>Frekuensi Kumulatif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cumulativeLess.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 500, color: '#f1f5f9' }}>{item.edge}</td>
                        <td style={{ color: '#94a3b8' }}>{item.label}</td>
                        <td style={{ fontWeight: 600, color: '#10b981' }}>{item.cumFrequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Penjelasan Kumulatif Kurang Dari */}
              <TableExplanation color="emerald">
                <ExplainTitle icon="📖" label="Darimana tabel ini berasal?" color="emerald" />
                <ExplainList items={[
                  `Tabel ini dibangun dari tabel distribusi frekuensi dengan cara <strong>menjumlahkan frekuensi secara berurutan dari atas ke bawah</strong>.`,
                  `<strong>fk_i = f₁ + f₂ + ... + fᵢ</strong> (akumulasi frekuensi dari kelas pertama hingga kelas ke-i).`,
                  `Kolom pertama menggunakan <strong>Tepi Atas (Batas Nyata Atas)</strong> = Batas Atas + 0,5, bukan batas kelas biasa.`,
                  `Baris pertama: data yang nilainya &lt; ${cumulativeLess[0]?.edge} sebanyak <strong>${cumulativeLess[0]?.cumFrequency}</strong> data.`,
                  `Baris terakhir: seluruh data (= n = ${totalFrequency}) nilainya &lt; ${cumulativeLess[cumulativeLess.length-1]?.edge} (tepi atas kelas terakhir).`,
                ]} />
                <ExplainNote>
                  💡 <strong>Fungsi:</strong> Digunakan untuk membuat <strong>Ogive Positif</strong> (kurva "kurang dari") dan menentukan nilai persentil, quartil, serta median distribusi frekuensi berkelompok.
                </ExplainNote>
              </TableExplanation>
            </div>
          )}

          {kumulTab === 'more' && (
            <div className="fade-in">
              <div className="table-wrapper">
                <table className="data-table" id="table-cumul-more">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tepi Bawah (Batas Nyata Bawah)</th>
                      <th>Keterangan</th>
                      <th>Frekuensi Kumulatif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cumulativeMore.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 500, color: '#f1f5f9' }}>{item.edge}</td>
                        <td style={{ color: '#94a3b8' }}>{item.label}</td>
                        <td style={{ fontWeight: 600, color: '#f59e0b' }}>{item.cumFrequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Penjelasan Kumulatif Lebih Dari */}
              <TableExplanation color="amber">
                <ExplainTitle icon="📖" label="Darimana tabel ini berasal?" color="amber" />
                <ExplainList items={[
                  `Berbeda arah dengan kumulatif "kurang dari" — tabel ini dibangun dengan <strong>mengurangi frekuensi secara berurutan dari atas ke bawah</strong>.`,
                  `<strong>fk_i = n − (f₁ + f₂ + ... + fᵢ₋₁)</strong>, dimulai dari n = ${totalFrequency} pada kelas pertama.`,
                  `Kolom pertama menggunakan <strong>Tepi Bawah (Batas Nyata Bawah)</strong> = Batas Bawah − 0,5.`,
                  `Baris pertama: semua data (= n = ${totalFrequency}) nilainya ≥ ${cumulativeMore[0]?.edge} (tepi bawah kelas pertama).`,
                  `Baris terakhir: data yang nilainya ≥ ${cumulativeMore[cumulativeMore.length-1]?.edge} sebanyak <strong>${cumulativeMore[cumulativeMore.length-1]?.cumFrequency}</strong> data.`,
                ]} />
                <ExplainNote>
                  💡 <strong>Fungsi:</strong> Digunakan untuk membuat <strong>Ogive Negatif</strong> (kurva "lebih dari"). Titik perpotongan Ogive Positif dan Ogive Negatif adalah estimasi nilai <strong>Median</strong> distribusi frekuensi.
                </ExplainNote>
              </TableExplanation>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
