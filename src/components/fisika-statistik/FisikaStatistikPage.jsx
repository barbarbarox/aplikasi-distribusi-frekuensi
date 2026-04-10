import { motion } from 'framer-motion';
import CombinatoricsModule from './CombinatoricsModule';
import PhaseSpaceModule from './PhaseSpaceModule';
import QuantumDistributionModule from './QuantumDistributionModule';

const pageVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.18, duration: 0.45, ease: 'easeOut' },
  }),
};

export default function FisikaStatistikPage() {
  return (
    <motion.div
      className="app-container"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sci-Fi Header */}
      <header className="app-header physics-header">
        {/* Animated grid overlay */}
        <div className="physics-grid-overlay" aria-hidden="true" />

        <div className="header-badge physics-header-badge">⚛️ Fisika Statistik</div>
        <h1 className="header-title physics-title">
          Mesin Kalkulasi Fisika Statistik
        </h1>
        <p className="header-subtitle">
          Engine presisi untuk Kombinatorial BigInt, Ruang Fasa & Ensambel,
          serta Distribusi Kuantum Maxwell-Boltzmann · Bose-Einstein · Fermi-Dirac.
        </p>

        {/* Stats row */}
        <div className="physics-header-stats">
          <div className="phys-stat">
            <span className="phys-stat-value">BigInt</span>
            <span className="phys-stat-label">Overflow Safe</span>
          </div>
          <div className="phys-stat-divider" />
          <div className="phys-stat">
            <span className="phys-stat-value">k_B</span>
            <span className="phys-stat-label">CODATA 2018</span>
          </div>
          <div className="phys-stat-divider" />
          <div className="phys-stat">
            <span className="phys-stat-value">3</span>
            <span className="phys-stat-label">Ensambel</span>
          </div>
          <div className="phys-stat-divider" />
          <div className="phys-stat">
            <span className="phys-stat-value">6N</span>
            <span className="phys-stat-label">Ruang Fasa</span>
          </div>
        </div>
      </header>

      {/* Module 1: Combinatorics */}
      <motion.section custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <CombinatoricsModule />
      </motion.section>

      {/* Module 2: Phase Space & Ensembles */}
      <motion.section custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <PhaseSpaceModule />
      </motion.section>

      {/* Module 3: Quantum Distributions */}
      <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <QuantumDistributionModule />
      </motion.section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px 20px 16px', color: '#64748b', fontSize: '0.8rem' }}>
        <p>Fisika Statistik · Mekanika Statistik Kuantum</p>
        <p style={{ marginTop: '4px', opacity: 0.7 }}>
          Built with React.js · Recharts · Framer Motion · BigInt
        </p>
      </footer>
    </motion.div>
  );
}
