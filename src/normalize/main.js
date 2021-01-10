import sortOn from 'sort-on'

import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const normalizeResult = function ({
  combinations,
  systems,
  git,
  ci,
  timestamp,
  ...result
}) {
  const {
    combinations: combinationsA,
    tasks,
    runners,
    systems: systemColls,
  } = addCollections(combinations)
  const systemsA = joinSystems(systems, systemColls)
  const combinationsB = sortCombinations(combinationsA)
  const combinationsC = combinationsB.map(normalizeStats)

  return {
    ...result,
    timestamp,
    tasks,
    runners,
    systems: systemsA,
    git,
    ci,
    combinations: combinationsC,
  }
}

// Sort combinations so the fastest tasks will be first, then the fastest
// combinations within each task (regardless of column)
const sortCombinations = function (combinations) {
  return sortOn(combinations, [ROW_RANK, ...COLUMN_RANKS])
}

const ROW_RANK = 'taskRank'
const COLUMN_RANKS = ['runnerRank', 'systemRank']

// Some stats are removed when `--save` is used. When showing saved results,
// those will be `undefined`. We default them to `[]`.
const normalizeStats = function ({
  stats: { histogram = [], quantiles = [], ...stats },
  ...combination
}) {
  return { ...combination, stats: { ...stats, histogram, quantiles } }
}
