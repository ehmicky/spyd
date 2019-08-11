import { omitBy } from '../utils/main.js'

import { findStores } from './find.js'

// Save benchmark results so they can be compared or shown later
export const save = async function(
  benchmark,
  { save: saveOpt, dataDir, store: stores },
) {
  if (!saveOpt) {
    return
  }

  const benchmarkA = normalizeBenchmark(benchmark)

  const storesA = findStores(stores)
  await Promise.all(
    storesA.map(store => saveToStore(store, dataDir, benchmarkA)),
  )
}

// Some benchmark information are not persisted:
//  - when too big: histograms, percentiles
//  - when related to current report-related options
const normalizeBenchmark = function({ iterations, ...benchmark }) {
  const iterationsA = iterations.map(normalizeIteration)
  return { ...benchmark, iterations: iterationsA }
}

const normalizeIteration = function({ stats, printedStats, ...iteration }) {
  const statsA = removeBigStats(stats)
  const printedStatsA = removeBigStats(printedStats)
  return { ...iteration, stats: statsA, printedStats: printedStatsA }
}

const removeBigStats = function(stats) {
  return omitBy(stats, key => OMITTED_STATS_PROPS.includes(key))
}

const OMITTED_STATS_PROPS = ['histogram', 'percentiles']

const saveToStore = async function(store, dataDir, benchmark) {
  try {
    await store.add(dataDir, benchmark)
  } catch (error) {
    throw new Error(
      `Could not save benchmark to '${dataDir}':\n\n${error.stack}`,
    )
  }
}
