import { getBenchmarks, setBenchmarks } from './fs.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dir/data.json`
const list = async function(dir) {
  const benchmarks = await getBenchmarks(dir)
  return benchmarks
}

const add = async function(dir, benchmark) {
  const benchmarks = await getBenchmarks(dir)
  const benchmarksA = [...benchmarks, benchmark]
  await setBenchmarks(dir, benchmarksA)
}

const remove = async function(dir, id) {
  const benchmarks = await getBenchmarks(dir)
  const index = benchmarks.findIndex(benchmark => benchmark.id === id)
  const benchmarksA = [
    ...benchmarks.slice(0, index),
    ...benchmarks.slice(index + 1),
  ]
  await setBenchmarks(dir, benchmarksA)
}

export const file = { list, add, remove }
