import { getCombinations } from './combination/main.js'
import { addResultInfo } from './info.js'
import { measureCombinations } from './measure/main.js'
import { getStopState } from './measure/stop.js'
import { startProgress, endProgress } from './progress/start_end.js'

// Perform a new benchmark
export const performBenchmark = async function (config) {
  const combinations = await getCombinations(config)

  const stopState = getStopState()
  const { progressState, progressId, onProgressError } = startProgress(
    combinations,
    config,
  )

  try {
    const partialResult = await getPartialResult({
      combinations,
      stopState,
      progressState,
      onProgressError,
      config,
    })
    return { partialResult, stopped: stopState.stopped }
  } finally {
    await endProgress({ progressId, config })
  }
}

const getPartialResult = async function ({
  combinations,
  stopState,
  progressState,
  onProgressError,
  config,
}) {
  const combinationsA = await measureCombinations({
    combinations,
    config,
    stopState,
    progressState,
    onProgressError,
  })
  const partialResult = addResultInfo(combinationsA, config)
  return partialResult
}
