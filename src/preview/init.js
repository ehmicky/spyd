import { addInitProps } from '../measure/props.js'

import { setPreviewReport } from './report.js'
import { setDelayedDescription } from './set.js'
import { startPreview } from './start_end.js'
import { updatePreview } from './update.js'

// Start preview
export const initPreview = async function ({
  combinations,
  duration,
  previewConfig,
  previewConfig: { quiet },
}) {
  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  const previewState = {}

  if (quiet) {
    return { previewState, benchmarkDuration }
  }

  await setFirstPreview({ combinations, previewState, previewConfig })
  await startPreview()
  await updatePreview(previewState, benchmarkDuration)

  setDelayedDescription(previewState, START_DESCRIPTION)
  return { previewState, benchmarkDuration }
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
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

const START_DESCRIPTION = 'Starting...'
