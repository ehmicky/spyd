import { findBenchmark } from './find.js'
import { getDir } from './dir.js'

// Remove previous benchmark
export const remove = async function(
  benchmarks,
  { queryType, queryValue },
  { data, cwd, store: { remove: removeFromStore } },
) {
  const dir = await getDir({ data, cwd })

  try {
    const index = findBenchmark(benchmarks, queryType, queryValue)
    const { id } = benchmarks[index]
    await removeFromStore(dir, id)
  } catch (error) {
    throw new Error(
      `Could not remove benchmark from '${dir}':\n${error.message}`,
    )
  }
}
