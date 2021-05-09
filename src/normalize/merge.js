import { addCombinationsDiff } from '../compare/diff.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'

// Normalize the main result:
//  - Add `combination.stats.diff[Precise]` based on previous results before
//    `since` filtering
//  - Add category grouping and ranking
//  - Add `result.systems[0]` (shared system)
//  - Add `result.history` pointing to previous results after `since` fitering
export const mergeResults = function (result, previous, history) {
  const resultA = addCombinationsDiff(result, previous)
  const resultB = groupResultCombinations(resultA)
  const resultC = addSharedSystem(resultB)
  return { ...resultC, history }
}
