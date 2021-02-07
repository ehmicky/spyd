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
  config: { cwd, duration },
  initResult,
}) {
  const { previewState, previewConfig, benchmarkDuration } = getPreviewConfig({
    combinations,
    config,
    initResult,
  })
  await setFirstPreview({ combinations, previewState, previewConfig })
  await startPreview(previewConfig, previewState)

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
