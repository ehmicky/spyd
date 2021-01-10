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
  progresses,
  initial,
}) {
  const progressContent = getProgressContent({
    progressState,
    combinations,
    duration,
    progresses,
  })

  await (initial ? clearProgressInit() : clearProgress())

  await writeToStderr(progressContent)
}

const getProgressContent = function ({
  progressState,
  combinations,
  duration,
  progresses,
}) {
  const { percentage, time } = getTimeProps({
    progressState,
    combinations,
    duration,
  })
  const description = getDescription(progressState, duration)

  return progresses
    .map((progress) => progress.update({ percentage, time, description }))
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
export const clearProgressFinal = async function () {
  await clearScreen(0)
}

const clearScreen = async function (row) {
  await pCursorTo(stderr, 0, row)
  await pClearScreenDown(stderr)
}

const writeToStderr = async function (string) {
  await promisify(stderr.write.bind(stderr))(string)
}
