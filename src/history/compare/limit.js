import { getCombinationPrefix } from '../../combination/ids/name.js'
import { UserError } from '../../error/main.js'

import { isPositiveLimit } from './parse.js'

// If any `combination.stats.diff` is too slow compared to the `limit`
// configuration property, we fail.
// It uses the `since` configuration property like `showDiff` does.
// Done after reporting, to ensure a report is always shown.
// It can be done during benchmark (`run`) and after it (`show`)
//  - It cannot be done during `remove` since this does not make sense
//  - However, `remove` still report `diff`, `diffPrecise` and `diffLimit`
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
export const checkLimits = function ({ combinations }) {
  const limitedCombinations = combinations.filter(isOverLimit)

  if (limitedCombinations.length === 0) {
    return
  }

  const limitErrors = getLimitErrors(limitedCombinations)
  throw new UserError(limitErrors)
}

const isOverLimit = function ({ stats: { diffLimit } }) {
  return diffLimit !== undefined
}

const getLimitErrors = function (combinations) {
  return combinations
    .map((combination) => getLimitError({ combination }))
    .join('\n\n')
}

// `getCombinationName` passes an empty `noDimensions` since `dimensions` are
// already filtered out in `programmaticResult`.
const getLimitError = function ({
  combination,
  combination: {
    stats: { diff, diffLimit },
  },
}) {
  const combinationPrefix = getCombinationPrefix(combination, [])
  const diffLimitStr = Math.abs(diffLimit) * PERCENTAGE_RATIO
  const diffStr = serializeDiff(diff.raw)
  const higherStr = isPositiveLimit(diffLimit) ? 'higher' : 'lower'
  return `${combinationPrefix}The duration should be at most ${diffLimitStr}% ${higherStr} but it is ${diffStr}% ${higherStr}.`
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
