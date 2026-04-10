import { useState } from 'react';
import { motion } from 'framer-motion';

const ENSEMBLE_DATA = [
  {
    id: 'microcanonical',
    name: 'Mikrokanonik',
    subtitle: 'Sistem Terisolasi',
    emoji: '🔒',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.2)',
    fixed: ['N (Jumlah Partikel)', 'E (Energi)', 'V (Volume)'],
    exchange: [],
    description:
      'Sistem benar-benar terisolasi dari lingkungan. Tidak ada pertukaran energi maupun materi. Semua mikrostate yang memiliki energi sama memiliki probabilitas yang identik (postulat probabilitas sama).',
    quantity: 'Ω(E, V, N)',
    quantityDesc: 'Jumlah mikrostate (degeneracy)',
    entropy: 'S = k_B · ln Ω',
    example: 'Gas dalam wadah terinsulasi sempurna',
  },
  {
    id: 'canonical',
    name: 'Kanonik',
    subtitle: 'Sistem Tertutup',
    emoji: '🌡️',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.2)',
    fixed: ['N (Jumlah Partikel)', 'V (Volume)', 'T (Suhu via reservoar)'],
    exchange: ['Energi (kontak termal dengan bath)'],
    description:
      'Sistem dapat bertukar energi dengan reservoir termal pada suhu T. Jumlah partikel tetap (sistem tertutup). Distribusi energi mengikuti faktor Boltzmann e^(-βE).',
    quantity: 'Z = Σ e^(-βE)',
    quantityDesc: 'Fungsi Partisi (Partition Function)',
    entropy: 'F = -k_B T · ln Z',
    example: 'Protein dalam larutan fisiologis pada suhu tubuh',
  },
  {
    id: 'grandcanonical',
    name: 'Grand Kanonik',
    subtitle: 'Sistem Terbuka',
    emoji: '🌊',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.2)',
    fixed: ['V (Volume)', 'T (Suhu)', 'μ (Potensial Kimia)'],
    exchange: ['Energi (E)', 'Partikel (N)'],
    description:
      'Sistem dapat bertukar baik energi maupun partikel dengan reservoir. Jumlah partikel N fluktuatif. Digunakan untuk mendeskripsikan boson dan fermion dengan distribusi BE dan FD.',
    quantity: 'Ξ = Σ e^(-β(E-μN))',
    quantityDesc: 'Grand Canonical Partition Function',
    entropy: 'Ω = -k_B T · ln Ξ',
    example: 'Elektron konduksi dalam logam, gas foton dalam rongga',
  },
];

export default function PhaseSpaceModule() {
  const [N, setN] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  const nVal = parseInt(N, 10);
  const phaseDim = !isNaN(nVal) && nVal > 0 ? 6 * nVal : null;

  return (
    <div className="physics-card">
      {/* Header */}
      <div className="card-title">
        <div className="icon cyan">⚛️</div>
        <div>
          <span>Ruang Fasa &amp; Ensambel</span>
          <div className="physics-badge">Phase Space · Statistical Ensemble</div>
        </div>
      </div>

      {/* Phase Space Calculator */}
      <div className="phase-space-calculator">
        <div className="phase-space-header">
          <span className="phase-space-title">Kalkulator Dimensi Ruang Fasa</span>
          <span className="phase-space-hint">Dim = 6N (3 posisi + 3 momentum per partikel)</span>
        </div>

        <div className="phase-space-input-row">
          <div className="physics-input-group" style={{ flex: 1 }}>
            <label className="physics-label">N (Jumlah Partikel)</label>
            <input
              type="number"
              className="physics-input"
              placeholder="misal: 100"
              value={N}
              min="1"
              onChange={(e) => setN(e.target.value)}
              id="input-n-phasespace"
            />
          </div>
          <div className="phase-space-arrow">→</div>
          <div className="phase-space-result-box">
            <div className="phase-space-result-label">Dimensi Ruang Fasa</div>
            {phaseDim !== null ? (
              <motion.div
                key={phaseDim}
                className="phase-space-result-value"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {phaseDim.toLocaleString('id-ID')}
              </motion.div>
            ) : (
              <div className="phase-space-result-placeholder">6N = ?</div>
            )}
            <div className="phase-space-result-sub">
              {phaseDim !== null ? `= 6 × ${nVal.toLocaleString('id-ID')}` : '3 posisi (q) + 3 momentum (p) per partikel'}
            </div>
          </div>
        </div>

        {phaseDim !== null && (
          <div className="phase-axis-display">
            <span>Koordinat: </span>
            {['x','y','z'].map(c => (
              <span key={`q${c}`} className="axis-badge axis-pos">q<sub>{c}</sub></span>
            ))}
            {['x','y','z'].map(c => (
              <span key={`p${c}`} className="axis-badge axis-mom">p<sub>{c}</sub></span>
            ))}
            <span className="axis-per"> per partikel × {nVal.toLocaleString('id-ID')} partikel</span>
          </div>
        )}
      </div>

      {/* Ensemble Cards */}
      <div className="ensemble-section-title">Tiga Jenis Ensambel Statistik</div>
      <div className="bento-grid-3">
        {ENSEMBLE_DATA.map((ens) => (
          <motion.div
            key={ens.id}
            className={`ensemble-card ${expandedCard === ens.id ? 'expanded' : ''}`}
            style={{ '--ens-color': ens.color, '--ens-glow': ens.glow }}
            whileHover={{ y: -4, boxShadow: `0 8px 30px ${ens.glow}` }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpandedCard(expandedCard === ens.id ? null : ens.id)}
          >
            <div className="ens-card-top">
              <span className="ens-emoji">{ens.emoji}</span>
              <div>
                <div className="ens-name" style={{ color: ens.color }}>{ens.name}</div>
                <div className="ens-subtitle">{ens.subtitle}</div>
              </div>
              <span className="ens-expand-icon">{expandedCard === ens.id ? '▲' : '▼'}</span>
            </div>

            <div className="ens-fixed-list">
              {ens.fixed.map(f => (
                <span key={f} className="ens-tag ens-tag-fixed">✓ {f}</span>
              ))}
              {ens.exchange.map(e => (
                <span key={e} className="ens-tag ens-tag-exchange">⇄ {e}</span>
              ))}
            </div>

            {expandedCard === ens.id && (
              <motion.div
                className="ens-expanded-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="ens-description">{ens.description}</p>
                <div className="ens-math-box" style={{ borderColor: ens.color }}>
                  <div className="ens-math-formula">{ens.quantity}</div>
                  <div className="ens-math-desc">{ens.quantityDesc}</div>
                </div>
                <div className="ens-entropy">
                  <span>Potensial Termodinamika:</span>
                  <code>{ens.entropy}</code>
                </div>
                <div className="ens-example">
                  <span>📌 Contoh:</span> {ens.example}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
