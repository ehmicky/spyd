import { addInitProps } from '../measure/props.js'

import { initPreview } from './init.js'
import { setPreviewReport } from './report.js'
import { setDelayedDescription } from './set.js'
import { firstPreview, updatePreview } from './update.js'

// Start preview
export const startPreview = async function ({
  combinations,
  duration,
  previewConfig,
  previewConfig: { quiet },
}) {
  const previewState = {}

  if (quiet) {
    return { previewState }
  }

  initPreview()

  const combinationsA = combinations.map(addInitProps)
  await setPreviewReport({
    combinations: combinationsA,
    previewState,
    previewConfig,
  })
  const benchmarkDuration = getBenchmarkDuration(combinationsA, duration)

  const previewId = await startUpdate(previewState, benchmarkDuration)
  setDelayedDescription(previewState, START_DESCRIPTION)
  return { previewState, previewId }
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
}

// Update preview at regular interval
const startUpdate = async function (previewState, benchmarkDuration) {
  await firstPreview(previewState, benchmarkDuration)
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
// We do not clear the preview so that we can decide whether to clear later:
//  - When succeeding, we wait for the final reporter.report() before clearing
//  - When stopping or aborting, we keep the last preview
//  - When failing, we clear it
export const endPreview = function (previewId) {
  if (previewId === undefined) {
    return
  }

  clearInterval(previewId)
}
