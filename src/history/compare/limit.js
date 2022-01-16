import { getCombinationName } from '../../combination/ids/name.js'
import { UserError } from '../../error/main.js'
import { groupBy } from '../../utils/group.js'

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

const isOverLimit = function (combination) {
  return getDiffLimit(combination) !== undefined
}

const getLimitErrors = function (combinations) {
  const combinationsGroups = Object.values(groupBy(combinations, getDiffLimit))
  return combinationsGroups.map(getLimitError).join('\n')
}

const getLimitError = function (combinations) {
  const limitErrorBody = getLimitErrorBody(combinations)
  const limitInfos = combinations.map(getLimitInfo)

  if (!hasCombinationNames(limitInfos)) {
    return `The task ${limitInfos[0].diffSuffix} ${limitErrorBody}.`
  }

  const combinationLimits = limitInfos.map(getCombinationLimit).join(', ')
  return `The following ${limitErrorBody}: ${combinationLimits}`
}

const getLimitErrorBody = function ([firstCombination]) {
  const diffLimit = getDiffLimit(firstCombination)
  const diffLimitStr = serializeDiff(diffLimit)
  const signStr = isPositiveLimit(diffLimit) ? 'slower' : 'faster'
  return `must be at most ${diffLimitStr} ${signStr}`
}

const getDiffLimit = function ({ stats: { diffLimit } }) {
  return diffLimit
}

// `getCombinationName` passes an empty `noDimensions` since `dimensions` are
// already filtered out in `programmaticResult`.
const getLimitInfo = function (combination) {
  const name = getCombinationName(combination, [])
  const diffStr = serializeDiff(combination.stats.diff)
  const diffSuffix = `(${diffStr})`
  return { name, diffSuffix }
}

const serializeDiff = function (diff) {
  return diff.simple.replace(/^-/u, '')
}

// Combination names can be empty when `result.combinations.length` is only 1
const hasCombinationNames = function (limitInfos) {
  return limitInfos.length !== 1 || limitInfos[0].name !== ''
}

const getCombinationLimit = function ({ name, diffSuffix }) {
  return `${name} ${diffSuffix}`
}
