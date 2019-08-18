import { findBenchmark } from './find.js'

// Remove previous benchmark
export const remove = async function(
  { queryType, queryValue },
  { dataDir, store: { list: listStore, remove: removeFromStore } },
) {
  try {
    const benchmarks = await listStore(dataDir)
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const { id } = benchmarks[index]
    await removeFromStore(dataDir, id)
  } catch (error) {
    throw new Error(
      `Could not remove benchmark from '${dataDir}':\n${error.message}`,
    )
  }
}
