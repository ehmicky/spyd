import pMapSeries from 'p-map-series'

import { getCombinations } from './combination/main.js'
import { addBenchmarkInfo } from './info.js'
import { measureCombination } from './measure/main.js'
import { startProgress } from './progress/start.js'
import { stopProgress } from './progress/stop.js'

// Run a new benchmark
export const runBenchmark = async function (opts) {
  const { combinations, versions } = await getCombinations(opts)

  const { progressState, progressInfo } = await startProgress(
    combinations,
    opts,
  )

  try {
    return await computeBenchmark({
      combinations,
      progressState,
      opts,
      versions,
    })
  } finally {
    await stopProgress(progressInfo)
  }
}

const computeBenchmark = async function ({
  combinations,
  progressState,
  opts,
  versions,
}) {
  const combinationsA = await pMapSeries(combinations, (combination, index) =>
    measureCombination({ ...combination, index, progressState, opts }),
  )
  const rawBenchmark = addBenchmarkInfo(combinationsA, { opts, versions })
  return rawBenchmark
}
