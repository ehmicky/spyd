import { omit } from '../utils/main.js'

import { getDir } from './dir.js'

// Save benchmark results so they can be compared or shown later
export const save = async function(
  benchmark,
  { save: saveOpt, data, cwd, store: { add: addToStore } },
) {
  if (!saveOpt) {
    return
  }

  const benchmarkA = normalizeBenchmark(benchmark)

  const dir = await getDir({ data, cwd })

  try {
    await addToStore(dir, benchmarkA)
  } catch (error) {
    throw new Error(`Could not save benchmark to '${dir}':\n${error.message}`)
  }
}

// Benchmark information that are too big are not persisted.
// We otherwise try to persist everything, so that `--show` report the same
// information.
// We try to only persist what cannot be computed runtime (which is done by
// `addPrintedInfo()` during reporting). This includes
// `iteration.name|columnName` which are only computed for progress reporters,
// but re-computer after previous benchmarks loading/merging.
const normalizeBenchmark = function({ iterations, ...benchmark }) {
  const iterationsA = iterations.map(normalizeIteration)
  return { ...benchmark, iterations: iterationsA }
}

const normalizeIteration = function({ stats, ...iteration }) {
  const iterationA = omit(iteration, OMITTED_PROPS)
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...iterationA, stats: statsA }
}

const OMITTED_PROPS = ['name', 'columnName']
const OMITTED_STATS_PROPS = ['histogram', 'percentiles']
