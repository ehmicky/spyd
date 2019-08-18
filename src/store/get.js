import { findBenchmark } from './find.js'

// Get previous benchmark
export const get = function(benchmarks, { queryType, queryValue }) {
  try {
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(`Could not find benchmark: ${error.message}`)
  }
}
