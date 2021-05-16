import { isSameCategory } from '../combination/ids.js'
import { resultsHaveCombination } from '../combination/result.js'
import { isDiffPrecise } from '../stats/welch.js'

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
export const addCombinationsDiff = function (result) {
  const { history } = result

  if (history.length <= 1) {
    return result
  }

  const [sinceResult, ...afterSince] = history
  const combinations = result.combinations.map((combination) =>
    addCombinationDiff(combination, sinceResult, afterSince),
  )
  return { ...result, combinations }
}

// The `previousCombination` might be the same combination, i.e. difference
// would be 0%. This happens when the combination has not changed since the
// `previousResult`.
// A combination might be in `result` because it was taken from `sinceResult`
// (the one we're diffing against). In this case, we don't want to diff the
// combination against itself.
const addCombinationDiff = function (
  combination,
  { combinations: previousCombinations },
  afterSince,
) {
  const previousCombinationA = previousCombinations.find(
    (previousCombination) => isSameCategory(combination, previousCombination),
  )

  if (
    previousCombinationA === undefined ||
    !resultsHaveCombination(afterSince, combination)
  ) {
    return combination
  }

  const diffStats = getDiff(combination.stats, previousCombinationA.stats)
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
