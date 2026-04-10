/**
 * =====================================================
 * PHYSICS COMBINATORICS ENGINE
 * Menggunakan native BigInt untuk mencegah integer
 * overflow saat N besar (fisika partikel bisa N ~ 10^23)
 * =====================================================
 */

/**
 * Menghitung faktorial menggunakan BigInt.
 * Math.factorial(170) = Infinity, tapi BigInt tidak terbatas.
 * @param {number} n - bilangan bulat non-negatif
 * @returns {BigInt}
 */
export function factorialBig(n) {
  if (n < 0) throw new Error('Faktorial tidak terdefinisi untuk bilangan negatif.');
  if (!Number.isInteger(n)) throw new Error('Faktorial hanya untuk bilangan bulat.');
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    result *= i;
  }
  return result;
}

/**
 * Permutasi P(n, r) = n! / (n-r)!
 * Jumlah cara menyusun r objek dari n objek, URUTAN diperhitungkan.
 * Contoh fisika: Susunan berbeda elektron dalam orbital.
 * @param {number} n
 * @param {number} r
 * @returns {{ value: BigInt, formula: string, error: string|null }}
 */
export function permutation(n, r) {
  if (r > n) return { value: null, formula: '', error: 'r tidak boleh lebih besar dari n.' };
  if (n < 0 || r < 0) return { value: null, formula: '', error: 'n dan r harus non-negatif.' };

  // P(n,r) = n! / (n-r)!
  // Optimasi: tidak perlu hitung faktorial penuh, hitung dari (n-r+1) ke n
  let result = 1n;
  const nB = BigInt(n);
  const rB = BigInt(r);
  for (let i = nB - rB + 1n; i <= nB; i++) {
    result *= i;
  }
  return {
    value: result,
    formula: `P(${n},${r}) = ${n}! / (${n}-${r})! = ${n}! / ${n - r}!`,
    error: null,
  };
}

/**
 * Kombinasi C(n, r) = n! / (r! * (n-r)!)
 * Jumlah cara memilih r objek dari n, URUTAN TIDAK diperhitungkan.
 * Contoh fisika: Memilih energi mikrostate dalam ensambel mikrokanonik.
 * @param {number} n
 * @param {number} r
 * @returns {{ value: BigInt, formula: string, error: string|null }}
 */
export function combination(n, r) {
  if (r > n) return { value: null, formula: '', error: 'r tidak boleh lebih besar dari n.' };
  if (n < 0 || r < 0) return { value: null, formula: '', error: 'n dan r harus non-negatif.' };

  // Simetri: C(n,r) = C(n, n-r), gunakan nilai r terkecil
  const rOpt = r > n - r ? n - r : r;
  const rOptB = BigInt(rOpt);
  const nB = BigInt(n);

  let num = 1n;
  let den = 1n;
  for (let i = 0n; i < rOptB; i++) {
    num *= nB - i;
    den *= i + 1n;
  }
  const value = num / den;

  return {
    value,
    formula: `C(${n},${r}) = ${n}! / (${r}! × ${n - r}!)`,
    error: null,
  };
}

/**
 * Permutasi Siklis = (n-1)!
 * Jumlah susunan n objek dalam cincin/lingkaran.
 * Satu posisi dianggap tetap untuk menghilangkan ekuivalensi rotasi.
 * Contoh fisika: Atom-atom karbon dalam cincin benzena (C6H6), susunan atom di kisi kristal berbentuk cincin.
 * @param {number} n - jumlah objek/partikel di dalam cincin
 * @returns {{ value: BigInt, formula: string, error: string|null }}
 */
export function cyclicPermutation(n) {
  if (n < 1) return { value: null, formula: '', error: 'n harus minimal 1.' };
  if (n === 1) return { value: 1n, formula: 'P_siklis(1) = (1-1)! = 0! = 1', error: null };

  const value = factorialBig(n - 1);
  return {
    value,
    formula: `P_siklis(${n}) = (${n}-1)! = ${n - 1}!`,
    error: null,
  };
}

/**
 * Memformat BigInt yang sangat besar menjadi string yang human-readable.
 * Contoh: 100000000n → "1.00 × 10⁸" (notasi ilmiah)
 * @param {BigInt} bigInt
 * @returns {string}
 */
export function formatBigInt(bigInt) {
  if (bigInt === null || bigInt === undefined) return '—';
  const str = bigInt.toString();
  if (str.length <= 15) {
    // Masih dalam rentang yang bisa ditampilkan normal dengan separator
    return Number(bigInt).toLocaleString('id-ID');
  }
  // Notasi ilmiah manual untuk angka sangat besar
  const mantissa = parseFloat(str.substring(0, 6)) / 100000;
  const exponent = str.length - 1;
  const superscriptMap = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻' };
  const expStr = exponent.toString().split('').map(c => superscriptMap[c] || c).join('');
  return `${mantissa.toFixed(3)} × 10${expStr}`;
}
