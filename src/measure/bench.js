import { getCombinations } from '../combination/main.js'

import { getInitResult, getFinalResult } from './init.js'
import { measureBenchmark } from './main.js'

// Perform a new benchmark
export const performBenchmark = async function (config, results) {
  const { combinations, systemVersions } = await getCombinations(config)
  const initResult = getInitResult({ combinations, systemVersions, config })
  const { quiet, cwd, duration, reporters, titles } = config
  const { combinations: combinationsA, stopped } = await measureBenchmark(
    combinations,
    { cwd, duration },
    {
      previewConfig: { quiet, initResult, results, reporters, titles },
      exec: false,
    },
  )
  const { rawResult, result } = getFinalResult(
    combinationsA,
    initResult,
    results,
  )
  return { rawResult, result, stopped }
}
