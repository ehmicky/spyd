import { show as showCursor, hide as hideCursor } from 'cli-cursor'

import { now } from '../now.js'

import { PROGRESS_REPORTERS } from './reporters/main.js'

// Start progress reporting using the `progress` option
export const startProgress = async function({
  iterations,
  opts: { duration },
}) {
  hideCursor()

  const total = iterations.length

  const reporters = [PROGRESS_REPORTERS.debug]
  await startReporters(reporters, total)

  const progressState = {}
  const progressId = setInterval(
    () => updateProgress({ progressState, total, duration, reporters }),
    FREQUENCY,
  )

  return { progressState, progressInfo: { progressId, reporters } }
}

const FREQUENCY = 1e2

// Call each `reporter.start()`
const startReporters = async function(reporters, total) {
  const promises = reporters.map(reporter => reporter.start({ total }))
  await Promise.all(promises)
}

// Called at regular interval
const updateProgress = async function({
  progressState: { index, runEnd, title },
  total,
  duration,
  reporters,
}) {
  // Not started yet
  if (index === undefined) {
    return
  }

  const percentage = getPercentage({ index, runEnd, total, duration })

  // Call each `reporter.update()`
  const promises = reporters.map(reporter =>
    reporter.update({ title, percentage, index, total }),
  )
  await Promise.all(promises)
}

// Percentage left of the whole run
const getPercentage = function({ index, runEnd, total, duration }) {
  const timeLeft = Math.max(runEnd - now(), 0)
  const taskPercentage = 1 - timeLeft / duration
  const percentage = (index + taskPercentage) / total
  return percentage
}

// Stop progress reporting
export const stopProgress = async function({ progressId, reporters }) {
  clearInterval(progressId)

  await stopReporters(reporters)

  showCursor()
}

// Call each `reporter.stop()`
const stopReporters = async function(reporters) {
  const promises = reporters.map(reporter => reporter.stop({}))
  await Promise.all(promises)
}
