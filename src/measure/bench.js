import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import { startPreviewRefresh, endPreviewRefresh } from '../preview/refresh.js'
import { startPreview } from '../preview/start_end.js'

import { getInitResult, getFinalResult } from './init.js'
import { measureBenchmark } from './main.js'
import { getPreviewConfig, setFirstPreview } from './preview.js'

// Perform a new benchmark
export const performBenchmark = async function (config) {
  const { combinations, systemVersions } = await getCombinations(config)
  const initResult = getInitResult({ combinations, systemVersions, config })
  const {
    combinations: combinationsA,
    stopped,
    results,
  } = await previewStartAndMeasure({ combinations, config, initResult })
  const { rawResult, result } = getFinalResult(
    combinationsA,
    initResult,
    results,
  )
  return { rawResult, result, stopped }
}

const previewStartAndMeasure = async function ({
  combinations,
  config,
  config: { quiet },
  initResult,
}) {
  const { previewConfig, previewState } = getPreviewConfig(initResult, config)
  await setFirstPreview({ combinations, previewConfig, previewState })
  await startPreview(quiet)

  return await previewRefreshAndMeasure({
    combinations,
    config,
    previewConfig,
    previewState,
  })
}

const previewRefreshAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, duration, quiet },
  previewConfig,
  previewState,
}) {
  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  const previewId = await startPreviewRefresh({
    previewState,
    benchmarkDuration,
    quiet,
  })

  try {
    const results = await listHistory(config)
    const previewConfigA = { ...previewConfig, results }

    const { combinations: combinationsA, stopped } = await measureBenchmark(
      combinations,
      {
        duration,
        cwd,
        previewConfig: previewConfigA,
        previewState,
        exec: false,
      },
    )
    return { combinations: combinationsA, stopped, results }
  } finally {
    await endPreviewRefresh({
      previewState,
      previewId,
      benchmarkDuration,
      quiet,
    })
  }
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
}
