import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { setPreviewReport } from './report.js'
import { setDelayedDescription } from './set.js'
import { updatePreview, clearPreviewInit, clearPreview } from './update.js'

// Start preview
export const startPreview = async function ({
  combinations,
  duration,
  previewConfig,
  previewConfig: { quiet },
}) {
  const previewState = {}

  if (quiet) {
    return { previewState, previewConfig }
  }

  await setPreviewReport(combinations, { previewState, previewConfig })
  const benchmarkDuration = getBenchmarkDuration(combinations, duration)

  hideCursor()
  await clearPreviewInit()

  const previewId = await startUpdate(previewState, benchmarkDuration)
  setDelayedDescription(previewState, START_DESCRIPTION)
  return { previewState, previewConfig, previewId }
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
}

// Update preview at regular interval
const startUpdate = async function (previewState, benchmarkDuration) {
  await updatePreview(previewState, benchmarkDuration)
  const previewId = setInterval(() => {
    updatePreview(previewState, benchmarkDuration)
  }, UPDATE_FREQUENCY)
  return previewId
}

// How often (in milliseconds) to update preview
const UPDATE_FREQUENCY = 1e2

const START_DESCRIPTION = 'Starting...'

// End preview.
// When stopped, we keep the last preview.
export const endPreview = async function (previewId) {
  if (previewId === undefined) {
    return
  }

  clearInterval(previewId)
  await clearPreview()
  showCursor()
}
