import { getOpts } from './options/main.js'
import { report } from './report/main.js'
import { add } from './store/add.js'
import { get } from './store/get.js'
import { remove as removeFromStore } from './store/remove.js'
import { runBenchmark } from './run.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
// Default action: run a new benchmark
export const run = async function(opts) {
  const optsA = await getOpts(opts)

  const benchmark = await runBenchmark(optsA)

  const { job, benchmarks } = await add(benchmark, optsA)

  const benchmarkA = await report(job, benchmarks, { ...optsA, show: false })
  return benchmarkA
}

// Show a previous benchmark
export const show = async function(opts) {
  const { show: showOpt, ...optsA } = await getOpts(opts)

  const { job, benchmarks } = await get(showOpt, optsA)

  const benchmarkA = await report(job, benchmarks, { ...optsA, show: true })
  return benchmarkA
}

// Remove a previous benchmark
export const remove = async function(opts) {
  const { remove: removeOpt, ...optsA } = await getOpts(opts)

  const { job } = await get(removeOpt, optsA)

  await removeFromStore(job, optsA)
}
