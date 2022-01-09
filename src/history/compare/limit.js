import { getCombinationPrefix } from '../../combination/ids/name.js'
import { UserError } from '../../error/main.js'

// If any `combination.stats.diff` is too slow compared to the `limit`
// configuration property, we fail.
// It uses the `since` configuration property like `showDiff` does.
// Done after reporting.
// `limit` is only meant to print an error message and change the CLI exit code
// during measuring (`run` command). It is not intended to be shown in
// reporting. Instead, `showDiff` should be used for similar reporting-focused
// purposes.
// Even when a limit is hit, we still `save` (if the flag is present):
//  - This avoids losing information, e.g.:
//     - We can make a silent `run` checking only for limits, and still `show`
//       the result afterwards if the limit is hit
//     - We can fail a CI job if a limit is hit, while still `show`ing the
//       result afterwards
//  - This makes `limit` orthogonal with `save`
//  - If a limit is hit, it fails only once, not repeatedly, since the new
//    result will adjust the value
// The `limit` can check either for increase or decrease depending on whether
// its percentage is positive or not. This is because:
//  - A decrease percentage is the inverse from an increase percentage
//    (e.g. +100% is reverted by -50%), i.e. requires different limits.
//  - Users might want different values for increase and decrease.
//  - Some units do not have directions, i.e. one cannot know programmatically
//    whether an increase or a decrease is more desirable. This means users must
//    explicitly specify it.
export const checkLimits = function ({ combinations }, { limit }) {
  if (limit === undefined) {
    return
  }

  const limitErrors = combinations
    .filter((combination) => isOverLimit(combination, limit))
    .map((combination) => getLimitError(combination, limit))

  if (limitErrors.length === 0) {
    return
  }

  const limitError = limitErrors.join('\n\n')
  throw new UserError(limitError)
}

const isOverLimit = function ({ stats: { diff, diffPrecise } }, limit) {
  return diff !== undefined && diffPrecise && isAboveThreshold(diff.raw, limit)
}

const isAboveThreshold = function (diff, { threshold, higher }) {
  return higher ? diff > threshold : diff < threshold
}

// `getCombinationName` passes an empty `noDimensions` since `dimensions` are
// already filtered out in `programmaticResult`.
const getLimitError = function (combination, { threshold, higher }) {
  const combinationPrefix = getCombinationPrefix(combination, [])
  const thresholdStr = Math.abs(threshold) * PERCENTAGE_RATIO
  const diffStr = serializeDiff(combination.stats.diff.raw)
  const higherStr = higher ? 'higher' : 'lower'
  return `${combinationPrefix}The combination should be at most ${thresholdStr}% ${higherStr} but it is ${diffStr}% ${higherStr}.`
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
