import { getCombinations } from '../combination/main.js'
import { startPreview, endPreview } from '../preview/start_end.js'

import { getInitResult, getFinalResult } from './init.js'
import { measureBenchmark } from './main.js'

// Perform a new benchmark
export const performBenchmark = async function (config, results) {
  const { combinations, systemVersions } = await getCombinations(config)
  const initResult = getInitResult({ combinations, systemVersions, config })
  const { quiet, cwd, duration, reporters, titles } = config
  const { combinations: combinationsA, stopped } = await previewAndMeasure(
    combinations,
    {
      cwd,
      duration,
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

const previewAndMeasure = async function (
  combinations,
  { duration, cwd, exec, previewConfig },
) {
  const { previewState, previewId } = await startPreview({
    combinations,
    duration,
    previewConfig,
  })

  try {
    return await measureBenchmark(combinations, {
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
    })
  } finally {
    await endPreview(previewId)
  }
}
