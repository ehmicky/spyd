import { stderr } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import { getDescription } from './set.js'
import { getTimeProps } from './time_props.js'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Call each `reporter.update()`
export const updateProgress = async function ({
  progressState,
  combinations,
  duration,
  reporters,
  initial,
}) {
  const progressContent = getProgressContent({
    progressState,
    combinations,
    duration,
    reporters,
  })

  await (initial ? clearProgressInit() : clearProgress())

  await writeToStderr(progressContent)
}

const getProgressContent = function ({
  progressState,
  combinations,
  duration,
  reporters,
}) {
  const { percentage, time } = getTimeProps({
    progressState,
    combinations,
    duration,
  })
  const description = getDescription(progressState)

  return reporters
    .map((reporter) => reporter.update({ percentage, time, description }))
    .join(PROGRESS_SEPARATOR)
}

const PROGRESS_SEPARATOR = '\n\n'

// At the beginning of the benchmark, we print newlines so that clearing the
// screen does not remove previous prompts
const clearProgressInit = async function () {
  const newlines = '\n'.repeat(stderr.rows - 1)
  await writeToStderr(newlines)
  await clearScreen(1)
}

const clearProgress = async function () {
  await clearScreen(1)
}

// The final screen cleaning prints one less empty row.
// When stopping a benchmark, we keep the progress duration since it is useful.
// We also keep the description, to remind the benchmark was stopped.
export const clearProgressFinal = async function (stopped) {
  if (stopped) {
    return
  }

  await clearScreen(0)
}

const clearScreen = async function (row) {
  await pCursorTo(stderr, 0, row)
  await pClearScreenDown(stderr)
}

const writeToStderr = async function (string) {
  await promisify(stderr.write.bind(stderr))(string)
}
