import { getOpts } from './options/main.js'
import { report } from './report/main.js'
import { add } from './store/add.js'
import { get } from './store/get.js'
import { remove as removeFromStore } from './store/remove.js'
import { runBenchmark } from './run.js'
import { debugBenchmark } from './debug.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
// Default action: run a new benchmark
export const run = async function(opts) {
  const optsA = await getOpts('run', opts)

  const benchmark = await runBenchmark(optsA)

  const { group, benchmarks } = await add(benchmark, optsA)

  const benchmarkA = await report(group, benchmarks, optsA)
  return benchmarkA
}

// Show a previous benchmark
export const show = async function(opts) {
  const { show: showOpt, ...optsA } = await getOpts('show', opts)

  const { group, benchmarks } = await get(showOpt, optsA)

  const benchmarkA = await report(group, benchmarks, optsA)
  return benchmarkA
}

// Remove a previous benchmark
export const remove = async function(opts) {
  const { remove: removeOpt, ...optsA } = await getOpts('remove', opts)

  const { group, rawBenchmarks } = await get(removeOpt, optsA)

  await removeFromStore(group, rawBenchmarks, optsA)
}

// Run benchmark in debug mode
export const debug = async function(opts) {
  const optsA = await getOpts('debug', opts)

  await debugBenchmark(optsA)
}
