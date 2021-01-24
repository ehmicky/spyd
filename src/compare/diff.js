import { isSameCategory } from '../combination/ids.js'
import { findByDelta } from '../delta/main.js'
import { findValue } from '../utils/find.js'

// Add `combination.stats.diff` which compares each combination with another
// result.
// Which result is being compared depends on the `compare` configuration
// property. By default, it is the previous result but it can be any earlier
// result.
// If the compared result does not have the combination to compare, we use the
// most recent result before it instead.
// `combination.stats.diff` is always set and is used both by:
//  - Reporters, unless the `showDiff` configuration property is `false`
//  - The `limit` configuration property to do performance testing
// `combination.stats.diff` is not persisted in stores since it can be computed
// dynamically and depends on the `compare` configuration property. Also some
// results might have been dynamically deleted or filtered out.
export const addCombinationsDiff = function (
  { combinations, ...result },
  results,
  compare,
) {
  const comparedIndex = getComparedIndex(results, compare)
  const previousResults = results.slice(comparedIndex)
  const combinationsA = combinations.map((combination) =>
    addCombinationDiff(combination, previousResults),
  )
  return { ...result, combinations: combinationsA }
}

const getComparedIndex = function (results, compare) {
  return findByDelta(results, compare)
}

const addCombinationDiff = function (combination, previousResults) {
  const previousReturn = findValue(previousResults, (previousResult) =>
    getPreviousCombination(previousResult, combination),
  )

  if (previousReturn === undefined) {
    return combination
  }

  const [previousCombination] = previousReturn
  const combinationA = addDiff(combination, previousCombination)
  return combinationA
}

// The `previousCombination` might be the same combination, i.e. difference
// would be 0%. This happens when the combination has not changed since the
// `previousResult`.
const getPreviousCombination = function ({ combinations }, combinationA) {
  return combinations.find((combinationB) =>
    isSameCategory(combinationA, combinationB),
  )
}

const addDiff = function (
  { stats, stats: { median }, ...combination },
  { stats: { median: previousMedian } },
) {
  const diff = getDiff(median, previousMedian)
  return { ...combination, stats: { ...stats, diff } }
}

const getDiff = function (median, previousMedian) {
  if (median === 0 || previousMedian === 0) {
    return
  }

  return median / previousMedian - 1
}
