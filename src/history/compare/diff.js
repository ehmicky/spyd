import { getMatchingCombination } from '../../combination/result.js'
import { haveSimilarMeans } from '../../stats/similar.js'

import { isNegativeLimit } from './transform.js'

// Add `combination.stats.diff` which compares each combination with another
// result.
// Which result is being compared depends on the `since` configuration property.
// By default, it is the previous result but it can be any earlier result.
// If the compared result does not have the combination to compare, we use the
// most recent result before it instead.
// `combination.stats.diff` is always set and is used both by:
//  - Reporters, unless the `showDiff` configuration property is `false`
//  - The `limit` configuration property to do performance testing
// `combination.stats.diff` is not persisted in history since it can be computed
// dynamically.
//  - Also some results might have been dynamically deleted or filtered out.
// We compare to a single result instead of the average of a range of results
// because:
//  - This would not allow comparing against a precise result, like a git branch
//  - The difference might not be due to the current commit but to the previous
//    one, making it less meaningful
//  - This would require additional visualization in reporters
export const addCombinationsDiff = (result, sinceResult) => {
  if (sinceResult === undefined || result.id === sinceResult.id) {
    return result
  }

  const combinations = result.combinations.map((combination) =>
    addCombinationDiff(combination, sinceResult),
  )
  return { ...result, combinations }
}

// `mean` can only be `undefined` for combinations not measured yet in
// previews.
const addCombinationDiff = (
  combination,
  { combinations: previousCombinations },
) => {
  if (combination.stats.mean === undefined) {
    return combination
  }

  const previousCombination = getMatchingCombination(
    previousCombinations,
    combination,
  )

  if (
    previousCombination === undefined ||
    previousCombination.stats.mean === 0
  ) {
    return combination
  }

  return addDiff({ combination, previousCombination })
}

// `diffPrecise` is whether `diff` is statistically significant.
// If `false`:
//  - `limit` is not used
//  - an "approximately equal" sign is prepended on `diff`
//  - no colors are shown on `diff`
// We do not try to hide or show the `diff` as 0% instead since users might:
//  - think it is due to a bug
//  - compute the diff themselves anyway
const addDiff = ({
  combination,
  combination: {
    config: { limit },
    stats,
    stats: { mean },
  },
  previousCombination: {
    stats: previousStats,
    stats: { mean: previousMean },
  },
}) => {
  const diff = mean / previousMean - 1
  const diffPrecise = haveSimilarMeans(stats, previousStats) === false
  const diffLimit = getDiffLimit(diff, diffPrecise, limit)
  return {
    ...combination,
    stats: { ...stats, diff, diffPrecise, ...diffLimit },
  }
}

const getDiffLimit = (diff, diffPrecise, limit) =>
  diffPrecise && limit !== undefined && isOverLimit(diff, limit)
    ? { diffLimit: limit }
    : {}

const isOverLimit = (diff, limit) =>
  isNegativeLimit(limit) ? diff < limit : diff > limit
