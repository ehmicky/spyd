import { hide as hideCursor } from 'cli-cursor'
import onExit from 'signal-exit'

import { setDelayedDescription } from './set.js'
import { stopProgress } from './stop.js'
import { startUpdate } from './update.js'

// Start progress reporting using the `progress` configuration property
export const startProgress = async function (
  combinations,
  { duration, progress: reporters },
) {
  hideCursor()

  await startReporters(reporters)

  const benchmarkDuration = combinations.length * duration
  const { progressState, progressId } = startUpdate(
    reporters,
    benchmarkDuration,
  )
  setStartDescription(progressState)

  const removeOnExit = onExit(() => stopProgress({ progressId, reporters }))

  return {
    progressState,
    progressInfo: { progressId, reporters, removeOnExit },
  }
}

// Call each `reporter.start()`
const startReporters = async function (reporters) {
  await Promise.all(reporters.map(startReporter))
}

const startReporter = async function (reporter) {
  await reporter.start({})
}

const setStartDescription = function (progressState) {
  setDelayedDescription(
    progressState,
    START_DESCRIPTION,
    START_DESCRIPTION_DELAY,
  )
}

const START_DESCRIPTION = 'Starting...'
const START_DESCRIPTION_DELAY = 1e3
