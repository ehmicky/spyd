import sortOn from 'sort-on'

import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const normalizeBenchmark = function ({
  combinations,
  systems,
  git,
  ci,
  timestamp,
  ...benchmark
}) {
  const {
    combinations: combinationsA,
    tasks,
    inputs,
    commands,
    systems: systemColls,
  } = addCollections(combinations)
  const systemsA = joinSystems(systems, systemColls)
  const combinationsB = sortCombinations(combinationsA)
  const combinationsC = combinationsB.map(normalizeStats)

  return {
    ...benchmark,
    timestamp,
    tasks,
    inputs,
    commands,
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
const COLUMN_RANKS = ['inputRank', 'commandRank', 'systemRank']

// Some stats are removed when `--save` is used. When showing saved benchmarks,
// those will be `undefined`. We default them to `[]`.
const normalizeStats = function ({
  stats: { histogram = [], quantiles = [], ...stats },
  ...combination
}) {
  return { ...combination, stats: { ...stats, histogram, quantiles } }
}
