import { useState } from 'react';

export default function FrequencyTables({ result }) {
  if (!result) return null;

  const [activeTable, setActiveTable] = useState('basic');
  const [kumulTab, setKumulTab] = useState('less');

  const { classes, cumulativeLess, cumulativeMore, totalFrequency } = result;

  const tables = [
    { id: 'basic', label: '📊 Distribusi Frekuensi' },
    { id: 'relative', label: '📈 Frekuensi Relatif' },
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

      {/* 1. Basic Frequency Table */}
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
        </div>
      )}

      {/* 2. Relative Frequency Table */}
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
        </div>
      )}

      {/* 3. Cumulative Frequency Table */}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
