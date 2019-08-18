import { findBenchmark } from './find.js'
import { getDir } from './dir.js'

// Get previous benchmark
export const get = async function(
  benchmarks,
  { queryType, queryValue },
  { data, cwd },
) {
  const dir = await getDir({ data, cwd })

  try {
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(`Could not find benchmark from '${dir}':\n${error.message}`)
  }
}
