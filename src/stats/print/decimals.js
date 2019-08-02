import { STAT_TYPES } from './types.js'

// Retrieve number of decimals to display.
// Always shows `MIN_DIGITS` significant digits.
// All iterations use the same number of decimals (or padding if none) for each
// stat, so they are vertically aligned.
export const getStatDecimals = function(iterations, scale) {
  const statDecimals = Object.entries(STAT_TYPES).map(([name, type]) =>
    getDecimals({ name, type, iterations, scale }),
  )
  const statDecimalsA = Object.fromEntries(statDecimals)
  return statDecimalsA
}

const getDecimals = function({ name, type, iterations, scale }) {
  if (type === 'count' || type === 'skip') {
    return [name, 0]
  }

  const measures = iterations
    .flatMap(({ stats }) => stats[name])
    .filter(isNotZero)

  if (measures.length === 0) {
    return [name, 0]
  }

  const min = Math.min(...measures)

  const decimals = Math.max(
    Math.ceil(Math.log10((MIN_PRECISION * scale) / min)),
    0,
  )
  return [name, decimals]
}

const isNotZero = function(measure) {
  return measure !== 0
}

// Two digits of precision
const MIN_PRECISION = 1e1
