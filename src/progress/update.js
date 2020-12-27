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
  await clearProgress({ initial, final: false })
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
