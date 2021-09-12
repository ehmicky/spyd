import { getCombinationName } from '../../combination/name.js'
import { UserError } from '../../error/main.js'
import { matchSelectors } from '../../select/match.js'

// If any `combination.stats.diff` is too slow compared to the `limit`
// configuration property, we fail.
// It uses the `since` configuration property like `showDiff` does.
// Done after reporting.
// `limit` is only meant to print an error message and change the CLI exit code
// during measuring (`run` command). It is not intended to be shown in
// reporting. Instead, `showDiff` should be used for similar reporting-focused
// purposes.
// The `limit` can check either for increase or decrease depending on whether
// its percentage is positive or not. This is because:
//  - A decrease percentage is the inverse from an increase percentage
//    (e.g. +100% is reverted by -50%), i.e. requires different limits.
//  - Users might want different values for increase and decrease.
//  - Some units do not have directions, i.e. one cannot know programmatically
//    whether an increase or a decrease is more desirable. This means users must
//    explicitly specify it.
export const checkLimits = function ({ combinations }, { limits }) {
  const combinationsWithDiff = combinations.filter(hasDiff)

  if (combinationsWithDiff.length === 0) {
    return
  }

  const limitErrors = combinationsWithDiff
    .map((combination) => checkCombinationLimits({ combination, limits }))
    .filter(Boolean)

  if (limitErrors.length === 0) {
    return
  }

  const limitError = limitErrors.join('\n')
  throw new UserError(limitError)
}

const hasDiff = function ({ stats: { diff, diffPrecise } }) {
  return diff !== undefined && diffPrecise
}

const checkCombinationLimits = function ({
  combination,
  combination: {
    stats: {
      diff: { raw: diff },
    },
  },
  limits,
}) {
  const limit = limits.find(({ selectors }) =>
    matchSelectors(combination, selectors),
  )

  if (limit === undefined) {
    return
  }

  const { threshold, higher } = limit

  if (isBelowThreshold(diff, threshold, higher)) {
    return
  }

  return getLimitError({ diff, threshold, higher, combination })
}

const isBelowThreshold = function (diff, threshold, higher) {
  return higher ? diff <= threshold : diff >= threshold
}

const getLimitError = function ({ diff, threshold, higher, combination }) {
  const combinationName = getCombinationName(combination)
  const thresholdStr = threshold * PERCENTAGE_RATIO
  const diffStr = serializeDiff(diff)
  const higherStr = higher ? 'higher' : 'lower'
  return `The ${combinationName} should be at most ${thresholdStr}% ${higherStr} but it is ${diffStr}% ${higherStr}.`
}

const serializeDiff = function (diff) {
  const percentage = Math.abs(diff) * PERCENTAGE_RATIO
  return percentage
    .toPrecision(PERCENTAGE_PRECISION)
    .replace(ONLY_ZEROS_REGEXP, '')
    .replace(TRAILING_ZEROS_REGEXP, '$1')
}

const PERCENTAGE_RATIO = 1e2
const PERCENTAGE_PRECISION = 2
const ONLY_ZEROS_REGEXP = /\.0+/gu
const TRAILING_ZEROS_REGEXP = /(\.\d*)0+$/gu
