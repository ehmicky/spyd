import { mergeBenchmarks } from '../group/merge.js'
import { addGroup } from '../group/options.js'
import { omit } from '../utils/main.js'

import { listStore } from './list.js'
import { validateDataVersion } from './migrate/main.js'

// Add a new benchmark
export const addToStore = async function(rawBenchmark, opts) {
  const rawBenchmarks = await listStore(opts)
  validateDataVersion(rawBenchmarks)

  const rawBenchmarkA = addGroup(rawBenchmark, rawBenchmarks, opts)
  await save(rawBenchmarkA, opts)

  const rawBenchmarksA = [...rawBenchmarks, rawBenchmarkA]
  const benchmarks = mergeBenchmarks(rawBenchmarksA)

  return { group: rawBenchmarkA.group, benchmarks }
}

// Save benchmark results so they can be compared or shown later
const save = async function(benchmark, { save: saveOpt, store }) {
  if (!saveOpt) {
    return
  }

  const benchmarkA = normalizeBenchmark(benchmark)

  try {
    await store.add(benchmarkA)
  } catch (error) {
    throw new Error(`Could not save benchmark: ${error.message}`)
  }
}

// Benchmark information that are too big are not persisted.
// We otherwise try to persist everything, so that `show` report the same
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
