import { useState, useCallback } from 'react';
import DataInput from './components/DataInput';
import StepByStep from './components/StepByStep';
import FrequencyTables from './components/FrequencyTables';
import Charts from './components/Charts';
import { calculateFrequencyDistribution } from './utils/calculations';
import { exportToPDF } from './utils/exportPDF';

function Toast({ message, type, onClose }) {
  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{message}</span>
    </div>
  );
}

export default function App() {
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

    // Use setTimeout to allow UI to update with loading state
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
      await exportToPDF('results-content', 'distribusi_frekuensi.pdf');
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
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-badge">⚡ Statistika Deskriptif</div>
        <h1 className="header-title">Kalkulator Distribusi Frekuensi Pintar</h1>
        <p className="header-subtitle">
          Selesaikan soal statistika deskriptif secara otomatis — lengkap dengan langkah penyelesaian, tabel distribusi, dan grafik interaktif.
        </p>
      </header>

      {/* Data Input */}
      <DataInput onDataReady={handleDataReady} isProcessing={isProcessing} />

      {/* Loading State */}
      {isProcessing && (
        <div className="card">
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span className="loading-text">Memproses data dan menghitung distribusi frekuensi...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <div id="results-content" className="fade-in">
          {/* Step by Step */}
          <StepByStep result={result} />

          {/* Tables & Charts Grid */}
          <div className="results-grid">
            <div className="full-width">
              <FrequencyTables result={result} />
            </div>
            <div className="full-width">
              <Charts result={result} />
            </div>
          </div>

          {/* Export Section */}
          <div className="export-section">
            <button
              className="btn btn-success"
              onClick={handleExportPDF}
              disabled={isExporting}
              id="btn-export-pdf"
            >
              {isExporting ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Membuat PDF...
                </>
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

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 20px 16px',
        color: '#64748b',
        fontSize: '0.8rem',
      }}>
        <p>Kalkulator Distribusi Frekuensi Pintar &copy; {new Date().getFullYear()}</p>
        <p style={{ marginTop: '4px', opacity: 0.7 }}>Built with React.js • Chart.js • Tesseract.js</p>
      </footer>
    </div>
  );
}
