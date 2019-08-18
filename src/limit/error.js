import stripAnsi from 'strip-ansi'

// Add `iteration.slowError`
export const getSlowError = function({ slow, name, percentage, diff }) {
  if (!slow) {
    return
  }

  const nameA = stripAnsi(name)
  const percentageStr = serializePercentage(percentage)
  const diffStr = serializePercentage(diff * PERCENTAGE_RATIO)
  return `${nameA}should be at most ${percentageStr}% slower but is ${diffStr}% slower`
}

const serializePercentage = function(percentage) {
  return percentage
    .toPrecision(PERCENTAGE_PRECISION)
    .replace(ONLY_ZEROS_REGEXP, '')
    .replace(TRAILING_ZEROS_REGEXP, '$1')
}

const PERCENTAGE_RATIO = 1e2
const PERCENTAGE_PRECISION = 2
const ONLY_ZEROS_REGEXP = /\.0+/gu
const TRAILING_ZEROS_REGEXP = /(\.\d*)0+$/gu
