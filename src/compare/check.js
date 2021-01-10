import stripAnsi from 'strip-ansi'

import { UserError } from '../error/main.js'

// If any `combination.slowError` is set, we throw them.
// We do it after reporting.
export const checkLimits = function ({ combinations }) {
  const slowCombinations = combinations.filter(isSlow)

  if (slowCombinations.length === 0) {
    return
  }

  const limitError = slowCombinations.map(getSlowError).join('\n')
  throw new UserError(limitError)
}

const isSlow = function ({ slow }) {
  return slow
}

const getSlowError = function ({ name, limit, diff }) {
  const nameA = stripAnsi(name)
  const diffStr = serializePercentage(diff * PERCENTAGE_RATIO)
  return `${nameA} should be at most ${limit}% slower but is ${diffStr}% slower`
}

const serializePercentage = function (percentage) {
  return percentage
    .toPrecision(PERCENTAGE_PRECISION)
    .replace(ONLY_ZEROS_REGEXP, '')
    .replace(TRAILING_ZEROS_REGEXP, '$1')
}

const PERCENTAGE_RATIO = 1e2
const PERCENTAGE_PRECISION = 2
const ONLY_ZEROS_REGEXP = /\.0+/gu
const TRAILING_ZEROS_REGEXP = /(\.\d*)0+$/gu
