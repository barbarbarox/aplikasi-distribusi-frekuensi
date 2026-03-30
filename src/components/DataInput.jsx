import { useState, useRef, useCallback } from 'react';
import { parseInputData } from '../utils/calculations';
import { readDataFile } from '../utils/fileReader';
import { extractNumbersFromImage } from '../utils/ocrReader';

const TABS = [
  { id: 'manual', label: 'Input Manual', icon: '⌨️' },
  { id: 'file', label: 'Upload File', icon: '📄' },
  { id: 'ocr', label: 'Upload Gambar', icon: '🖼️' },
];

export default function DataInput({ onDataReady, isProcessing }) {
  const [activeTab, setActiveTab] = useState('manual');
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const fileInputRef = useRef(null);
  const ocrInputRef = useRef(null);

  const clearState = () => {
    setError('');
    setPreviewData(null);
    setImagePreview(null);
    setFileName('');
    setOcrProgress(0);
  };

  // ===== MANUAL INPUT =====
  const handleManualSubmit = useCallback(() => {
    clearState();
    const numbers = parseInputData(manualText);
    if (numbers.length < 2) {
      setError('Masukkan minimal 2 angka yang valid.');
      return;
    }
    setPreviewData(numbers);
    onDataReady(numbers);
  }, [manualText, onDataReady]);

  // ===== FILE UPLOAD =====
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearState();
    setFileName(file.name);
    setLoadingFile(true);

    try {
      const numbers = await readDataFile(file);
      setPreviewData(numbers);
      onDataReady(numbers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onDataReady]);

  // ===== OCR IMAGE =====
  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearState();
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setLoadingOCR(true);
    setOcrProgress(0);

    try {
      const numbers = await extractNumbersFromImage(file, (progress) => {
        setOcrProgress(progress);
      });
      setPreviewData(numbers);
      onDataReady(numbers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOCR(false);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
    }
  }, [onDataReady]);

  // ===== DRAG & DROP =====
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (activeTab === 'file') {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    } else if (activeTab === 'ocr') {
      const fakeEvent = { target: { files: [file] } };
      handleImageChange(fakeEvent);
    }
  };

  const loadSampleData = () => {
    const sample = '65, 72, 58, 83, 91, 76, 68, 79, 85, 62, 70, 74, 88, 55, 81, 77, 63, 90, 67, 73, 82, 59, 71, 86, 78, 64, 69, 84, 75, 92';
    setManualText(sample);
  };

  return (
    <div className="card fade-in">
      <h2 className="card-title">
        <span className="icon blue">📊</span>
        Input Data
      </h2>

      {/* Tabs */}
      <div className="input-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`input-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); clearState(); }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Manual Input */}
      {activeTab === 'manual' && (
        <div className="fade-in">
          <textarea
            className="data-textarea"
            placeholder="Masukkan data angka, pisahkan dengan koma, spasi, atau enter...&#10;&#10;Contoh: 65, 72, 58, 83, 91, 76, 68, 79, 85, 62"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            id="manual-input-textarea"
          />
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button
              className="btn btn-primary"
              onClick={handleManualSubmit}
              disabled={isProcessing || !manualText.trim()}
              id="btn-process-manual"
            >
              🚀 Proses Data
            </button>
            <button className="btn btn-secondary" onClick={loadSampleData} id="btn-sample-data">
              📋 Data Contoh
            </button>
          </div>
        </div>
      )}

      {/* File Upload */}
      {activeTab === 'file' && (
        <div className="fade-in">
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            id="file-upload-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              {fileName || 'Klik atau seret file ke sini'}
            </div>
            <div className="upload-hint">Format: .xlsx, .xls, .csv</div>
          </div>

          {loadingFile && (
            <div className="loading-overlay" style={{ padding: '24px' }}>
              <div className="spinner"></div>
              <span className="loading-text">Membaca file...</span>
            </div>
          )}
        </div>
      )}

      {/* OCR Image Upload */}
      {activeTab === 'ocr' && (
        <div className="fade-in">
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onClick={() => ocrInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            id="ocr-upload-zone"
          >
            <input
              type="file"
              ref={ocrInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="upload-icon">🖼️</div>
            <div className="upload-text">
              {fileName || 'Upload gambar berisi tabel angka'}
            </div>
            <div className="upload-hint">Format: PNG, JPG, JPEG, BMP, WebP</div>
          </div>

          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}

          {loadingOCR && (
            <div className="ocr-progress">
              <span className="progress-label">
                ⏳ Mengekstrak teks dari gambar... {ocrProgress}%
              </span>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <div className="error-msg">⚠️ {error}</div>}

      {/* Preview */}
      {previewData && !loadingFile && !loadingOCR && (
        <div className="data-preview fade-in">
          <span className="check-icon">✅</span>
          <span className="count-text">{previewData.length} data berhasil dimuat</span>
        </div>
      )}
    </div>
  );
}
