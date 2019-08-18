import { findBenchmark } from './find.js'

// Remove previous benchmark
export const remove = async function(
  { queryType, queryValue },
  { dataDir, store: { list: listStore, remove: removeFromStore } },
) {
  try {
    const benchmarks = await listStore(dataDir)
    const index = findBenchmark(benchmarks, queryType, queryValue)
    await removeFromStore(dataDir, index)
  } catch (error) {
    throw new Error(
      `Could not remove benchmark from '${dataDir}':\n${error.message}`,
    )
  }
}
