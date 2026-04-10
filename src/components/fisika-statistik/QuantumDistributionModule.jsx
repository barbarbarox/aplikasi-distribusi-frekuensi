import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useQuantumDistribution } from '../../hooks/useQuantumDistribution';

// Tooltip kustom untuk Recharts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="quantum-tooltip">
      <div className="quantum-tooltip-title">E = {label} eV</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="quantum-tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>
            {p.value !== null ? p.value.toFixed(5) : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

function DistResultCard({ dist, result }) {
  const hasWarning = result?.warning;
  const hasError = result?.error;
  const value = result?.value;

  return (
    <motion.div
      className="dist-result-card"
      style={{ '--dist-color': dist.color, '--dist-glow': dist.colorGlow }}
      whileHover={{ y: -3, boxShadow: `0 6px 24px ${dist.colorGlow}` }}
      transition={{ duration: 0.2 }}
    >
      <div className="dist-card-header">
        <span className="dist-particle-badge">{dist.particle}</span>
        <span className="dist-name" style={{ color: dist.color }}>{dist.name}</span>
      </div>

      <div className="dist-formula-box" style={{ borderColor: dist.color + '40' }}>
        <code className="dist-formula" style={{ color: dist.color }}>{dist.formula}</code>
      </div>

      {hasError && <div className="physics-error">{result.error}</div>}
      {hasWarning && <div className="physics-warning-box">{result.warning}</div>}

      {!hasError && !hasWarning && value !== null && (
        <div className="dist-value-box">
          <div className="dist-value" style={{ color: dist.color }}>
            {value < 0.0001 ? value.toExponential(4) : value.toFixed(6)}
          </div>
          <div className="dist-value-label">f(E)</div>
        </div>
      )}

      <div className="dist-examples">
        {dist.examples.map((ex) => (
          <span key={ex} className="dist-example-tag" style={{ borderColor: dist.color + '40', color: dist.color }}>
            {ex}
          </span>
        ))}
      </div>

      <div className="dist-spin-info">
        <span>Spin: <strong>{dist.spin}</strong></span>
        <span>Pauli: <strong>{dist.pauli}</strong></span>
      </div>
    </motion.div>
  );
}

export default function QuantumDistributionModule() {
  const {
    E, setE,
    T, setT,
    mu, setMu,
    params,
    pointResults,
    chartData,
    Emin, Emax,
    distributionInfo,
    resetParams,
  } = useQuantumDistribution();

  const kT = params.valid ? (8.617333262e-5 * params.T).toFixed(5) : '—';

  return (
    <div className="physics-card">
      {/* Header */}
      <div className="card-title">
        <div className="icon rose">📊</div>
        <div>
          <span>Distribusi Kuantum</span>
          <div className="physics-badge">Maxwell-Boltzmann · Bose-Einstein · Fermi-Dirac</div>
        </div>
      </div>

      <p className="physics-desc">
        Menghitung fungsi distribusi f(E) untuk tiga statistik kuantum.
        Gunakan satuan <strong>eV</strong> untuk energi dan <strong>Kelvin</strong> untuk suhu.
        k<sub>B</sub> = 8.617 × 10⁻⁵ eV/K (konstanta Boltzmann presisi CODATA 2018).
      </p>

      {/* Input Parameters */}
      <div className="quantum-params-section">
        <div className="quantum-params-title">⚙️ Parameter Input</div>
        <div className="physics-input-grid-3">
          <div className="physics-input-group">
            <label className="physics-label">
              Energi E <span className="physics-label-hint">(eV)</span>
            </label>
            <input
              type="number"
              className="physics-input"
              placeholder="misal: 1.0"
              value={E}
              step="0.1"
              onChange={(e) => setE(e.target.value)}
              id="input-energy"
            />
          </div>
          <div className="physics-input-group">
            <label className="physics-label">
              Potensial Kimia μ <span className="physics-label-hint">(eV)</span>
            </label>
            <input
              type="number"
              className="physics-input"
              placeholder="misal: 0.5"
              value={mu}
              step="0.1"
              onChange={(e) => setMu(e.target.value)}
              id="input-mu"
            />
            <span className="physics-input-note">μ = Energi Fermi untuk FD saat T→0</span>
          </div>
          <div className="physics-input-group">
            <label className="physics-label">
              Suhu T <span className="physics-label-hint">(Kelvin)</span>
            </label>
            <input
              type="number"
              className="physics-input"
              placeholder="misal: 300"
              value={T}
              step="10"
              min="1"
              onChange={(e) => setT(e.target.value)}
              id="input-temperature"
            />
          </div>
        </div>

        {/* kT indicator */}
        {params.valid && (
          <div className="kt-indicator">
            <span className="kt-label">Energi Termal k<sub>B</sub>T =</span>
            <span className="kt-value">{kT} eV</span>
            <span className="kt-note">@ {params.T} K</span>
          </div>
        )}

        {/* Temperature Slider */}
        <div className="temp-slider-section">
          <div className="temp-slider-label">
            <span>🌡️ Geser Suhu untuk melihat perubahan kurva</span>
            <span className="temp-slider-value">{T || '—'} K</span>
          </div>
          <input
            type="range"
            className="temp-slider"
            min="10"
            max="10000"
            step="10"
            value={parseFloat(T) || 300}
            onChange={(e) => setT(e.target.value)}
            id="slider-temperature"
          />
          <div className="temp-slider-ticks">
            <span>10 K</span>
            <span>Suhu Kamar (300 K)</span>
            <span>10.000 K</span>
          </div>
        </div>

        <div className="quantum-reset-row">
          <button className="btn btn-secondary" onClick={resetParams} id="btn-reset-quantum">
            🔄 Reset Parameter
          </button>
        </div>
      </div>

      {/* Distribution Result Cards (Bento Grid) */}
      {params.valid && pointResults && (
        <div className="bento-grid-3" style={{ marginTop: '24px' }}>
          <DistResultCard dist={distributionInfo.MB} result={pointResults.MB} />
          <DistResultCard dist={distributionInfo.BE} result={pointResults.BE} />
          <DistResultCard dist={distributionInfo.FD} result={pointResults.FD} />
        </div>
      )}

      {!params.valid && (
        <div className="physics-info-banner">
          ℹ️ Masukkan nilai E, μ, dan T yang valid untuk melihat hasil distribusi.
          {params.T !== null && params.T <= 0 && (
            <span style={{ color: '#f43f5e' }}> Suhu T harus &gt; 0 K.</span>
          )}
        </div>
      )}

      {/* Recharts Distribution Graph */}
      <div className="quantum-chart-section">
        <div className="quantum-chart-title">
          📈 Grafik Perbandingan Distribusi f(E) vs E
        </div>
        <div className="quantum-chart-subtitle">
          MB dinormalisasi terhadap nilai maksimum agar sebanding. Range E: {Emin}–{Emax} eV.
        </div>

        {chartData.length > 0 ? (
          <div className="quantum-chart-wrapper">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="E"
                  label={{ value: 'Energi E (eV)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'f(E)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8', paddingTop: '12px' }}
                />

                {/* Reference line pada E = μ */}
                {params.mu !== null && (
                  <ReferenceLine
                    x={parseFloat(params.mu.toFixed(3))}
                    stroke="#64748b"
                    strokeDasharray="4 2"
                    label={{ value: 'μ', fill: '#94a3b8', fontSize: 11, position: 'top' }}
                  />
                )}

                {/* Reference line pada energi yang diinput */}
                {params.E !== null && (
                  <ReferenceLine
                    x={parseFloat(params.E.toFixed(3))}
                    stroke="rgba(255,255,255,0.2)"
                    strokeDasharray="2 2"
                    label={{ value: 'E', fill: '#cbd5e1', fontSize: 11, position: 'insideTopRight' }}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="MB_norm"
                  name="Maxwell-Boltzmann (norm.)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="BE"
                  name="Bose-Einstein"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4, fill: '#06b6d4' }}
                />
                <Line
                  type="monotone"
                  dataKey="FD"
                  name="Fermi-Dirac"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4, fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="physics-info-banner">
            ℹ️ Masukkan parameter valid untuk menampilkan grafik distribusi.
          </div>
        )}
      </div>

      {/* Physics Note */}
      <div className="physics-context-box" style={{ marginTop: '20px' }}>
        <div className="physics-context-title">📚 Catatan Fisika</div>
        <ul className="physics-note-list">
          <li>Pada <strong style={{ color: '#f59e0b' }}>suhu tinggi</strong>: ketiga distribusi konvergen ke MB (batas klasik).</li>
          <li>Pada <strong style={{ color: '#06b6d4' }}>T → 0 (Boson)</strong>: semua partikel berkondensasi ke state dasar (BEC).</li>
          <li>Pada <strong style={{ color: '#ec4899' }}>T → 0 (Fermion)</strong>: FD menjadi fungsi step Heaviside di E = μ (Energi Fermi).</li>
          <li>Garis putus-putus vertikal menunjukkan posisi <strong>μ (potensial kimia)</strong> dan <strong>E (energi input)</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
