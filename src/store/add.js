import omit from 'omit.js'

import { UserError } from '../error/main.js'
import { addMergeId } from '../merge/options.js'
import { mergePartialResults } from '../merge/partial.js'

import { listStore } from './list.js'

// Add a new benchmark
export const addToStore = async function (partialResult, opts) {
  const partialResults = await listStore(opts)

  const partialResultA = addMergeId(partialResult, partialResults, opts)
  await save(partialResultA, opts)

  const partialResultsA = [...partialResults, partialResultA]
  const benchmarks = mergePartialResults(partialResultsA)

  return { mergeId: partialResultA.mergeId, benchmarks }
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
// `combination.row|column` which are only computed for progress reporters,
// but re-computed after previous benchmarks loading/merging.
const normalizeBenchmark = function ({ combinations, ...benchmark }) {
  const combinationsA = combinations.map(normalizeCombination)
  return { ...benchmark, combinations: combinationsA }
}

const normalizeCombination = function ({ stats, ...combination }) {
  const combinationA = omit(combination, OMITTED_PROPS)
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...combinationA, stats: statsA }
}

const OMITTED_PROPS = ['row', 'column']
const OMITTED_STATS_PROPS = ['histogram', 'quantiles']
