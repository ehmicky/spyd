import { getCombinations } from './combination/main.js'
import { addResultInfo } from './info.js'
import { measureCombinations } from './measure/main.js'
import { startProgress, endProgress } from './progress/start_end.js'

// Perform a new benchmark
export const performBenchmark = async function (config) {
  const combinations = await getCombinations(config)

  const { progressState, progressId } = await startProgress(
    combinations,
    config,
  )

  try {
    return await getPartialResult({ combinations, progressState, config })
  } finally {
    await endProgress(progressId)
  }
}

const getPartialResult = async function ({
  combinations,
  progressState,
  config,
}) {
  const combinationsA = await measureCombinations({
    combinations,
    config,
    progressState,
  })
  const partialResult = addResultInfo(combinationsA, { config })
  return partialResult
}
