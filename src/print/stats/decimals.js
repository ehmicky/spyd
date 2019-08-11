import { STAT_TYPES } from './types.js'

// Retrieve number of decimals to display.
// Always show at least 3 significant digits.
// All iterations use the same number of decimals for each stat, so they are
// vertically aligned. Padding is used instead of trailing zeros.
export const getStatsDecimals = function(iterations, scale) {
  const statsDecimals = Object.entries(STAT_TYPES).map(([name, type]) =>
    getStatDecimal({ name, type, iterations, scale }),
  )
  const statsDecimalsA = Object.fromEntries(statsDecimals)
  return statsDecimalsA
}

const getStatDecimal = function({ name, type, iterations, scale }) {
  const decimals = getDecimals({ name, type, iterations, scale })
  return [name, decimals]
}

const getDecimals = function({ name, type, iterations, scale }) {
  // Those stats don't have decimals
  if (type === 'count' || type === 'skip') {
    return 0
  }

  const measures = iterations
    .flatMap(({ stats }) => stats[name])
    .filter(isNotZero)

  // When every measure is 0, there are no decimals
  if (measures.length === 0) {
    return 0
  }

  const min = Math.min(...measures)

  const decimals = Math.max(
    Math.ceil(Math.log10((MIN_PRECISION * scale) / min)),
    0,
  )
  return decimals
}

const isNotZero = function(measure) {
  return measure !== 0
}

// Three siginificant digits
const MIN_PRECISION = 1e2
