import { addCombinationsDiff } from '../compare/diff.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'

// Merge previous results to the last result.
// We add `result.previous` so that previous results can be reported. This array
// of results has the same shape as the merged result except for the properties
// added during merge (`previous` and `combinations[*].stats.diff`). This allows
// reporters to re-use code when displaying them.
export const mergeResults = function (result, previous) {
  const resultA = groupResultCombinations(result)
  const resultB = addCombinationsDiff(resultA, previous)
  const resultC = addSharedSystem(resultB)
  return { ...resultC, previous }
}
