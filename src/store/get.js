import { mergeBenchmarks } from '../group/merge.js'
import { selectBenchmarks } from '../select/main.js'

import { listStore } from './list.js'
import { find } from './delta/find.js'

// Get a previous benchmark by `count` or `timestamp`
export const getFromStore = async function(delta, opts) {
  const rawBenchmarks = await listStore(opts)
  const rawBenchmarksA = selectBenchmarks(rawBenchmarks, opts)

  const benchmarks = mergeBenchmarks(rawBenchmarksA)

  const { group } = getBenchmark(benchmarks, delta)

  return { group, benchmarks, rawBenchmarks: rawBenchmarksA }
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
