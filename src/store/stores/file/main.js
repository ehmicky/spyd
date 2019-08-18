import { getDir } from './dir.js'
import { getBenchmarks, setBenchmarks } from './fs.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dir/data.json`
const list = async function(opts) {
  const dir = getDir(opts)

  const benchmarks = await getBenchmarks(dir)
  return benchmarks
}

const add = async function(benchmark, opts) {
  const dir = getDir(opts)

  const benchmarks = await getBenchmarks(dir)
  const benchmarksA = [...benchmarks, benchmark]
  await setBenchmarks(dir, benchmarksA)
}

const remove = async function(job, opts) {
  const dir = getDir(opts)

  const benchmarks = await getBenchmarks(dir)
  const benchmarksA = benchmarks.filter(benchmark => benchmark.job !== job)
  await setBenchmarks(dir, benchmarksA)
}

export const file = { list, add, remove }
