import pMapSeries from 'p-map-series'

import { startProgress } from './progress/start.js'
import { stopProgress } from './progress/stop.js'
import { getIterations } from './iterations/main.js'
import { runProcesses } from './processes/main.js'
import { addBenchmarkInfo } from './info.js'

// Run a new benchmark
export const runBenchmark = async function (opts) {
  const { iterations, versions } = await getIterations(opts)

  const { progressState, progressInfo } = await startProgress(iterations, opts)

  try {
    return await computeBenchmark({ iterations, progressState, opts, versions })
  } finally {
    await stopProgress(progressInfo)
  }
}

const computeBenchmark = async function ({
  iterations,
  progressState,
  opts,
  versions,
}) {
  const iterationsA = await pMapSeries(iterations, (iteration, index) =>
    runProcesses({ ...iteration, index, progressState, opts }),
  )
  const rawBenchmark = addBenchmarkInfo(iterationsA, { opts, versions })
  return rawBenchmark
}
