import now from 'precise-now'

import { getDuration } from './duration.js'

// Update progress at regular interval
export const startUpdate = function (reporters, benchmarkDuration) {
  const progressState = {}
  const progressId = setInterval(() => {
    updateProgress({ progressState, benchmarkDuration, reporters })
  }, UPDATE_FREQUENCY)
  return { progressState, progressId }
}

// How often (in milliseconds) to update progress
const UPDATE_FREQUENCY = 1e2

const updateProgress = async function ({
  progressState: { benchmarkEnd, description },
  benchmarkDuration,
  reporters,
}) {
  const timeLeft = getTimeLeft(benchmarkEnd, benchmarkDuration)
  const percentage = 1 - timeLeft / benchmarkDuration
  const duration = getDuration(timeLeft, benchmarkDuration)

  // Call each `reporter.update()`
  await Promise.all(
    reporters.map((reporter) =>
      reporter.update({ percentage, duration, description }),
    ),
  )
}

const getTimeLeft = function (benchmarkEnd, benchmarkDuration) {
  // Not started yet
  if (benchmarkEnd === undefined) {
    return benchmarkDuration
  }

  return Math.max(benchmarkEnd - now(), 0)
}

export const stopUpdate = function (progressId) {
  clearInterval(progressId)
}
