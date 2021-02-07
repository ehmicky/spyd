import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import {
  startPreviewInterval,
  endPreviewInterval,
} from '../preview/interval.js'
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
  } = await previewAndMeasure({ combinations, config, initResult })
  const { rawResult, result } = getFinalResult(
    combinationsA,
    initResult,
    results,
  )
  return { rawResult, result, stopped }
}

const previewAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, duration, quiet },
  initResult,
}) {
  const { previewState, previewConfig } = getPreviewConfig(initResult, config)
  await setFirstPreview({ combinations, previewState, previewConfig })
  await startPreview(quiet)

  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  const previewId = await startPreviewInterval({
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
    await endPreviewInterval({
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
