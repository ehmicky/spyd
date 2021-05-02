import { addCombinationsDiff } from '../compare/diff.js'
import { findByDelta } from '../delta/main.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'
import { mergeLastCombinations } from './last.js'

// The `since` configuration property is used to:
//  - Specify which result to compare to with `showDiff` and `limit`.
//  - Limit the number of results shown in `previous`.
//    This is useful with time series reporters.
// We use a single configuration property for both so it is simpler for users.
// `since` can never point to the reported result, only to previous results.
// `since` might not be able to resolve:
//  - For example, this happens when setting a specific `since` using an
//    absolute delta format (like `id`) and using the `show` command pointing
//    to an earlier result.
//  - When this happens, we ignore `showDiff`, `limit` and leave `previous`
//    empty.
//  - However, we still ignore when the `since` is erroneous from a syntax or
//    semantics standpoint.
// `since` is relative to the reported result:
//  - For `bench`, this is the result being created
//  - For `show` and `remove`, this is the result being reported.
//    This ensures result reported with `show` are shown the same way as when
//    when they were measured. This is also simpler to understand since it
//    always involve only two bases (the reported result and the "since" result)
// Previous results are filtered by `select`. This purposely impacts the
// resolution of `since`.
export const applySince = async function (previous, { since, cwd }) {
  const sinceIndex = await findByDelta(previous, since, cwd)

  if (sinceIndex === -1) {
    return []
  }

  const sinceResult = previous[sinceIndex]
  const sincePrevious = previous.slice(0, sinceIndex)
  const sinceResultA = mergeCombinations(sinceResult, sincePrevious)
  return [sinceResultA, ...previous.slice(sinceIndex + 1)]
}

// Merge previous results to the last result.
// We add `result.previous` so that previous results can be reported. This array
// of results has the same shape as the merged result except for the properties
// added during merge (`previous` and `combinations[*].stats.diff`). This allows
// reporters to re-use code when displaying them.
export const mergeResults = function (result, previous) {
  const resultA = mergeCombinations(result, previous)
  const resultB = addCombinationsDiff(resultA, previous)
  const resultC = addSharedSystem(resultB)
  return { ...resultC, previous }
}

const mergeCombinations = function (result, previous) {
  const resultA = mergeLastCombinations(result, previous)
  const resultB = groupResultCombinations(resultA)
  return resultB
}
