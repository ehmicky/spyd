import { omitBy } from '../utils/main.js'

// Save benchmark results so they can be compared or shown later
export const save = async function(
  benchmark,
  { save: saveOpt, dataDir, store: { add: addToStore } },
) {
  if (!saveOpt) {
    return
  }

  const benchmarkA = normalizeBenchmark(benchmark)

  try {
    await addToStore(dataDir, benchmarkA)
  } catch (error) {
    throw new Error(
      `Could not save benchmark to '${dataDir}':\n${error.message}`,
    )
  }
}

// Some benchmark information are not persisted:
//  - when too big: histograms, percentiles
//  - when related to current report-related options
const normalizeBenchmark = function({ iterations, ...benchmark }) {
  const iterationsA = iterations.map(normalizeIteration)
  return { ...benchmark, iterations: iterationsA }
}

const normalizeIteration = function({ stats, ...iteration }) {
  const statsA = removeBigStats(stats)
  return { ...iteration, stats: statsA }
}

const removeBigStats = function(stats) {
  return omitBy(stats, key => OMITTED_STATS_PROPS.includes(key))
}

const OMITTED_STATS_PROPS = ['histogram', 'percentiles']
