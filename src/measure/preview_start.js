import { listHistory } from '../history/main.js'
import { startPreview, endPreview } from '../preview/start_end.js'

import { initPreview, setFirstPreview } from './preview_report.js'
import { measureCombinations } from './several.js'

// Start preview then measure benchmark
export const previewStartAndMeasure = async function ({
  combinations,
  config,
  config: { quiet },
  initResult,
}) {
  const { previewConfig, previewState } = initPreview(
    initResult,
    config,
    combinations,
  )
  await startPreview(quiet)

  try {
    await setFirstPreview({ previewConfig, previewState })

    return await previewRefreshAndMeasure({
      combinations,
      config,
      previewConfig,
      previewState,
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
  previewState,
}) {
  const results = await listHistory(config)
  const previewConfigA = { ...previewConfig, results }

  const combinationsA = await measureCombinations(combinations, {
    precisionTarget,
    cwd,
    previewConfig: previewConfigA,
    previewState,
  })
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
