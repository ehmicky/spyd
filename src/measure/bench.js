import { getInitResult, getFinalResult } from './init.js'
import { previewStartAndMeasure } from './preview_start.js'

// Perform a new benchmark
export const performBenchmark = async function (
  config,
  combinations,
  systemVersions,
) {
  const initResult = getInitResult({ combinations, systemVersions, config })
  const {
    combinations: combinationsA,
    results,
  } = await previewStartAndMeasure({ combinations, config, initResult })
  const { rawResult, result } = getFinalResult(
    combinationsA,
    initResult,
    results,
  )
  return { rawResult, result }
}
