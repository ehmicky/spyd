import { UserError } from '../error/main.js'
import { mergeRawBenchmarks } from '../merge/raw.js'
import { selectBenchmarks } from '../select/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'
import { validateDataVersion } from './migrate/main.js'

// Get a previous benchmark by `count` or `timestamp`
export const getFromStore = async function (delta, opts) {
  const rawBenchmarks = await listStore(opts)
  validateDataVersion(rawBenchmarks)

  const rawBenchmarksA = selectBenchmarks(rawBenchmarks, opts)

  const benchmarks = mergeRawBenchmarks(rawBenchmarksA)

  const { mergeId } = getBenchmark(benchmarks, delta)

  return { mergeId, benchmarks, rawBenchmarks: rawBenchmarksA }
}

const getBenchmark = function (benchmarks, delta) {
  try {
    const index = find(benchmarks, delta)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new UserError(`Could not find previous benchmark: ${error.message}`)
  }
}
