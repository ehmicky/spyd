import sortOn from 'sort-on'

import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'

// Add `result.*` properties based on grouping different combinations
// This is done twice:
//  - When loading results, on each of them so this is available in
//    `report.previous`
//  - When merging the final result, after merged combinations have been added
//    to it
export const groupCombinations = function (results) {
  return results.map(groupResultCombinations)
}

export const groupResultCombinations = function ({
  combinations,
  systems,
  ...result
}) {
  const {
    tasks,
    runners,
    systems: systemColls,
    combinations: combinationsA,
  } = addCollections(combinations)
  const systemsA = joinSystems(systems, systemColls)
  const combinationsB = sortCombinations(combinationsA)

  return {
    ...result,
    tasks,
    runners,
    systems: systemsA,
    combinations: combinationsB,
  }
}

// Sort combinations so the fastest tasks will be first, then the fastest
// combinations within each task (regardless of column)
const sortCombinations = function (combinations) {
  return sortOn(combinations, [ROW_RANK, ...COLUMN_RANKS])
}

const ROW_RANK = 'taskRank'
const COLUMN_RANKS = ['runnerRank', 'systemRank']
