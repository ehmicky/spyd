// Retrieve number of decimals to display.
// Always show at least 3 significant digits.
// All combinations use the same number of decimals for each stat, so they are
// vertically aligned. Padding is used instead of trailing zeros.
// When every measure is an integer, no decimals are needed.
export const getStatsDecimals = (combinations, name, scale) => {
  const measures = combinations
    .flatMap(({ stats }) => stats[name])
    .filter(isDefined)
    .map((measure) => Math.abs(measure) / scale)
    .filter(isNotZero)

  if (measures.every(Number.isInteger)) {
    return 0
  }

  const minMeasure = Math.min(...measures)
  return getDecimals(minMeasure)
}

// `undefined` happens when there was not enough measures.
const isDefined = (measure) => measure !== undefined

// `0` is excluded since decimals cannot be inferred from it.
const isNotZero = (measure) => measure !== 0

const getDecimals = (measure) => {
  const minPrecision = 10 ** (MAX_DIGITS - 1)
  return Math.max(Math.ceil(Math.log10(minPrecision / measure)), 0)
}

const MAX_DIGITS = 3
