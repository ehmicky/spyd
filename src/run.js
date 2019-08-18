import pMapSeries from 'p-map-series'
import pFinally from 'p-finally'

import { startProgress, stopProgress } from './progress/main.js'
import { getIterations } from './iterations/main.js'
import { runProcesses } from './processes/main.js'
import { addBenchmarkInfo } from './info/main.js'

// Run a new benchmark
export const runBenchmark = async function(opts) {
  const { iterations, versions } = await getIterations(opts)

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
  const benchmark = addBenchmarkInfo(iterationsA, { opts, versions })
  return benchmark
}
