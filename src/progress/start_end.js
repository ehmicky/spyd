import { hide as hideCursor, show as showCursor } from 'cli-cursor'

import { setDelayedDescription } from './set.js'
import { isSilent } from './silent.js'
import { updateProgress, clearProgressFinal } from './update.js'

// Start progress reporting using the `progress` configuration property
export const startProgress = function (combinations, { duration, progresses }) {
  const progressState = {}

  if (isSilent(progresses)) {
    return { progressState, onProgressError: [] }
  }

  hideCursor()

  const { progressId, onProgressError } = startUpdate({
    progresses,
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
  progresses,
  progressState,
  combinations,
  duration,
}) {
  // eslint-disable-next-line fp/no-let, init-declarations
  let progressId
  // eslint-disable-next-line promise/avoid-new
  const onProgressError = new Promise((resolve, reject) => {
    // eslint-disable-next-line fp/no-mutation
    progressId = setInterval(() => {
      updateProgress({
        progressState,
        combinations,
        duration,
        progresses,
        initial: false,
      }).catch(reject)
    }, UPDATE_FREQUENCY)

    updateProgress({
      progressState,
      combinations,
      duration,
      progresses,
      initial: true,
    }).catch(reject)
  })
  return { progressId, onProgressError }
}

// How often (in milliseconds) to update progress
const UPDATE_FREQUENCY = 1e2

// End progress reporting.
// When stopped, we keep the progress reporting.
export const endProgress = async function ({
  progressId,
  config: { progresses },
}) {
  if (isSilent(progresses)) {
    return
  }

  clearInterval(progressId)
  await clearProgressFinal()
  showCursor()
}
