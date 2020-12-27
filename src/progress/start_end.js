import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { setDelayedDescription } from './set.js'
import { updateProgress, clearProgress } from './update.js'

// Start progress reporting using the `progress` configuration property
export const startProgress = function (
  combinations,
  { duration, progress: reporters, quiet },
) {
  const progressState = {}

  if (quiet) {
    return { progressState, onProgressError: [] }
  }

  hideCursor()

  const { progressId, onProgressError } = startUpdate({
    reporters,
    combinations,
    duration,
    progressState,
  })
  setDelayedDescription(progressState, START_DESCRIPTION)
  return { progressState, progressId, onProgressError: [onProgressError] }
}

const START_DESCRIPTION = 'Starting...'

// Update progress at regular interval
const startUpdate = function ({
  reporters,
  progressState,
  combinations,
  duration,
}) {
  const benchmarkDuration = combinations.length * duration
  // eslint-disable-next-line fp/no-let, init-declarations
  let progressId
  // eslint-disable-next-line promise/avoid-new
  const onProgressError = new Promise((resolve, reject) => {
    // eslint-disable-next-line fp/no-mutation
    progressId = setInterval(() => {
      updateProgress({
        progressState,
        benchmarkDuration,
        reporters,
        initial: false,
      }).catch(reject)
    }, UPDATE_FREQUENCY)

    updateProgress({
      progressState,
      benchmarkDuration,
      reporters,
      initial: true,
    }).catch(reject)
  })
  return { progressId, onProgressError }
}

// How often (in milliseconds) to update progress
const UPDATE_FREQUENCY = 1e2

// End progress reporting
export const endProgress = async function (progressId, { quiet }) {
  if (quiet) {
    return
  }

  clearInterval(progressId)
  await clearProgress({ initial: false, final: true })
  showCursor()
}
