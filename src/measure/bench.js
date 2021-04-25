import { listHistory } from '../history/main.js'
import { startPreview, endPreview } from '../preview/start_end.js'

import { getInitResult, getFinalResult } from './init.js'
import { initPreview, setFirstPreview } from './preview_report.js'
import { measureCombinations } from './several.js'

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

// Start preview then measure benchmark
const previewStartAndMeasure = async function ({
  combinations,
  config,
  config: { quiet },
  initResult,
}) {
  const previewConfig = initPreview(initResult, config, combinations)
  await startPreview(quiet)

  try {
    const previewConfigA = await setFirstPreview(previewConfig)

    return await previewRefreshAndMeasure({
      combinations,
      config,
      previewConfig: previewConfigA,
    })
  } catch (error) {
    await handlePreviewError(error, quiet)
    throw error
  }
}

// Start preview refresh then measure benchmark
const previewRefreshAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, precisionTarget },
  previewConfig,
}) {
  const results = await listHistory(config)
  const previewConfigA = { ...previewConfig, results }

  const { combinations: combinationsA } = await measureCombinations(
    combinations,
    {
      precisionTarget,
      cwd,
      previewConfig: previewConfigA,
    },
  )
  return { combinations: combinationsA, results }
}

// The last preview is kept as is when stopping the benchmarking
//  - This allows users to stop a benchmark without losing information,
//    including the duration that was left
//  - This is unlike other errors, which clear it
const handlePreviewError = async function (error, quiet) {
  if (error.name === 'StopError') {
    return
  }

  await endPreview(quiet)
}
