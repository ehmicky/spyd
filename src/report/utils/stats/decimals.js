// Retrieve number of decimals to display.
// Always show at least 3 significant digits.
// All combinations use the same number of decimals for each stat, so they are
// vertically aligned. Padding is used instead of trailing zeros.
// When every measure is an integer, no decimals are needed.
export const getStatsDecimals = function (combinations, name, scale) {
  const measures = combinations
    .flatMap(({ stats }) => stats[name])
    .filter(isDefined)
    .map((measure) => measure / scale)

  if (measures.every(Number.isInteger)) {
    return 0
  }

  return getDecimals(measures)
}

// `undefined` happens in preview mode if not-measured-yet.
const isDefined = function (measure) {
  return measure !== undefined
}

const getDecimals = function (measures) {
  const minMeasure = Math.min(...measures)
  const minPrecision = 10 ** (MAX_DIGITS - 1)
  return Math.max(Math.ceil(Math.log10(minPrecision / minMeasure)), 0)
}

const MAX_DIGITS = 3
