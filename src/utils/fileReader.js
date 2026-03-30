import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Read Excel (.xlsx) file and extract numbers
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Flatten and extract numbers
        const numbers = [];
        jsonData.forEach(row => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              const num = parseFloat(cell);
              if (!isNaN(num)) numbers.push(num);
            });
          }
        });

        if (numbers.length === 0) {
          reject(new Error('Tidak ditemukan angka dalam file Excel.'));
        } else {
          resolve(numbers);
        }
      } catch (err) {
        reject(new Error('Gagal membaca file Excel: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read CSV file and extract numbers
 */
export function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (result) => {
        try {
          const numbers = [];
          result.data.forEach(row => {
            if (Array.isArray(row)) {
              row.forEach(cell => {
                const num = parseFloat(cell);
                if (!isNaN(num)) numbers.push(num);
              });
            }
          });

          if (numbers.length === 0) {
            reject(new Error('Tidak ditemukan angka dalam file CSV.'));
          } else {
            resolve(numbers);
          }
        } catch (err) {
          reject(new Error('Gagal memproses CSV: ' + err.message));
        }
      },
      error: (err) => {
        reject(new Error('Gagal membaca file CSV: ' + err.message));
      }
    });
  });
}

/**
 * Read file based on extension
 */
export async function readDataFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return readExcelFile(file);
  } else if (name.endsWith('.csv')) {
    return readCSVFile(file);
  } else {
    throw new Error('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
  }
}
