import { mergeBenchmarks } from '../jobs/merge.js'
import { addJob } from '../jobs/options.js'

import { getIndex } from './get.js'

// Append a new benchmark
export const append = async function(benchmark, opts) {
  const benchmarks = await listFromStore(opts)

  const benchmarkA = addJob(benchmark, benchmarks, opts)
  const benchmarksA = [...benchmarks, benchmarkA]

  const benchmarksB = mergeBenchmarks(benchmarksA)
  return [benchmarkA, benchmarksB]
}

// Get a previous benchmark
export const get = async function(delta, opts) {
  const benchmarks = await listFromStore(opts)

  const benchmarksA = mergeBenchmarks(benchmarks)

  const benchmark = getBenchmark(benchmarks, delta)
  return [benchmark, benchmarksA]
}

const listFromStore = async function({ store: { list: listStore, opts } }) {
  try {
    return await listStore(opts)
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}

const getBenchmark = function(benchmarks, { queryType, queryValue }) {
  try {
    const index = getIndex(benchmarks, queryType, queryValue)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(`Could not find previous benchmark: ${error.message}`)
  }
}
