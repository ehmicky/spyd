import { findBenchmark } from './find.js'

// Remove previous benchmark
export const remove = async function(
  benchmarks,
  { queryType, queryValue },
  { store: { remove: removeFromStore, opts } },
) {
  try {
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const { id } = benchmarks[index]
    await removeFromStore(id, opts)
  } catch (error) {
    throw new Error(`Could not remove benchmark: ${error.message}`)
  }
}
