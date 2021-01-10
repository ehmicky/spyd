import stripAnsi from 'strip-ansi'

import { UserError } from '../error/main.js'

// If any `combination.slow` is `true`, we fail.
// We do it after reporting.
export const checkLimits = function ({ combinations }) {
  const slowCombinations = combinations.filter(isSlow)

  if (slowCombinations.length === 0) {
    return
  }

  const limitErrors = slowCombinations.map(getLimitError).join('\n')
  throw new UserError(limitErrors)
}

const isSlow = function ({ stats: { slow } }) {
  return slow
}

const getLimitError = function ({ name, stats: { limit, diff } }) {
  const nameA = stripAnsi(name)
  const diffStr = serializeDiff(diff)
  return `${nameA} should be at most ${limit}% slower but is ${diffStr}% slower`
}

const serializeDiff = function (diff) {
  const percentage = diff * PERCENTAGE_RATIO
  return percentage
    .toPrecision(PERCENTAGE_PRECISION)
    .replace(ONLY_ZEROS_REGEXP, '')
    .replace(TRAILING_ZEROS_REGEXP, '$1')
}

const PERCENTAGE_RATIO = 1e2
const PERCENTAGE_PRECISION = 2
const ONLY_ZEROS_REGEXP = /\.0+/gu
const TRAILING_ZEROS_REGEXP = /(\.\d*)0+$/gu
