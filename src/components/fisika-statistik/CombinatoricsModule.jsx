import { motion } from 'framer-motion';
import { useCombinatorics } from '../../hooks/useCombinatorics';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

function ResultCard({ label, formula, value, error, color, emoji, index }) {
  return (
    <motion.div
      className="combo-result-card"
      style={{ '--card-accent': color }}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="combo-card-header">
        <span className="combo-card-emoji">{emoji}</span>
        <span className="combo-card-label">{label}</span>
      </div>
      {formula && <div className="combo-card-formula">{formula}</div>}
      {error ? (
        <div className="physics-error">{error}</div>
      ) : value !== null ? (
        <div className="combo-card-value" style={{ color }}>
          {value}
        </div>
      ) : (
        <div className="combo-card-placeholder">—</div>
      )}
    </motion.div>
  );
}

export default function CombinatoricsModule() {
  const {
    n, setN,
    r, setR,
    inputError,
    rMissing,
    permFormatted, combFormatted, cyclicFormatted,
    permFormula, combFormula, cyclicFormula,
    permError, combError, cyclicError,
  } = useCombinatorics();

  const nNum = parseInt(n, 10);

  return (
    <div className="physics-card">
      {/* Header */}
      <div className="card-title">
        <div className="icon purple">🧮</div>
        <div>
          <span>Kombinatorial &amp; Probabilitas Fisis</span>
          <div className="physics-badge">BigInt Safe · Presisi Tinggi</div>
        </div>
      </div>

      <p className="physics-desc">
        Menghitung permutasi, kombinasi, dan permutasi siklis menggunakan{' '}
        <code>BigInt</code> — aman untuk N sangat besar (misal: N ~ 10²³ partikel Avogadro) tanpa overflow.
      </p>

      {/* Inputs */}
      <div className="physics-input-grid">
        <div className="physics-input-group">
          <label className="physics-label">
            N <span className="physics-label-hint">(total objek/partikel)</span>
          </label>
          <input
            type="number"
            className="physics-input"
            placeholder="misal: 20"
            value={n}
            min="0"
            max="100000"
            onChange={(e) => setN(e.target.value)}
            id="input-n-combinatorics"
          />
        </div>
        <div className="physics-input-group">
          <label className="physics-label">
            R <span className="physics-label-hint">(objek dipilih/disusun)</span>
          </label>
          <input
            type="number"
            className="physics-input"
            placeholder="misal: 3"
            value={r}
            min="0"
            onChange={(e) => setR(e.target.value)}
            id="input-r-combinatorics"
          />
          <span className="physics-input-note">Opsional untuk Permutasi Siklis</span>
        </div>
      </div>

      {inputError && <div className="physics-error">{inputError}</div>}

      {/* Results Grid */}
      {!inputError && n !== '' && (
        <div className="bento-grid-3">
          {/* Permutation */}
          <ResultCard
            label="Permutasi P(n,r)"
            formula={rMissing ? 'Masukkan nilai R' : permFormula}
            value={rMissing ? null : permFormatted}
            error={permError}
            color="#8b5cf6"
            emoji="🔀"
            index={0}
          />

          {/* Combination */}
          <ResultCard
            label="Kombinasi C(n,r)"
            formula={rMissing ? 'Masukkan nilai R' : combFormula}
            value={rMissing ? null : combFormatted}
            error={combError}
            color="#06b6d4"
            emoji="🎲"
            index={1}
          />

          {/* Cyclic Permutation */}
          <ResultCard
            label="Permutasi Siklis"
            formula={!isNaN(nNum) && nNum >= 0 ? cyclicFormula : ''}
            value={cyclicFormatted}
            error={cyclicError}
            color="#10b981"
            emoji="⭕"
            index={2}
          />
        </div>
      )}

      {/* Physics Context */}
      <div className="physics-context-box">
        <div className="physics-context-title">🔬 Konteks Fisika</div>
        <div className="physics-context-grid">
          <div>
            <strong style={{ color: '#8b5cf6' }}>Permutasi</strong>
            <p>Cara menyusun elektron dalam orbital atom (urutan penting).</p>
          </div>
          <div>
            <strong style={{ color: '#06b6d4' }}>Kombinasi</strong>
            <p>Memilih mikrostate dalam ensambel mikrokanonik.</p>
          </div>
          <div>
            <strong style={{ color: '#10b981' }}>Permutasi Siklis</strong>
            <p>Susunan atom dalam molekul cincin benzena (C₆H₆), kisi kristal sirkular.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
