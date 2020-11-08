import mapObj from 'map-obj'

import { STAT_TYPES } from './types.js'

// Retrieve number of decimals to display.
// Always show at least 3 significant digits.
// All iterations use the same number of decimals for each stat, so they are
// vertically aligned. Padding is used instead of trailing zeros.
export const getStatsDecimals = function (iterations, scale) {
  return mapObj(STAT_TYPES, (name, type) => [
    name,
    getDecimals({ name, type, iterations, scale }),
  ])
}

const getDecimals = function ({ name, type, iterations, scale }) {
  if (type === 'count') {
    return 0
  }

  const measures = iterations
    .flatMap(({ stats }) => stats[name])
    .filter(isNotEmpty)

  // When every measure is 0 or undefined, there are no decimals
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

const isNotEmpty = function (measure) {
  return measure !== 0 && measure !== undefined
}

// Three siginificant digits
const MIN_PRECISION = 1e2
