import { stderr } from 'process'

import { hide as hideCursor, show as showCursor } from 'cli-cursor'
import isInteractive from 'is-interactive'

import { setDelayedDescription } from './set.js'
import { updateProgress, clearProgressFinal } from './update.js'

// Start progress reporting
export const startProgress = function ({ combinations, duration, preview }) {
  const progressState = {}

  if (isSilent(preview)) {
    return { progressState }
  }

  hideCursor()

  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  const progressId = startUpdate(progressState, benchmarkDuration)
  setDelayedDescription(progressState, START_DESCRIPTION)
  return { progressState, progressId }
}

const isSilent = function (preview) {
  return !preview || !isInteractive(stderr)
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
}

// Update progress at regular interval
const startUpdate = function (progressState, benchmarkDuration) {
  updateProgress({ progressState, benchmarkDuration, initial: true })
  const progressId = setInterval(() => {
    updateProgress({ progressState, benchmarkDuration, initial: false })
  }, UPDATE_FREQUENCY)
  return progressId
}

// How often (in milliseconds) to update progress
const UPDATE_FREQUENCY = 1e2

const START_DESCRIPTION = 'Starting...'

// End progress reporting.
// When stopped, we keep the progress reporting.
export const endProgress = async function (progressId) {
  if (progressId === undefined) {
    return
  }

  clearInterval(progressId)
  await clearProgressFinal()
  showCursor()
}
