import { isSameCategory } from '../combination/ids.js'
import { isDiffPrecise } from '../stats/welch.js'
import { findValue } from '../utils/find.js'

// Add `combination.stats.diff` which compares each combination with another
// result.
// Which result is being compared depends on the `diff` configuration property.
// By default, it is the previous result but it can be any earlier result.
// If the compared result does not have the combination to compare, we use the
// most recent result before it instead.
// `combination.stats.diff` is always set and is used both by:
//  - Reporters, unless the `showDiff` configuration property is `false`
//  - The `limit` configuration property to do performance testing
// `combination.stats.diff` is not persisted in history since it can be computed
// dynamically.
//  - Also some results might have been dynamically deleted or filtered out.
export const addCombinationsDiff = function (result, previous) {
  if (previous.length === 0) {
    return result
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const previousResults = [...previous].reverse()
  const combinations = result.combinations.map((combination) =>
    addCombinationDiff(combination, previousResults),
  )
  return { ...result, combinations }
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

const addDiff = function (combination, previousCombination) {
  const diffStats = getDiff(combination.stats, previousCombination.stats)
  return { ...combination, stats: { ...combination.stats, ...diffStats } }
}

// `median` can be `undefined` during preview
// `isDiffPrecise` is whether `diff` is statistically significant.
//   - We set `diffPrecise: true` when this happens which results in:
//      - `limit` not being used
//      - no colors
//      - an "approximately equal" sign being prepended
//   - We do not try to hide or show the `diff` as 0% instead since users might:
//      - think it is due to a bug
//      - compute the diff themselves anyway
const getDiff = function (stats, previousStats) {
  const { median } = stats
  const { median: previousMedian } = previousStats

  if (median === undefined || median === 0 || previousMedian === 0) {
    return {}
  }

  const diff = median / previousMedian - 1
  const diffPrecise = isDiffPrecise(stats, previousStats)
  return { diff, diffPrecise }
}
