import { hide as hideCursor } from 'cli-cursor'
import onExit from 'signal-exit'

import { stopProgress } from './stop.js'
import { getTimeLeft } from './time.js'
import { startUpdate } from './update.js'

// Start progress reporting using the `progress` option
export const startProgress = async function (
  combinations,
  { duration, progress: reporters },
) {
  const total = combinations.length

  hideCursor()

  await startReporters({ reporters, total, duration })

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
// Also call an initial `reporter.update()`
const startReporters = async function ({ reporters, total, duration }) {
  const row = ['Start']
  const timeLeft = getTimeLeft({
    index: 0,
    taskTimeLeft: duration,
    total,
    duration,
  })

  await Promise.all(
    reporters.map((reporter) =>
      startReporter({ row, reporter, timeLeft, total }),
    ),
  )
}

const startReporter = async function ({ row, reporter, timeLeft, total }) {
  await reporter.start({ total })

  await reporter.update({ row, percentage: 0, timeLeft, index: 0, total })
}
