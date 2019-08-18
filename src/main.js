import { getOpts } from './options/main.js'
import { normalizeJob } from './jobs/normalize.js'
import { report } from './report/main.js'
import { list } from './store/list.js'
import { save } from './store/save.js'
import { remove } from './store/remove.js'
import { get } from './store/get.js'
import { runBenchmark } from './run.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
const spyd = async function(opts) {
  const { remove: removeOpt, show: showOpt, ...optsA } = await getOpts(opts)

  if (removeOpt !== undefined) {
    return removeAction(removeOpt, optsA)
  }

  if (showOpt !== undefined) {
    return showAction(showOpt, optsA)
  }

  return runAction(optsA)
}

// Action when the 'remove' option is used: remove a previous benchmark
const removeAction = async function(removeOpt, opts) {
  const benchmarks = await list(opts)
  await remove(benchmarks, removeOpt, opts)
}

// Action when the 'show' option is used: show a previous benchmark
const showAction = async function(showOpt, opts) {
  const benchmarks = await list(opts)
  const benchmark = get(benchmarks, showOpt, opts)

  const benchmarkA = await report(benchmarks, benchmark, {
    ...opts,
    show: true,
  })
  return benchmarkA
}

// Default action: run a new benchmark
const runAction = async function(opts) {
  const benchmarks = await list(opts)
  const optsA = normalizeJob(benchmarks, opts)

  const benchmark = await runBenchmark(optsA)

  const [benchmarkB] = await Promise.all([
    report(benchmarks, benchmark, optsA),
    save(benchmark, optsA),
  ])
  return benchmarkB
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = spyd
