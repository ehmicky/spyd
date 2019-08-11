import { findBenchmark } from '../../find.js'

import { getBenchmarks, setBenchmarks } from './fs.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dataDir/data.json`
const list = async function(dataDir) {
  const { benchmarks } = await getBenchmarks(dataDir)
  return benchmarks
}

const get = async function(dataDir, queryType, queryValue) {
  const { benchmarks } = await getBenchmarks(dataDir)
  const index = findBenchmark(benchmarks, queryType, queryValue)
  const benchmark = benchmarks[index]
  return benchmark
}

const add = async function(dataDir, benchmark) {
  const { dataFile, benchmarks } = await getBenchmarks(dataDir)
  const benchmarksA = [...benchmarks, benchmark]
  await setBenchmarks(dataFile, benchmarksA)
}

const remove = async function(dataDir, queryType, queryValue) {
  const { dataFile, benchmarks } = await getBenchmarks(dataDir)
  const index = findBenchmark(benchmarks, queryType, queryValue)
  const benchmarksA = [
    ...benchmarks.slice(0, index),
    ...benchmarks.slice(index + 1),
  ]
  await setBenchmarks(dataFile, benchmarksA)
}

export const file = { list, get, add, remove }
