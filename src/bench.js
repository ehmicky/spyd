import { getCombinations } from './combination/main.js'
import { getInitResult, getFinalResult } from './measure/init.js'
import { measureBenchmark } from './measure/main.js'

// Perform a new benchmark
export const performBenchmark = async function (config, results) {
  const { combinations, systemVersions } = await getCombinations(config)
  const initResult = getInitResult({ combinations, systemVersions, config })
  const { combinations: combinationsA, stopped } = await measureBenchmark(
    combinations,
    config,
  )
  const { rawResult, result } = getFinalResult(
    combinationsA,
    initResult,
    results,
  )
  return { rawResult, result, stopped }
}
