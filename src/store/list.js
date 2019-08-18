import { mergeBenchmarks } from '../jobs/merge.js'
import { addJob } from '../jobs/options.js'

// List previous benchmarks and append a new one
export const append = async function(benchmark, opts) {
  const benchmarks = await listFromStore(opts)

  const benchmarkA = addJob(benchmark, benchmarks, opts)
  const benchmarksA = [...benchmarks, benchmarkA]

  const benchmarksB = mergeBenchmarks(benchmarksA)
  return [benchmarksB, benchmarkA]
}

// List previous benchmarks
export const list = async function(opts) {
  const benchmarks = await listFromStore(opts)

  const benchmarksA = mergeBenchmarks(benchmarks)
  return benchmarksA
}

const listFromStore = async function({ store: { list: listStore, opts } }) {
  try {
    return await listStore(opts)
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
