import { UserError } from '../error/main.js'
import { mergePartialResults } from '../merge/partial.js'
import { selectBenchmarks } from '../select/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'

// Get a previous benchmark by `count` or `timestamp`
export const getFromStore = async function (delta, opts) {
  const partialResults = await listStore(opts)

  const partialResultsA = selectBenchmarks(partialResults, opts)

  const benchmarks = mergePartialResults(partialResultsA)

  const { mergeId } = getBenchmark(benchmarks, delta)

  return { mergeId, benchmarks, partialResults: partialResultsA }
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
