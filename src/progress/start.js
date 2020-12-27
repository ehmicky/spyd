import { hide as hideCursor } from 'cli-cursor'
import onExit from 'signal-exit'

import { endProgress } from './end.js'
import { setDelayedDescription } from './set.js'
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
  setDelayedDescription(progressState, START_DESCRIPTION)

  const removeOnExit = onExit(() => endProgress({ progressId, reporters }))

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

const START_DESCRIPTION = 'Starting...'
