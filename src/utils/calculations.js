/**
 * Calculation engine for Frequency Distribution
 * All statistical formulas encapsulated here.
 */

export function calculateFrequencyDistribution(rawData) {
  if (!rawData || rawData.length < 2) {
    throw new Error('Data harus memiliki minimal 2 nilai.');
  }

  const n = rawData.length;
  const sorted = [...rawData].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];

  // Step 1: Range
  const range = max - min;

  // Step 2: Number of classes (Sturges' Rule)
  const kRaw = 1 + 3.3 * Math.log10(n);
  const k = Math.ceil(kRaw);

  // Step 3: Class interval width
  const iRaw = range / k;
  const i = Math.ceil(iRaw);

  // Step 4: Build classes
  const classes = [];
  let lowerBound = min;

  for (let c = 0; c < k; c++) {
    const upperBound = lowerBound + i - 1;
    const lowerEdge = lowerBound - 0.5;  // Tepi bawah / batas nyata bawah
    const upperEdge = upperBound + 0.5;  // Tepi atas / batas nyata atas
    const midpoint = (lowerBound + upperBound) / 2;

    // Count frequency
    let freq = 0;
    for (let j = 0; j < n; j++) {
      if (c === k - 1) {
        // Last class includes upper bound
        if (sorted[j] >= lowerBound && sorted[j] <= upperBound) freq++;
      } else {
        if (sorted[j] >= lowerBound && sorted[j] <= upperBound) freq++;
      }
    }

    classes.push({
      index: c + 1,
      lowerBound,
      upperBound,
      lowerEdge: parseFloat(lowerEdge.toFixed(1)),
      upperEdge: parseFloat(upperEdge.toFixed(1)),
      midpoint: parseFloat(midpoint.toFixed(1)),
      frequency: freq,
      label: `${lowerBound} - ${upperBound}`,
    });

    lowerBound = upperBound + 1;
  }

  // Check if any data falls outside the last class (edge case)
  const lastClass = classes[classes.length - 1];
  if (max > lastClass.upperBound) {
    lastClass.upperBound = max;
    lastClass.upperEdge = parseFloat((max + 0.5).toFixed(1));
    lastClass.midpoint = parseFloat(((lastClass.lowerBound + max) / 2).toFixed(1));
    lastClass.label = `${lastClass.lowerBound} - ${max}`;
    // Recount last class
    let recount = 0;
    for (let j = 0; j < n; j++) {
      if (sorted[j] >= lastClass.lowerBound && sorted[j] <= max) recount++;
    }
    lastClass.frequency = recount;
  }

  // Tally generator
  classes.forEach(cls => {
    cls.tally = generateTally(cls.frequency);
  });

  // Relative frequency
  classes.forEach(cls => {
    cls.relativeRatio = `${cls.frequency}/${n}`;
    cls.relativeDecimal = parseFloat((cls.frequency / n).toFixed(4));
    cls.relativePercent = parseFloat(((cls.frequency / n) * 100).toFixed(2));
  });

  // Cumulative frequency
  let cumulLessThan = 0;
  const cumulativeLess = [];
  for (let c = 0; c < classes.length; c++) {
    cumulLessThan += classes[c].frequency;
    cumulativeLess.push({
      edge: classes[c].upperEdge,
      label: `< ${classes[c].upperEdge}`,
      cumFrequency: cumulLessThan,
    });
  }

  let cumulMoreThan = n;
  const cumulativeMore = [];
  for (let c = 0; c < classes.length; c++) {
    cumulativeMore.push({
      edge: classes[c].lowerEdge,
      label: `≥ ${classes[c].lowerEdge}`,
      cumFrequency: cumulMoreThan,
    });
    cumulMoreThan -= classes[c].frequency;
  }

  // Steps for step-by-step display
  const steps = {
    n,
    sorted,
    min,
    max,
    range,
    kRaw: parseFloat(kRaw.toFixed(4)),
    k,
    iRaw: parseFloat(iRaw.toFixed(4)),
    i,
  };

  return {
    steps,
    classes,
    cumulativeLess,
    cumulativeMore,
    totalFrequency: n,
  };
}

function generateTally(count) {
  if (count === 0) return '';
  const groups = Math.floor(count / 5);
  const remainder = count % 5;
  let tally = '';
  for (let g = 0; g < groups; g++) {
    tally += '𝍸 '; // tally group of 5 (IIII with strikethrough)
  }
  for (let r = 0; r < remainder; r++) {
    tally += '|';
  }
  return tally.trim();
}

/**
 * Parse raw input text into number array
 */
export function parseInputData(text) {
  if (!text || !text.trim()) return [];

  // Replace newlines, tabs, multiple spaces with single space
  const cleaned = text
    .replace(/[,;\t\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const numbers = cleaned
    .split(' ')
    .map(s => s.trim())
    .filter(s => s !== '')
    .map(s => {
      const num = parseFloat(s);
      return isNaN(num) ? null : num;
    })
    .filter(n => n !== null);

  return numbers;
}
