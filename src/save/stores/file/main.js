import { findBenchmark } from '../../find.js'

import { getBenchmarks, setBenchmarks } from './fs.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dataDir/data.json`
const list = async function(dataDir) {
  const benchmarks = await getBenchmarks(dataDir)
  return benchmarks
}

const get = async function(dataDir, queryType, queryValue) {
  const benchmarks = await getBenchmarks(dataDir)
  const index = findBenchmark(benchmarks, queryType, queryValue)
  const benchmark = benchmarks[index]
  return benchmark
}

const add = async function(dataDir, benchmark) {
  const benchmarks = await getBenchmarks(dataDir)
  const benchmarksA = [...benchmarks, benchmark]
  await setBenchmarks(dataDir, benchmarksA)
}

const remove = async function(dataDir, id) {
  const benchmarks = await getBenchmarks(dataDir)
  const index = benchmarks.findIndex(benchmark => benchmark.id === id)
  const benchmarksA = [
    ...benchmarks.slice(0, index),
    ...benchmarks.slice(index + 1),
  ]
  await setBenchmarks(dataDir, benchmarksA)
}

export const file = { list, get, add, remove }
