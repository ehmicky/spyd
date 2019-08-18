import { mergeBenchmarks } from '../jobs/merge.js'
import { addJob } from '../jobs/options.js'

import { list } from './list.js'

// Add a new benchmark
export const add = async function(benchmark, opts) {
  const benchmarks = await list(opts)

  const benchmarkA = addJob(benchmark, benchmarks, opts)
  const benchmarksA = [...benchmarks, benchmarkA]

  const benchmarksB = mergeBenchmarks(benchmarksA)
  return [benchmarkA, benchmarksB]
}
