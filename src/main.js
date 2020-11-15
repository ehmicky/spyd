import { debugBenchmark } from './debug.js'
import { getOpts } from './options/main.js'
import { report } from './report/main.js'
import { runBenchmark } from './run.js'
import { addToStore } from './store/add.js'
import { endStore } from './store/end.js'
import { getFromStore } from './store/get.js'
import { removeFromStore } from './store/remove.js'
import { startStore } from './store/start.js'

// Benchmark JavaScript code defined in a benchmark file and report the results.
// Default action: run a new benchmark
export const run = async function (opts) {
  const optsA = await getOpts('run', opts)
  const optsB = await startStore(optsA)

  try {
    const rawBenchmark = await runBenchmark(optsB)
    const { mergeId, benchmarks } = await addToStore(rawBenchmark, optsB)
    const benchmark = await report(mergeId, benchmarks, optsB)
    return benchmark
  } finally {
    await endStore(optsB)
  }
}

// Show a previous benchmark
export const show = async function (opts) {
  const { delta, ...optsA } = await getOpts('show', opts)
  const optsB = await startStore(optsA)

  try {
    const { mergeId, benchmarks } = await getFromStore(delta, optsB)
    const benchmark = await report(mergeId, benchmarks, optsB)
    return benchmark
  } finally {
    await endStore(optsB)
  }
}

// Remove a previous benchmark
export const remove = async function (opts) {
  const { delta, ...optsA } = await getOpts('remove', opts)
  const optsB = await startStore(optsA)

  try {
    const { mergeId, rawBenchmarks } = await getFromStore(delta, optsB)
    await removeFromStore(mergeId, rawBenchmarks, optsB)
  } finally {
    await endStore(optsA)
  }
}

// Run benchmark in debug mode
export const debug = async function (opts) {
  const optsA = await getOpts('debug', opts)

  await debugBenchmark(optsA)
}
