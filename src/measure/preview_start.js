import { listHistory } from '../history/main.js'
import { startPreviewRefresh, endPreviewRefresh } from '../preview/refresh.js'
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
  await setFirstPreview({ previewConfig, previewState })
  await startPreview(quiet)

  try {
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
  config: { cwd, duration, precision = duration, quiet },
  previewConfig,
  previewState,
}) {
  const previewId = await startPreviewRefresh(previewState, quiet)

  try {
    const results = await listHistory(config)
    const previewConfigA = { ...previewConfig, results }

    const combinationsA = await measureCombinations(combinations, {
      precision,
      cwd,
      previewConfig: previewConfigA,
      previewState,
    })
    return { combinations: combinationsA, results }
  } finally {
    await endPreviewRefresh(previewState, previewId, quiet)
  }
}

// Aborts behave like stops, i.e. last preview remains shown. This allows users
// to stop a benchmark without losing information.
// However failures only print the error message, i.e. clear the preview.
const handlePreviewError = async function (error, quiet) {
  if (error.name === 'StopError') {
    return
  }

  await endPreview(quiet)
}
