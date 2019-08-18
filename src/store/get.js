import { mergeBenchmarks } from '../group/merge.js'

import { list } from './list.js'
import { find } from './delta/find.js'

// Get a previous benchmark by `count` or `timestamp`
export const get = async function(delta, opts) {
  const rawBenchmarks = await list(opts)

  const benchmarks = mergeBenchmarks(rawBenchmarks)

  const { group } = getBenchmark(benchmarks, delta)

  return { group, benchmarks, rawBenchmarks }
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
