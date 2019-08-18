import { findBenchmark } from './find.js'

// Load previous benchmark
export const load = async function(
  { queryType, queryValue },
  { dataDir, store: { list: listStore } },
) {
  try {
    const benchmarks = await listStore(dataDir)
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(
      `Could not find benchmark from '${dataDir}':\n${error.message}`,
    )
  }
}
