import { getCombinations } from './combination/main.js'
import { addResultInfo } from './info.js'
import { measureCombinations } from './measure/main.js'
import { startProgress, endProgress } from './progress/start_end.js'

// Perform a new benchmark
export const performBenchmark = async function (config) {
  const combinations = await getCombinations(config)

  const { progressState, progressId, onProgressError } = startProgress(
    combinations,
    config,
  )

  try {
    return await getPartialResult({
      combinations,
      progressState,
      onProgressError,
      config,
    })
  } finally {
    await endProgress(progressId, config)
  }
}

const getPartialResult = async function ({
  combinations,
  progressState,
  onProgressError,
  config,
}) {
  const combinationsA = await measureCombinations({
    combinations,
    config,
    progressState,
    onProgressError,
  })
  const partialResult = addResultInfo(combinationsA, { config })
  return partialResult
}
