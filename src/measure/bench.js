import { getCombinations } from '../combination/main.js'
import { listHistory } from '../history/main.js'
import {
  startPreviewInterval,
  endPreviewInterval,
} from '../preview/interval.js'
import { setPreviewReport } from '../preview/report.js'
import { startPreview } from '../preview/start_end.js'

import { getInitResult, getFinalResult } from './init.js'
import { measureBenchmark } from './main.js'
import { addInitProps } from './props.js'

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
  config: { quiet, cwd, duration, reporters, titles },
  initResult,
}) {
  const previewState = {}
  const previewConfig = { quiet, initResult, results: [], reporters, titles }

  await setFirstPreview({ combinations, previewState, previewConfig })
  await startPreview(previewConfig, previewState)

  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  const previewId = await startPreviewInterval({
    previewConfig,
    previewState,
    benchmarkDuration,
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
      previewConfig,
      previewState,
      previewId,
      benchmarkDuration,
    })
  }
}

const setFirstPreview = async function ({
  combinations,
  previewState,
  previewConfig,
}) {
  const combinationsA = combinations.map(addInitProps)
  await setPreviewReport({
    combinations: combinationsA,
    previewState,
    previewConfig,
  })
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
}
