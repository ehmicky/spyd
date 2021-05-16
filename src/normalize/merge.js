import { addCombinationsDiff } from '../compare/diff.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'
import { addHistory } from './since.js'

// Normalize the main result:
//  - Add `combination.stats.diff[Precise]` based on previous results before
//    `since` filtering
//  - Add category grouping and ranking
//  - Add `result.systems[0]` (shared system)
export const normalizeResult = function (result, previous, history) {
  const resultA = addHistory(result, history)
  const resultB = addCombinationsDiff(resultA, previous)
  const resultC = groupResultCombinations(resultB)
  const resultD = addSharedSystem(resultC)
  return resultD
}
