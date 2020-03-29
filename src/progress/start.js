import { cyan } from 'chalk'
import { hide as hideCursor } from 'cli-cursor'
import onExit from 'signal-exit'

import { stopProgress } from './stop.js'
import { getTimeLeft } from './time.js'
import { startUpdate } from './update.js'

// Start progress reporting using the `progress` option
export const startProgress = async function (
  iterations,
  { duration, progress: reporters },
) {
  const total = iterations.length

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
  const name = cyan.bold('Start')
  const timeLeft = getTimeLeft({
    index: 0,
    taskTimeLeft: duration,
    total,
    duration,
  })

  await Promise.all(
    reporters.map((reporter) =>
      startReporter({ reporter, name, timeLeft, total }),
    ),
  )
}

const startReporter = async function ({ reporter, name, timeLeft, total }) {
  await reporter.start({ total })

  await reporter.update({ name, percentage: 0, timeLeft, index: 0, total })
}
