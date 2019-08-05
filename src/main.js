import pMapSeries from 'p-map-series'
import pFinally from 'p-finally'

import { getOpts } from './options/main.js'
import { startProgress, stopProgress } from './progress/main.js'
import { getIterations } from './tasks/iterations.js'
import { runProcesses } from './processes/main.js'
import { addBenchmarkInfo } from './info/main.js'
import { report } from './report/main.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
const spyd = async function(opts) {
  const optsA = await getOpts(opts)

  const iterations = await getIterations(optsA)

  const benchmark = await waitForBenchmark(iterations, optsA)

  await report(benchmark, optsA)

  return benchmark
}

const waitForBenchmark = async function(iterations, opts) {
  const { progressState, progressInfo } = await startProgress(iterations, opts)

  // TODO: replace with `try {} finally {}` when dropping support for Node 8/9
  const benchmark = await pFinally(
    getBenchmark({ iterations, progressState, opts }),
    () => stopProgress(progressInfo),
  )
  return benchmark
}

const getBenchmark = async function({ iterations, progressState, opts }) {
  const iterationsA = await pMapSeries(iterations, (iteration, index) =>
    runProcesses({ ...iteration, index, progressState }),
  )
  const benchmark = { iterations: iterationsA }
  const benchmarkA = addBenchmarkInfo({ benchmark, opts })
  return benchmarkA
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = spyd
