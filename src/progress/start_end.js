import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { setDelayedDescription } from './set.js'
import { updateProgress, clearProgress } from './update.js'

// Start progress reporting using the `progress` configuration property
export const startProgress = async function (
  combinations,
  { duration, progress: reporters },
) {
  hideCursor()

  const progressState = {}
  const progressId = await startUpdate({
    reporters,
    combinations,
    duration,
    progressState,
  })
  setDelayedDescription(progressState, START_DESCRIPTION)
  return { progressState, progressId }
}

const START_DESCRIPTION = 'Starting...'

// Update progress at regular interval
const startUpdate = async function ({
  reporters,
  progressState,
  combinations,
  duration,
}) {
  const benchmarkDuration = combinations.length * duration
  const updateProgressBound = updateProgress.bind(undefined, {
    progressState,
    benchmarkDuration,
    reporters,
  })
  const progressId = setInterval(updateProgressBound, UPDATE_FREQUENCY)
  await updateProgressBound()
  return progressId
}

// How often (in milliseconds) to update progress
const UPDATE_FREQUENCY = 1e2

// End progress reporting
export const endProgress = async function (progressId) {
  clearInterval(progressId)
  await clearProgress()
  showCursor()
}
