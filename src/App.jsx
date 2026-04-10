import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataInput from './components/DataInput';
import StepByStep from './components/StepByStep';
import FrequencyTables from './components/FrequencyTables';
import Charts from './components/Charts';
import FisikaStatistikPage from './components/fisika-statistik/FisikaStatistikPage';
import { calculateFrequencyDistribution } from './utils/calculations';
import { exportToPDF } from './utils/exportPDF';

const NAV_TABS = [
  { id: 'statistik', label: 'Distribusi Frekuensi', emoji: '📊' },
  { id: 'fisika', label: 'Fisika Statistik', emoji: '⚛️' },
];

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.22, ease: 'easeIn' } },
};

function Toast({ message, type, onClose }) {
  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{message}</span>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('statistik');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDataReady = useCallback((data) => {
    setIsProcessing(true);
    setResult(null);
    setTimeout(() => {
      try {
        const res = calculateFrequencyDistribution(data);
        setResult(res);
        showToast(`Berhasil memproses ${data.length} data!`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsProcessing(false);
      }
    }, 300);
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    showToast('Sedang membuat PDF...', 'info');
    try {
      await exportToPDF(result, 'distribusi_frekuensi.pdf');
      showToast('PDF berhasil diunduh!', 'success');
    } catch (err) {
      showToast('Gagal export PDF: ' + err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    showToast('Data telah direset.', 'info');
  };

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <nav className="app-nav" role="navigation" aria-label="Modul navigasi">
        <div className="app-nav-inner">
          <div className="app-nav-brand">
            <span className="app-nav-logo">🔬</span>
            <span className="app-nav-title">StatPhys Lab</span>
          </div>
          <div className="app-nav-tabs" role="tablist">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                role="tab"
                aria-selected={activePage === tab.id}
                className={`app-nav-tab ${activePage === tab.id ? 'active' : ''}`}
                onClick={() => setActivePage(tab.id)}
              >
                <span className="app-nav-tab-emoji">{tab.emoji}</span>
                <span className="app-nav-tab-label">{tab.label}</span>
                {activePage === tab.id && (
                  <motion.div
                    className="app-nav-tab-indicator"
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <AnimatePresence mode="wait">
        {activePage === 'statistik' && (
          <motion.div key="statistik" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div className="app-container">
              {/* Header */}
              <header className="app-header">
                <div className="header-badge">⚡ Statistika Deskriptif</div>
                <h1 className="header-title">Kalkulator Distribusi Frekuensi Pintar</h1>
                <p className="header-subtitle">
                  Selesaikan soal statistika deskriptif secara otomatis — lengkap dengan langkah penyelesaian, tabel distribusi, dan grafik interaktif.
                </p>
              </header>

              <DataInput onDataReady={handleDataReady} isProcessing={isProcessing} />

              {isProcessing && (
                <div className="card">
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <span className="loading-text">Memproses data dan menghitung distribusi frekuensi...</span>
                  </div>
                </div>
              )}

              {result && !isProcessing && (
                <div id="results-content" className="fade-in">
                  <StepByStep result={result} />
                  <div className="results-grid">
                    <div className="full-width"><FrequencyTables result={result} /></div>
                    <div className="full-width"><Charts result={result} /></div>
                  </div>
                  <div className="export-section">
                    <button
                      className="btn btn-success"
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      id="btn-export-pdf"
                    >
                      {isExporting ? (
                        <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>Membuat PDF...</>
                      ) : (
                        <>📥 Download Jawaban (PDF)</>
                      )}
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset} id="btn-reset">
                      🔄 Reset & Input Baru
                    </button>
                  </div>
                </div>
              )}

              <footer style={{ textAlign: 'center', padding: '32px 20px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                <p>Kalkulator Distribusi Frekuensi Pintar &copy; {new Date().getFullYear()}</p>
                <p style={{ marginTop: '4px', opacity: 0.7 }}>Built with React.js • Chart.js • Tesseract.js</p>
              </footer>
            </div>
          </motion.div>
        )}

        {activePage === 'fisika' && (
          <motion.div key="fisika" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <FisikaStatistikPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
