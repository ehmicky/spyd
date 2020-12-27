import { stderr } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import now from 'precise-now'

import { getDuration } from './duration.js'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Call each `reporter.update()`
export const updateProgress = async function ({
  progressState,
  benchmarkDuration,
  reporters,
  initial,
}) {
  const progressContent = getProgressContent({
    progressState,
    benchmarkDuration,
    reporters,
  })
  await clearProgress({ initial, final: false })
  await writeToStderr(progressContent)
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

export const clearProgress = async function ({ initial, final }) {
  if (initial) {
    await initialClearProgress()
  }

  const row = final ? 0 : 1
  await pCursorTo(stderr, 0, row)
  await pClearScreenDown(stderr)
}

const initialClearProgress = async function () {
  const newlines = '\n'.repeat(stderr.rows - 1)
  await writeToStderr(newlines)
}

const writeToStderr = async function (string) {
  await promisify(stderr.write.bind(stderr))(string)
}
