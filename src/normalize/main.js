import sortOn from 'sort-on'

import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const normalizeResult = function ({ combinations, systems, ...result }) {
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
