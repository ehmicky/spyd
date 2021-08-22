import { groupDimensionInfos } from '../combination/group.js'
import { sortCombinations } from '../combination/sort.js'
import { addCombinationsDiff } from '../compare/diff.js'

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
//  - Add dimension grouping and ranking
// This is not currently applied to `result.history[*]`
export const normalizeReportedResult = function (result) {
  const resultA = addCombinationsDiff(result)
  const resultB = groupResultCombinations(resultA)
  return resultB
}

// Add `result.*` properties based on grouping combinations by dimension.
const groupResultCombinations = function ({ combinations, ...result }) {
  const { combinations: combinationsA, dimensions } =
    groupDimensionInfos(combinations)
  const combinationsB = sortCombinations(combinationsA)
  return { ...result, combinations: combinationsB, dimensions }
}
