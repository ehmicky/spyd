import pMapSeries from 'p-map-series'
import pFinally from 'p-finally'

import { getOpts } from './options/main.js'
import { startProgress, stopProgress } from './progress/main.js'
import { getIterations } from './iterations/main.js'
import { runProcesses } from './processes/main.js'
import { addBenchmarkInfo } from './info/main.js'
import { report } from './report/main.js'
import { save } from './save/main.js'
import { remove } from './save/remove.js'
import { load } from './save/load.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
const spyd = async function(opts) {
  const optsA = await getOpts(opts)

  if (optsA.remove !== undefined) {
    return removeAction(optsA)
  }

  if (optsA.show !== undefined) {
    return showAction(optsA)
  }

  return runAction(optsA)
}

// Action when the 'remove' option is used: remove a previous benchmark
const removeAction = async function(opts) {
  await remove(opts.remove, opts)
}

// Action when the 'show' option is used: show a previous benchmark
const showAction = async function(opts) {
  const benchmark = await load(opts.show, opts)

  await report(benchmark, opts)

  return benchmark
}

// Main action: run new benchmarks.
const runAction = async function(opts) {
  const { iterations, versions } = await getIterations(opts)

  const benchmark = await runBenchmark({ iterations, opts, versions })

  await Promise.all([report(benchmark, opts), save(benchmark, opts)])

  return benchmark
}

const runBenchmark = async function({ iterations, opts, versions }) {
  const { progressState, progressInfo } = await startProgress(iterations, opts)

  // TODO: replace with `try {} finally {}` when dropping support for Node 8/9
  const benchmark = await pFinally(
    computeBenchmark({ iterations, progressState, opts, versions }),
    () => stopProgress(progressInfo),
  )
  return benchmark
}

const computeBenchmark = async function({
  iterations,
  progressState,
  opts,
  versions,
}) {
  const iterationsA = await pMapSeries(iterations, (iteration, index) =>
    runProcesses({ ...iteration, index, progressState, opts }),
  )
  const benchmark = addBenchmarkInfo({
    iterations: iterationsA,
    opts,
    versions,
  })
  return benchmark
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = spyd
