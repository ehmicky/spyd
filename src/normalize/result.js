import { addCombinationsDiff } from '../compare/diff.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'

// Normalize the main result:
//  - Add `combination.stats.diff[Precise]` based on previous results before
//    `since` filtering
//  - Add category grouping and ranking
//  - Add `result.systems[0]` (shared system)
export const normalizeResult = function (result) {
  const resultA = addCombinationsDiff(result)
  const resultB = groupResultCombinations(resultA)
  const resultC = addSharedSystem(resultB)
  return resultC
}
