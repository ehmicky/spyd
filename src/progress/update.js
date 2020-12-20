import now from 'precise-now'

import { getTimeLeft } from './time_left.js'

// Update progress at regular interval
export const startUpdate = function (reporters, benchmarkDuration) {
  const progressState = {}
  const progressId = setInterval(
    () => updateProgress({ progressState, benchmarkDuration, reporters }),
    FREQUENCY,
  )
  return { progressState, progressId }
}

// How often (in milliseconds) to update progress
const FREQUENCY = 1e2

const updateProgress = async function ({
  progressState: { benchmarkEnd },
  benchmarkDuration,
  reporters,
}) {
  // Not started yet
  if (benchmarkEnd === undefined) {
    return
  }

  const timeLeftNs = Math.max(benchmarkEnd - now(), 0)
  const percentage = 1 - timeLeftNs / benchmarkDuration
  const timeLeft = getTimeLeft(timeLeftNs, benchmarkDuration)

  // Call each `reporter.update()`
  await Promise.all(
    reporters.map((reporter) => reporter.update({ percentage, timeLeft })),
  )
}

export const stopUpdate = function (progressId) {
  clearInterval(progressId)
}
