import { hide as hideCursor } from 'cli-cursor'
import onExit from 'signal-exit'

import { stopProgress } from './stop.js'
import { getTimeLeft } from './time_left.js'
import { startUpdate } from './update.js'

// Start progress reporting using the `progress` configuration property
export const startProgress = async function (
  combinations,
  { duration, progress: reporters },
) {
  hideCursor()

  const benchmarkDuration = combinations.length * duration
  await startReporters(reporters, benchmarkDuration)

  const { progressState, progressId } = startUpdate(
    reporters,
    benchmarkDuration,
  )

  const removeOnExit = onExit(() => stopProgress({ progressId, reporters }))

  return {
    progressState,
    progressInfo: { progressId, reporters, removeOnExit },
  }
}

// Call each `reporter.start()`
// Also call an initial `reporter.update()`
const startReporters = async function (reporters, benchmarkDuration) {
  const timeLeft = getTimeLeft(benchmarkDuration, benchmarkDuration)
  await Promise.all(
    reporters.map((reporter) => startReporter(reporter, timeLeft)),
  )
}

const startReporter = async function (reporter, timeLeft) {
  await reporter.start({})
  await reporter.update({ percentage: 0, timeLeft })
}
