import pMapSeries from 'p-map-series'

import { addBenchmarkInfo } from './info.js'
import { getIterations } from './iterations/main.js'
import { measureIteration } from './measure/main.js'
import { startProgress } from './progress/start.js'
import { stopProgress } from './progress/stop.js'

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
    measureIteration({ ...iteration, index, progressState, opts }),
  )
  const rawBenchmark = addBenchmarkInfo(iterationsA, { opts, versions })
  return rawBenchmark
}
