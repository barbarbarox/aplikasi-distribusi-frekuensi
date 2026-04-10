import { useState, useMemo, useCallback } from 'react';
import {
  maxwellBoltzmann,
  boseEinstein,
  fermiDirac,
  generateDistributionCurve,
  getDistributionInfo,
} from '../utils/physics/distributions';

const DISTRIBUTION_INFO = getDistributionInfo();

/**
 * Custom hook untuk engine distribusi kuantum.
 * Mengelola parameter E, T, μ dan menghasilkan data kurva untuk Recharts.
 */
export function useQuantumDistribution() {
  // === State Input Parameter ===
  const [E, setE] = useState('1.0');       // Energi titik kalkulasi (eV)
  const [T, setT] = useState('300');       // Suhu (Kelvin)
  const [mu, setMu] = useState('0.5');    // Potensial kimia / Energi Fermi (eV)

  // Rentang grafik
  const [Emin] = useState(0);
  const [Emax] = useState(5);

  // === Parsed Values ===
  const params = useMemo(() => {
    const Eval = parseFloat(E);
    const Tval = parseFloat(T);
    const muVal = parseFloat(mu);
    return {
      E: isNaN(Eval) ? null : Eval,
      T: isNaN(Tval) ? null : Tval,
      mu: isNaN(muVal) ? null : muVal,
      valid: !isNaN(Eval) && !isNaN(Tval) && !isNaN(muVal) && Tval > 0,
    };
  }, [E, T, mu]);

  // === Kalkulasi titik tunggal ===
  const pointResults = useMemo(() => {
    if (!params.valid) return null;
    const mb = maxwellBoltzmann(params.E, params.T);
    const be = boseEinstein(params.E, params.mu, params.T);
    const fd = fermiDirac(params.E, params.mu, params.T);
    return {
      MB: { ...mb, info: DISTRIBUTION_INFO.MB },
      BE: { ...be, info: DISTRIBUTION_INFO.BE },
      FD: { ...fd, info: DISTRIBUTION_INFO.FD },
      kT: 8.617333262e-5 * params.T, // kT dalam eV
    };
  }, [params]);

  // === Data kurva untuk Recharts ===
  const curveData = useMemo(() => {
    if (!params.valid) return [];
    return generateDistributionCurve({
      Emin,
      Emax,
      mu: params.mu,
      T: params.T,
      points: 250,
    });
  }, [params.valid, params.mu, params.T, Emin, Emax]);

  // === Normalisasi MB untuk grafik (exp(-E/kT) bisa sangat kecil) ===
  const chartData = useMemo(() => {
    if (!curveData.length) return [];
    // Cari nilai MB maksimum untuk normalisasi
    const mbMax = curveData.reduce((max, d) => (d.MB > max ? d.MB : max), 0);
    return curveData.map(d => ({
      ...d,
      MB_norm: mbMax > 0 && d.MB !== null ? parseFloat((d.MB / mbMax).toFixed(6)) : null,
    }));
  }, [curveData]);

  const resetParams = useCallback(() => {
    setE('1.0');
    setT('300');
    setMu('0.5');
  }, []);

  return {
    // Inputs
    E, setE,
    T, setT,
    mu, setMu,
    // Computed
    params,
    pointResults,
    chartData,
    Emin,
    Emax,
    distributionInfo: DISTRIBUTION_INFO,
    resetParams,
  };
}
