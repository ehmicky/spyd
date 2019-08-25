import { getOpts } from './options/main.js'
import { report } from './report/main.js'
import { addToStore } from './store/add.js'
import { getFromStore } from './store/get.js'
import { removeFromStore } from './store/remove.js'
import { migrateStore } from './store/migrate.js'
import { destroyStore } from './store/destroy.js'
import { runBenchmark } from './run.js'
import { debugBenchmark } from './debug.js'

// Benchmark JavaScript code defined in a benchmark file and report the results.
// Default action: run a new benchmark
export const run = async function(opts) {
  const optsA = await getOpts('run', opts)

  const benchmark = await runBenchmark(optsA)

  const { group, benchmarks } = await addToStore(benchmark, optsA)

  const benchmarkA = await report(group, benchmarks, optsA)

  await destroyStore(optsA)

  return benchmarkA
}

// Show a previous benchmark
export const show = async function(opts) {
  const { show: showOpt, ...optsA } = await getOpts('show', opts)

  const { group, benchmarks } = await getFromStore(showOpt, optsA)

  const benchmarkA = await report(group, benchmarks, optsA)

  await destroyStore(optsA)

  return benchmarkA
}

// Remove a previous benchmark
export const remove = async function(opts) {
  const { remove: removeOpt, ...optsA } = await getOpts('remove', opts)

  const { group, rawBenchmarks } = await getFromStore(removeOpt, optsA)

  await removeFromStore(group, rawBenchmarks, optsA)

  await destroyStore(optsA)
}

// Run benchmark in debug mode
export const debug = async function(opts) {
  const optsA = await getOpts('debug', opts)

  await debugBenchmark(optsA)

  await destroyStore(optsA)
}

// Migrate previous benchmarks
export const migrate = async function(opts) {
  const optsA = await getOpts('migrate', opts)

  await migrateStore(optsA)

  await destroyStore(optsA)
}
