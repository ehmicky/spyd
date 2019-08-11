import pMapSeries from 'p-map-series'
import pFinally from 'p-finally'

import { getOpts } from './options/main.js'
import { startProgress, stopProgress } from './progress/main.js'
import { getIterations } from './iterations/main.js'
import { runProcesses } from './processes/main.js'
import { addBenchmarkInfo } from './info/main.js'
import { report } from './report/main.js'
import { save } from './save/main.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
const spyd = async function(opts) {
  const optsA = await getOpts(opts)

  const { iterations, versions } = await getIterations(optsA)

  const benchmark = await getBenchmark({ iterations, opts: optsA, versions })

  await Promise.all([report(benchmark, optsA), save(benchmark, optsA)])

  return benchmark
}

const getBenchmark = async function({ iterations, opts, versions }) {
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
