import { mergeBenchmarks } from '../jobs/merge.js'

import { list } from './list.js'
import { find } from './find.js'

// Get a previous benchmark by `count` or `timestamp`
export const get = async function(delta, opts) {
  const benchmarks = await list(opts)

  const benchmarksA = mergeBenchmarks(benchmarks)

  const benchmark = getBenchmark(benchmarks, delta)
  return { job: benchmark.job, benchmarks: benchmarksA }
}

const getBenchmark = function(benchmarks, delta) {
  try {
    const index = find(benchmarks, delta)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(`Could not find previous benchmark: ${error.message}`)
  }
}
