/**
 * =====================================================
 * QUANTUM STATISTICAL DISTRIBUTION ENGINE
 * Implementasi presisi Maxwell-Boltzmann, Bose-Einstein,
 * dan Fermi-Dirac dengan edge-case handling.
 * =====================================================
 */

/**
 * Konstanta Boltzmann (SI exact, CODATA 2018)
 * k = 1.380649 × 10⁻²³ J/K
 */
export const BOLTZMANN_K = 1.380649e-23;

/**
 * Mode tampilan suhu: 'eV' (energi elektron-volt) atau 'SI' (Joule/K)
 * Untuk kemudahan komputasi di UI, kita bisa menggunakan satuan
 * di mana energi dan kT dalam eV: k_eV = 8.617333e-5 eV/K
 */
export const BOLTZMANN_K_EV = 8.617333262e-5; // eV per Kelvin

/**
 * Distribusi Maxwell-Boltzmann (Klasik)
 * f_MB(E) = (1/Z) * exp(-E / kT)
 *
 * Partikel klasik yang bisa dibedakan (distinguishable).
 * Berlaku untuk gas ideal pada suhu tinggi / densitas rendah.
 * Z = fungsi partisi (kita normalisasi dengan mengembalikan exp(-E/kT) saja,
 * karena Z hanya konstanta pengali)
 *
 * @param {number} E   - energi dalam eV
 * @param {number} T   - suhu dalam Kelvin
 * @returns {{ value: number, error: string|null }}
 */
export function maxwellBoltzmann(E, T) {
  if (T <= 0) return { value: null, error: 'Suhu T harus > 0 Kelvin.' };

  // kT dalam eV
  const kT = BOLTZMANN_K_EV * T;
  // f_MB = exp(-E/kT)
  const value = Math.exp(-E / kT);

  return { value, error: null };
}

/**
 * Distribusi Bose-Einstein (Boson)
 * f_BE(E) = 1 / (exp((E - μ) / kT) - 1)
 *
 * Untuk partikel dengan spin integer (foton, fonon, helium-4, dll.)
 * Partikel tak bisa dibedakan, TIDAK ada batasan jumlah per state.
 *
 * CRITICAL EDGE-CASE:
 * Jika (E - μ)/kT → 0, maka exp(...) → 1, dan (exp(...) - 1) → 0 → divergensi!
 * Ini terjadi saat E = μ (kondensasi Bose-Einstein).
 * Kita tangani dengan threshold: jika |exp(x) - 1| < ε, return null + warning.
 *
 * @param {number} E   - energi dalam eV
 * @param {number} mu  - potensial kimia μ dalam eV
 * @param {number} T   - suhu dalam Kelvin
 * @returns {{ value: number|null, error: string|null, warning: string|null }}
 */
export function boseEinstein(E, mu, T) {
  if (T <= 0) return { value: null, error: 'Suhu T harus > 0 Kelvin.', warning: null };

  const kT = BOLTZMANN_K_EV * T;
  const x = (E - mu) / kT;

  // Untuk BE, kita perlu E > μ agar distribusi terdefinisi secara fisika
  // (jika E < μ, denominator < 0, yang tidak fisika untuk boson)
  if (E <= mu) {
    return {
      value: null,
      error: null,
      warning: `Perhatian: E ≤ μ (E=${E.toFixed(4)} eV, μ=${mu.toFixed(4)} eV). Untuk Boson, energi harus E > μ. Ini titik kondensasi Bose-Einstein (divergensi).`,
    };
  }

  const expX = Math.exp(x);
  const denominator = expX - 1;

  // Threshold: jika denominator sangat kecil (< 1e-10), hampir divergen
  if (Math.abs(denominator) < 1e-10) {
    return {
      value: null,
      error: null,
      warning: `Divergensi terdeteksi: exp((E-μ)/kT) ≈ 1 → f_BE → ∞. Ini kondisi kritis Bose-Einstein Condensate (BEC).`,
    };
  }

  return { value: 1 / denominator, error: null, warning: null };
}

/**
 * Distribusi Fermi-Dirac (Fermion)
 * f_FD(E) = 1 / (exp((E - μ) / kT) + 1)
 *
 * Untuk partikel dengan spin setengah-integer (elektron, proton, neutron, dll.)
 * Partikel tak bisa dibedakan, PALING BANYAK 1 partikel per state (Prinsip Pauli).
 * Rentang nilai: 0 ≤ f_FD ≤ 1
 *
 * - Saat T → 0: f_FD = 1 untuk E < μ (Fermi energy), f_FD = 0 untuk E > μ (step function)
 * - Saat T > 0: kurva sigmoid halus di sekitar E = μ
 *
 * @param {number} E   - energi dalam eV
 * @param {number} mu  - potensial kimia / energi Fermi μ dalam eV
 * @param {number} T   - suhu dalam Kelvin
 * @returns {{ value: number, error: string|null, warning: string|null }}
 */
export function fermiDirac(E, mu, T) {
  if (T <= 0) return { value: null, error: 'Suhu T harus > 0 Kelvin.', warning: null };

  const kT = BOLTZMANN_K_EV * T;
  const x = (E - mu) / kT;

  // Untuk x sangat besar positif: exp(x) → ∞, f_FD → 0 (aman, tidak overflow secara fisika)
  // Untuk x sangat besar negatif: exp(x) → 0, f_FD → 1 (aman)
  // JavaScript handles Math.exp() gracefully untuk range ini
  if (x > 709) return { value: 0, error: null, warning: null }; // exp(>709) → Infinity di JS
  if (x < -709) return { value: 1, error: null, warning: null };

  const value = 1 / (Math.exp(x) + 1);
  return { value, error: null, warning: null };
}

/**
 * Menghasilkan data kurva untuk ketiga distribusi sekaligus.
 * Digunakan untuk render grafik Recharts.
 *
 * @param {object} params
 * @param {number} params.Emin  - energi minimum (eV)
 * @param {number} params.Emax  - energi maksimum (eV)
 * @param {number} params.mu    - potensial kimia (eV)
 * @param {number} params.T     - suhu (Kelvin)
 * @param {number} params.points - jumlah titik data (default: 200)
 * @returns {Array<{E: number, MB: number|null, BE: number|null, FD: number|null}>}
 */
export function generateDistributionCurve({ Emin = 0, Emax = 5, mu = 0, T = 300, points = 200 } = {}) {
  if (T <= 0) return [];
  const data = [];
  const step = (Emax - Emin) / (points - 1);

  for (let i = 0; i < points; i++) {
    const E = parseFloat((Emin + i * step).toFixed(6));

    const mbResult = maxwellBoltzmann(E, T);
    const beResult = boseEinstein(E, mu, T);
    const fdResult = fermiDirac(E, mu, T);

    // Normalisasi MB agar nilainya sebanding dengan BE dan FD (0-1 range)
    // Kita bagi f_MB dengan f_MB(0) agar kurva dimulai dari 1
    const mbVal = mbResult.value;

    data.push({
      E: parseFloat(E.toFixed(3)),
      MB: (mbVal !== null && isFinite(mbVal)) ? parseFloat(mbVal.toFixed(6)) : null,
      BE: (beResult.value !== null && isFinite(beResult.value) && beResult.value < 1e6)
        ? parseFloat(beResult.value.toFixed(6)) : null,
      FD: (fdResult.value !== null && isFinite(fdResult.value))
        ? parseFloat(fdResult.value.toFixed(6)) : null,
    });
  }

  return data;
}

/**
 * Mendapatkan deskripsi fisika untuk setiap distribusi.
 */
export function getDistributionInfo() {
  return {
    MB: {
      name: 'Maxwell-Boltzmann',
      shortName: 'MB',
      color: '#f59e0b',
      colorGlow: 'rgba(245, 158, 11, 0.3)',
      particle: 'Partikel Klasik',
      formula: 'f(E) = exp(−E/kT)',
      description: 'Distribusi untuk partikel klasik yang dapat dibedakan (distinguishable). Berlaku pada gas ideal, suhu tinggi, dan densitas rendah.',
      examples: ['Molekul gas ideal', 'Atom dalam plasma', 'Partikel makroskopik'],
      spin: 'Sembarang (klasik)',
      pauli: 'Tidak berlaku',
    },
    BE: {
      name: 'Bose-Einstein',
      shortName: 'BE',
      color: '#06b6d4',
      colorGlow: 'rgba(6, 182, 212, 0.3)',
      particle: 'Boson',
      formula: 'f(E) = 1 / [exp((E−μ)/kT) − 1]',
      description: 'Distribusi untuk boson (partikel tak bisa dibedakan, spin integer). Tidak ada batasan jumlah partikel per state. Pada T sangat rendah: Bose-Einstein Condensate (BEC).',
      examples: ['Foton (cahaya)', 'Fonon (getaran kisi)', 'Atom ⁴He cair', 'Gluon'],
      spin: 'Integer (0, 1, 2, ...)',
      pauli: 'Tidak berlaku',
    },
    FD: {
      name: 'Fermi-Dirac',
      shortName: 'FD',
      color: '#ec4899',
      colorGlow: 'rgba(236, 72, 153, 0.3)',
      particle: 'Fermion',
      formula: 'f(E) = 1 / [exp((E−μ)/kT) + 1]',
      description: 'Distribusi untuk fermion (partikel tak bisa dibedakan, spin setengah-integer). Prinsip Eksklusi Pauli: maksimal 1 partikel per state. Rentang: 0 ≤ f ≤ 1.',
      examples: ['Elektron (logam)', 'Proton', 'Neutron (bintang neutron)', 'Quark'],
      spin: 'Setengah-integer (1/2, 3/2, ...)',
      pauli: 'Berlaku (maks. 1/state)',
    },
  };
}
