import { findBenchmark } from './find.js'

// Remove previous benchmark
export const remove = async function(
  benchmarks,
  { queryType, queryValue },
  { dataDir, store: { remove: removeFromStore } },
) {
  try {
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const { id } = benchmarks[index]
    await removeFromStore(dataDir, id)
  } catch (error) {
    throw new Error(
      `Could not remove benchmark from '${dataDir}':\n${error.message}`,
    )
  }
}
