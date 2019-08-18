import { findBenchmark } from './find.js'

// Get previous benchmark
export const load = function(
  benchmarks,
  { queryType, queryValue },
  { dataDir },
) {
  try {
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(
      `Could not find benchmark from '${dataDir}':\n${error.message}`,
    )
  }
}
