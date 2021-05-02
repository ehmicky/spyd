import stripAnsi from 'strip-ansi'

import { UserError } from '../error/main.js'
import { matchSelectors } from '../select/match.js'

import { parseLimits } from './parse.js'

// If any `combination.stats.diff` is too slow compared to the `limit`
// configuration property, we fail.
// It uses the `since` configuration property like `showDiff` does.
// Done after reporting.
// `limit` is only meant to print an error message and change the CLI exit code
// during measuring (`bench` command). It is not intended to be shown in
// reporting. Instead, `showDiff` should be used for similar reporting-focused
// purposes.
export const checkLimits = function ({ combinations }, { limit }) {
  const combinationsWithDiff = combinations.filter(hasDiff)

  if (combinationsWithDiff.length === 0) {
    return
  }

  const limits = parseLimits(limit, combinations)
  const limitErrors = combinationsWithDiff
    .map((combination) => checkCombinationLimits({ combination, limits }))
    .filter(Boolean)

  if (limitErrors.length === 0) {
    return
  }

  const limitError = limitErrors.join('\n')
  throw new UserError(limitError)
}

const hasDiff = function ({ stats: { diff } }) {
  return diff !== undefined
}

const checkCombinationLimits = function ({
  combination,
  combination: {
    name,
    stats: { diff },
  },
  limits,
}) {
  const limit = limits.find(({ selectors }) =>
    matchSelectors(combination, selectors),
  )

  if (limit === undefined) {
    return
  }

  const { threshold } = limit

  if (diff <= threshold) {
    return
  }

  return getLimitError(name, diff, threshold)
}

const getLimitError = function (name, diff, threshold) {
  const nameA = stripAnsi(name)
  const thresholdStr = threshold * PERCENTAGE_RATIO
  const diffStr = serializeDiff(diff)
  return `${nameA} should be at most ${thresholdStr}% slower but is ${diffStr}% slower`
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
