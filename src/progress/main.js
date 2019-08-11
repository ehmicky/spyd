import { show as showCursor, hide as hideCursor } from 'cli-cursor'
import onExit from 'signal-exit'

import { startUpdate, stopUpdate } from './update.js'

// Start progress reporting using the `progress` option
export const startProgress = async function(
  iterations,
  { duration, progress: reporters },
) {
  const total = iterations.length

  hideCursor()

  await startReporters(reporters, total)

  const { progressState, progressId } = startUpdate({
    total,
    duration,
    reporters,
  })

  const removeOnExit = onExit(() => stopProgress({ progressId, reporters }))

  return {
    progressState,
    progressInfo: { progressId, reporters, removeOnExit },
  }
}

// Call each `reporter.start()`
const startReporters = async function(reporters, total) {
  await Promise.all(reporters.map(reporter => reporter.start({ total })))
}

// Stop progress reporting
export const stopProgress = async function({
  progressId,
  reporters,
  removeOnExit,
}) {
  if (removeOnExit !== undefined) {
    removeOnExit()
  }

  stopUpdate(progressId)

  await stopReporters(reporters)

  showCursor()
}

// Call each `reporter.stop()`
const stopReporters = async function(reporters) {
  await Promise.all(reporters.map(reporter => reporter.stop({})))
}
