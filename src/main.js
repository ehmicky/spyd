import { getOpts } from './options/main.js'
import { addJob } from './jobs/options.js'
import { report } from './report/main.js'
import { list } from './store/list.js'
import { save } from './store/save.js'
import { remove as removeFromStore } from './store/remove.js'
import { get } from './store/get.js'
import { runBenchmark } from './run.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
// Default action: run a new benchmark
export const run = async function(opts) {
  const optsA = await getOpts(opts)

  const benchmark = await runBenchmark(optsA)

  const benchmarks = await list(optsA)
  const benchmarkA = addJob(benchmarks, benchmark, optsA)

  const [benchmarkB] = await Promise.all([
    report(benchmarks, benchmarkA, optsA),
    save(benchmarkA, optsA),
  ])
  return benchmarkB
}

// Show a previous benchmark
export const show = async function(opts) {
  const { show: showOpt, ...optsA } = await getOpts(opts)

  const benchmarks = await list(optsA)
  const benchmark = get(benchmarks, showOpt)

  const benchmarkA = await report(benchmarks, benchmark, {
    ...optsA,
    show: true,
  })
  return benchmarkA
}

// Remove a previous benchmark
export const remove = async function(opts) {
  const { remove: removeOpt, ...optsA } = await getOpts(opts)

  const benchmarks = await list(optsA)
  await removeFromStore(benchmarks, removeOpt, optsA)
}
