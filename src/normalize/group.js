import sortOn from 'sort-on'

import { addCategoryInfos } from './category.js'

// Add `result.*` properties based on grouping combinations by category.
// This is done twice:
//  - When loading results, on each of them so this is available in
//    `report.previous`
//  - When merging the final result, after merged combinations have been added
//    to it
export const groupCombinations = function (results) {
  return results.map(groupResultCombinations)
}

export const groupResultCombinations = function (result) {
  const { combinations, categories } = addCategoryInfos(result)
  const combinationsA = sortCombinations(combinations)
  return { ...result, combinations: combinationsA, categories }
}

// Sort combinations so the fastest tasks will be first, then the fastest
// combinations within each task (regardless of column)
const sortCombinations = function (combinations) {
  return sortOn(combinations, SORT_ORDER)
}

const SORT_ORDER = ['taskRank', 'runnerRank', 'systemRank']
