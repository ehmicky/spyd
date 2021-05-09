import { groupCategoryInfos } from '../combination/group.js'
import { sortCombinations } from '../combination/sort.js'

// Add `result.*` properties based on grouping combinations by category.
export const groupCombinations = function (results) {
  return results.map(groupResultCombinations)
}

export const groupResultCombinations = function ({ combinations, ...result }) {
  const { combinations: combinationsA, categories } =
    groupCategoryInfos(combinations)
  const combinationsB = sortCombinations(combinationsA)
  return { ...result, combinations: combinationsB, categories }
}
