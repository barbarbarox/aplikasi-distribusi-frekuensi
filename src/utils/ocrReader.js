import Tesseract from 'tesseract.js';

/**
 * Extract numbers from an image using Tesseract.js OCR
 * @param {File} imageFile - The image file to process
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<number[]>} - Array of extracted numbers
 */
export async function extractNumbersFromImage(imageFile, onProgress) {
  const imageUrl = URL.createObjectURL(imageFile);

  try {
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(info.progress * 100));
        }
      },
    });

    const text = result.data.text;
    
    // Extract all numbers (integers and decimals) from OCR text
    const numberPattern = /[-+]?\d+\.?\d*/g;
    const matches = text.match(numberPattern);

    if (!matches || matches.length === 0) {
      throw new Error('Tidak ditemukan angka dalam gambar. Pastikan gambar berisi tabel angka yang jelas.');
    }

    const numbers = matches
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n) && isFinite(n));

    if (numbers.length === 0) {
      throw new Error('Tidak berhasil mengekstrak angka dari gambar.');
    }

    return numbers;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
