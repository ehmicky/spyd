import { stderr } from 'process'
import { cursorTo, clearLine } from 'readline'
import { promisify } from 'util'

import now from 'precise-now'

import { getDuration } from './duration.js'

const pCursorTo = promisify(cursorTo)
const pClearLine = promisify(clearLine)

// Call each `reporter.update()`
export const updateProgress = async function ({
  progressState,
  benchmarkDuration,
  reporters,
}) {
  try {
    const progressContent = getProgressContent({
      progressState,
      benchmarkDuration,
      reporters,
    })
    await clearProgress()
    await promisify(stderr.write.bind(stderr))(progressContent)
    // TODO: better error handling
  } catch {}
}

const getProgressContent = function ({
  progressState: { benchmarkEnd, description },
  benchmarkDuration,
  reporters,
}) {
  const timeLeft = getTimeLeft(benchmarkEnd, benchmarkDuration)
  const percentage = 1 - timeLeft / benchmarkDuration
  const duration = getDuration(timeLeft, benchmarkDuration)

  return reporters
    .map((reporter) => reporter.update({ percentage, duration, description }))
    .join(PROGRESS_SEPARATOR)
}

const getTimeLeft = function (benchmarkEnd, benchmarkDuration) {
  // Not started yet
  if (benchmarkEnd === undefined) {
    return benchmarkDuration
  }

  return Math.max(benchmarkEnd - now(), 0)
}

const PROGRESS_SEPARATOR = '\n\n'

export const clearProgress = async function () {
  await pCursorTo(stderr, 0)
  await pClearLine(stderr, 0)
}
