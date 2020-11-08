import { debugBenchmark } from './debug.js'
import { getOpts } from './options/main.js'
import { report } from './report/main.js'
import { runBenchmark } from './run.js'
import { addToStore } from './store/add.js'
import { destroyStore } from './store/destroy.js'
import { getFromStore } from './store/get.js'
import { migrateStore } from './store/migrate/main.js'
import { removeFromStore } from './store/remove.js'

// Benchmark JavaScript code defined in a benchmark file and report the results.
// Default action: run a new benchmark
export const run = async function (opts) {
  const optsA = await getOpts('run', opts)

  const rawBenchmark = await runBenchmark(optsA)

  const { mergeId, benchmarks } = await addToStore(rawBenchmark, optsA)

  const benchmarkA = await report(mergeId, benchmarks, optsA)

  await destroyStore(optsA)

  return benchmarkA
}

// Show a previous benchmark
export const show = async function (opts) {
  const { delta, ...optsA } = await getOpts('show', opts)

  const { mergeId, benchmarks } = await getFromStore(delta, optsA)

  const benchmarkA = await report(mergeId, benchmarks, optsA)

  await destroyStore(optsA)

  return benchmarkA
}

// Remove a previous benchmark
export const remove = async function (opts) {
  const { delta, ...optsA } = await getOpts('remove', opts)

  const { mergeId, rawBenchmarks } = await getFromStore(delta, optsA)

  await removeFromStore(mergeId, rawBenchmarks, optsA)

  await destroyStore(optsA)
}

// Run benchmark in debug mode
export const debug = async function (opts) {
  const optsA = await getOpts('debug', opts)

  await debugBenchmark(optsA)
}

// Migrate previous benchmarks
export const migrate = async function (opts) {
  const optsA = await getOpts('migrate', opts)

  await migrateStore(optsA)

  await destroyStore(optsA)
}
