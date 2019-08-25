import { show as showCursor } from 'cli-cursor'

import { stopUpdate } from './update.js'

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
