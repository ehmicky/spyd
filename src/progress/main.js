import { show as showCursor, hide as hideCursor } from 'cli-cursor'

import { getReporters } from './get.js'
import { startUpdate, stopUpdate } from './update.js'

// Start progress reporting using the `progress` option
export const startProgress = async function(
  iterations,
  { duration, progressOpts },
) {
  const total = iterations.length

  hideCursor()

  const reporters = getReporters(progressOpts)
  await startReporters(reporters, total)

  const { progressState, progressId } = startUpdate({
    total,
    duration,
    reporters,
  })

  return { progressState, progressInfo: { progressId, reporters } }
}

// Call each `reporter.start()`
const startReporters = async function(reporters, total) {
  const promises = reporters.map(reporter => reporter.start({ total }))
  await Promise.all(promises)
}

// Stop progress reporting
export const stopProgress = async function({ progressId, reporters }) {
  stopUpdate(progressId)

  await stopReporters(reporters)

  showCursor()
}

// Call each `reporter.stop()`
const stopReporters = async function(reporters) {
  const promises = reporters.map(reporter => reporter.stop({}))
  await Promise.all(promises)
}
