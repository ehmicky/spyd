import pMapSeries from 'p-map-series'

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

  const { progressState, progressInfo } = await startProgress({
    iterations,
    opts: optsA,
  })

  const benchmark = await getBenchmark({
    iterations,
    progressState,
    opts: optsA,
  })

  const benchmarkA = addBenchmarkInfo(benchmark)

  await stopProgress(progressInfo)

  await report(benchmarkA, optsA)

  return benchmarkA
}

const getBenchmark = async function({ iterations, progressState, opts }) {
  const tasks = await pMapSeries(iterations, (iteration, index) =>
    runProcesses({ ...iteration, index, progressState }),
  )
  return { tasks, opts }
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = spyd
