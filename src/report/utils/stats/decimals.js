// Retrieve number of decimals to display.
// Always show at least 3 significant digits.
// All combinations use the same number of decimals for each stat, so they are
// vertically aligned. Padding is used instead of trailing zeros.
// When every measure is an integer, no decimals are needed.
export const getStatsDecimals = function (combinations, name, scale) {
  const measures = combinations
    .flatMap(({ stats }) => stats[name])
    .filter(isDefined)
    .map((measure) => Math.abs(measure) / scale)

  if (measures.every(Number.isInteger)) {
    return 0
  }

  const minMeasure = Math.min(...measures.filter(isNotZero))
  return getDecimals(minMeasure)
}

// `undefined` happens when there was not enough measures.
const isDefined = function (measure) {
  return measure !== undefined
}

const isNotZero = function (measure) {
  return measure !== 0
}

const getDecimals = function (measure) {
  const minPrecision = 10 ** (MAX_DIGITS - 1)
  return Math.max(Math.ceil(Math.log10(minPrecision / measure)), 0)
}

const MAX_DIGITS = 3
