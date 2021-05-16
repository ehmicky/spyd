import { addCombinationsDiff } from '../compare/diff.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'

// Normalize the result after measuring
export const normalizeMeasuredResult = function (result) {
  const combinations = result.combinations.map(normalizeCombination)
  return { ...result, combinations }
}

const normalizeCombination = function ({ taskId, runnerId, systemId, stats }) {
  return { taskId, runnerId, systemId, stats }
}

// Normalize the result before reporting:
//  - Add `combination.stats.diff[Precise]` based on previous results before
//    `since` filtering
//  - Add category grouping and ranking
//  - Add `result.systems[0]` (shared system)
export const normalizeReportedResult = function (result) {
  const resultA = addCombinationsDiff(result)
  const resultB = groupResultCombinations(resultA)
  const resultC = addSharedSystem(resultB)
  return resultC
}
