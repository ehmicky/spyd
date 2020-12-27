import { show as showCursor } from 'cli-cursor'

import { endUpdate } from './update.js'

// End progress reporting
export const endProgress = async function ({
  progressId,
  reporters,
  removeOnExit,
}) {
  if (removeOnExit !== undefined) {
    removeOnExit()
  }

  endUpdate(progressId)

  await endReporters(reporters)

  showCursor()
}

// Call each `reporter.end()`
const endReporters = async function (reporters) {
  await Promise.all(reporters.map((reporter) => reporter.end({})))
}
