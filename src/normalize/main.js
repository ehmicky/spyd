import sortOn from 'sort-on'

import { addNames } from '../report/utils/name/main.js'
import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const normalizeBenchmark = function ({
  iterations,
  systems,
  git,
  ci,
  timestamp,
  ...benchmark
}) {
  const {
    iterations: iterationsA,
    tasks,
    inputs,
    commands,
    systems: systemColls,
  } = addCollections(iterations)
  const systemsA = joinSystems(systems, systemColls)

  const iterationsB = addNames(iterationsA)

  const iterationsC = sortIterations(iterationsB)
  const iterationsD = iterationsC.map(normalizeIterationStats)

  return {
    ...benchmark,
    timestamp,
    tasks,
    inputs,
    commands,
    systems: systemsA,
    git,
    ci,
    iterations: iterationsD,
  }
}

// Sort iterations so the fastest tasks will be first, then the fastest
// iterations within each task (regardless of column)
const sortIterations = function (iterations) {
  return sortOn(iterations, [ROW_RANK, ...COLUMN_RANKS])
}

const ROW_RANK = 'taskRank'
const COLUMN_RANKS = ['inputRank', 'commandRank', 'systemRank']

// Some stats are removed when `--save` is used. When showing saved benchmarks,
// those will be `undefined`. We default them to `[]`.
const normalizeIterationStats = function ({
  stats: { histogram = [], percentiles = [], ...stats },
  ...iteration
}) {
  return { ...iteration, stats: { ...stats, histogram, percentiles } }
}
