export default function StepByStep({ result }) {
  if (!result) return null;

  const { steps } = result;

  return (
    <div className="card fade-in">
      <h2 className="card-title">
        <span className="icon purple">📐</span>
        Langkah Penyelesaian
      </h2>

      <div className="step-container">
        {/* Step 1: Sorted Data */}
        <div className="step-item">
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-label">Urutkan Data (Ascending)</div>
            <div className="step-detail">
              Jumlah data: <strong>n = {steps.n}</strong>
            </div>
            <div className="sorted-data-display" style={{ marginTop: '8px' }}>
              {steps.sorted.join(', ')}
            </div>
          </div>
        </div>

        {/* Step 2: Range */}
        <div className="step-item">
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-label">Jangkauan (Range / R)</div>
            <div className="step-formula">
              R = X<sub>max</sub> − X<sub>min</sub> = {steps.max} − {steps.min}
            </div>
            <div className="step-result">R = {steps.range}</div>
          </div>
        </div>

        {/* Step 3: Number of Classes */}
        <div className="step-item">
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-label">Banyaknya Kelas (k) — Aturan Sturges</div>
            <div className="step-formula">
              k = 1 + 3,3 × log₁₀(n) = 1 + 3,3 × log₁₀({steps.n})
            </div>
            <div className="step-formula">
              k = 1 + 3,3 × {Math.log10(steps.n).toFixed(4)} = {steps.kRaw}
            </div>
            <div className="step-result">k = ⌈{steps.kRaw}⌉ = {steps.k} kelas</div>
          </div>
        </div>

        {/* Step 4: Class Interval */}
        <div className="step-item">
          <div className="step-number">4</div>
          <div className="step-content">
            <div className="step-label">Panjang Interval Kelas (i)</div>
            <div className="step-formula">
              i = R / k = {steps.range} / {steps.k} = {steps.iRaw}
            </div>
            <div className="step-result">i = ⌈{steps.iRaw}⌉ = {steps.i}</div>
          </div>
        </div>

        {/* Step 5: Class Determination */}
        <div className="step-item">
          <div className="step-number">5</div>
          <div className="step-content">
            <div className="step-label">Penentuan Kelas</div>
            <div className="step-detail">
              Batas bawah kelas pertama dimulai dari data terkecil: <strong>{steps.min}</strong>
            </div>
            <div className="step-detail">
              Setiap kelas memiliki panjang interval: <strong>{steps.i}</strong>
            </div>
            <div style={{ marginTop: '10px' }}>
              {result.classes.map((cls) => (
                <div
                  key={cls.index}
                  style={{
                    display: 'inline-block',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    margin: '3px',
                    fontSize: '0.82rem',
                    color: '#94a3b8',
                  }}
                >
                  Kelas {cls.index}: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{cls.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 6: Detail per Class */}
        <div className="step-item">
          <div className="step-number">6</div>
          <div className="step-content">
            <div className="step-label">Perhitungan Detail per Kelas</div>
            <div className="step-detail" style={{ marginBottom: '8px' }}>
              Tepi Bawah = Batas Bawah − 0,5 &nbsp;|&nbsp; Tepi Atas = Batas Atas + 0,5 &nbsp;|&nbsp; Titik Tengah = (BB + BA) / 2
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Interval</th>
                    <th>Tepi Bawah</th>
                    <th>Tepi Atas</th>
                    <th>Titik Tengah (X)</th>
                    <th>Frekuensi (f)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.classes.map((cls) => (
                    <tr key={cls.index}>
                      <td>{cls.index}</td>
                      <td style={{ fontWeight: 500, color: '#f1f5f9' }}>{cls.label}</td>
                      <td>{cls.lowerEdge}</td>
                      <td>{cls.upperEdge}</td>
                      <td>{cls.midpoint}</td>
                      <td style={{ fontWeight: 600, color: '#3b82f6' }}>{cls.frequency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5}>Jumlah</td>
                    <td>{result.totalFrequency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
