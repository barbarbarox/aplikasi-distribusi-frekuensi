import { useState, useCallback, useMemo } from 'react';
import { permutation, combination, cyclicPermutation, formatBigInt } from '../utils/physics/combinatorics';

/**
 * Custom hook untuk modul kombinatorial fisika.
 * Mengelola state input N, R dan kalkulasi BigInt.
 */
export function useCombinatorics() {
  const [n, setN] = useState('');
  const [r, setR] = useState('');

  const parseInput = (val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const results = useMemo(() => {
    const nVal = parseInput(n);
    const rVal = parseInput(r);

    if (nVal === null || nVal < 0) {
      return { permResult: null, combResult: null, cyclicResult: null, inputError: 'Masukkan nilai N yang valid (bilangan bulat ≥ 0).' };
    }
    if (nVal > 100000) {
      return { permResult: null, combResult: null, cyclicResult: null, inputError: 'N terlalu besar untuk ditampilkan (max: 100.000). Gunakan notasi ilmiah.' };
    }

    const cyclicResult = cyclicPermutation(nVal);

    if (rVal === null) {
      return {
        permResult: null,
        combResult: null,
        cyclicResult,
        inputError: null,
        rMissing: true,
      };
    }

    if (rVal < 0) {
      return { permResult: null, combResult: null, cyclicResult, inputError: 'R harus ≥ 0.', rMissing: false };
    }

    const permResult = permutation(nVal, rVal);
    const combResult = combination(nVal, rVal);

    return { permResult, combResult, cyclicResult, inputError: null, rMissing: false };
  }, [n, r]);

  const formattedResults = useMemo(() => {
    const { permResult, combResult, cyclicResult } = results;
    return {
      permFormatted: permResult?.value != null ? formatBigInt(permResult.value) : null,
      combFormatted: combResult?.value != null ? formatBigInt(combResult.value) : null,
      cyclicFormatted: cyclicResult?.value != null ? formatBigInt(cyclicResult.value) : null,
      permFormula: permResult?.formula ?? '',
      combFormula: combResult?.formula ?? '',
      cyclicFormula: cyclicResult?.formula ?? '',
      permError: permResult?.error ?? null,
      combError: combResult?.error ?? null,
      cyclicError: cyclicResult?.error ?? null,
    };
  }, [results]);

  const resetInputs = useCallback(() => {
    setN('');
    setR('');
  }, []);

  return {
    n, setN,
    r, setR,
    inputError: results.inputError,
    rMissing: results.rMissing,
    ...formattedResults,
  };
}
