// Retrieve number of decimals to display.
// Always show at least 3 significant digits.
// All combinations use the same number of decimals for each stat, so they are
// vertically aligned. Padding is used instead of trailing zeros.
export const getStatsDecimals = function ({ combinations, name, type, scale }) {
  if (type === 'count') {
    return 0
  }

  const measures = combinations
    .flatMap(({ stats }) => stats[name])
    .filter(isNotZero)

  // When every measure is 0, there are no decimals
  if (measures.length === 0) {
    return 0
  }

  return Math.max(
    Math.ceil(Math.log10((MIN_PRECISION * scale) / Math.min(...measures))),
    0,
  )
}

const isNotZero = function (measure) {
  return measure !== 0
}

// Three siginificant digits
const MIN_PRECISION = 1e2
