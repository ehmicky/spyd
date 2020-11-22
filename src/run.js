import pMapSeries from 'p-map-series'

import { getCombinations } from './combination/main.js'
import { addResultInfo } from './info.js'
import { getCombinationResult } from './measure/main.js'
import { startProgress } from './progress/start.js'
import { stopProgress } from './progress/stop.js'

// Perform a new run
export const performRun = async function (opts) {
  const { combinations, versions } = await getCombinations(opts)

  const { progressState, progressInfo } = await startProgress(
    combinations,
    opts,
  )

  try {
    return await getPartialResult({
      combinations,
      progressState,
      opts,
      versions,
    })
  } finally {
    await stopProgress(progressInfo)
  }
}

const getPartialResult = async function ({
  combinations,
  progressState,
  opts,
  versions,
}) {
  const combinationsA = await pMapSeries(combinations, (combination, index) =>
    getCombinationResult({ ...combination, index, progressState, opts }),
  )
  const partialResult = addResultInfo(combinationsA, { opts, versions })
  return partialResult
}
