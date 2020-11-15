import omit from 'omit.js'

import { UserError } from '../error/main.js'
import { addMergeId } from '../merge/options.js'
import { mergeRawBenchmarks } from '../merge/raw.js'

import { listStore } from './list.js'

// Add a new benchmark
export const addToStore = async function (rawBenchmark, opts) {
  const rawBenchmarks = await listStore(opts)

  const rawBenchmarkA = addMergeId(rawBenchmark, rawBenchmarks, opts)
  await save(rawBenchmarkA, opts)

  const rawBenchmarksA = [...rawBenchmarks, rawBenchmarkA]
  const benchmarks = mergeRawBenchmarks(rawBenchmarksA)

  return { mergeId: rawBenchmarkA.mergeId, benchmarks }
}

// Save benchmark results so they can be compared or shown later
const save = async function (benchmark, { save: saveOpt, store }) {
  if (!saveOpt) {
    return
  }

  const benchmarkA = normalizeBenchmark(benchmark)

  try {
    await store.add(benchmarkA)
  } catch (error) {
    throw new UserError(`Could not save benchmark: ${error.message}`)
  }
}

// Benchmark information that are too big are not persisted.
// We otherwise try to persist everything, so that `show` report the same
// information.
// We try to only persist what cannot be computed runtime (which is done by
// `addPrintedInfo()` during reporting). This includes
// `iteration.row|column` which are only computed for progress reporters,
// but re-computed after previous benchmarks loading/merging.
const normalizeBenchmark = function ({ iterations, ...benchmark }) {
  const iterationsA = iterations.map(normalizeIteration)
  return { ...benchmark, iterations: iterationsA }
}

const normalizeIteration = function ({ stats, ...iteration }) {
  const iterationA = omit(iteration, OMITTED_PROPS)
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...iterationA, stats: statsA }
}

const OMITTED_PROPS = ['row', 'column']
const OMITTED_STATS_PROPS = ['histogram', 'percentiles']
