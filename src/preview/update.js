import { stdout } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import { getScreenHeight, printToTty } from '../report/tty.js'

import { getContent } from './content.js'
import { getDescription } from './set.js'
import { updateTimeProps } from './time_props.js'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Print preview
export const updatePreview = async function (previewState, benchmarkDuration) {
  updateTimeProps(previewState, benchmarkDuration)
  const previewContent = getPreviewContent(previewState, benchmarkDuration)

  await clearPreview()
  await printToTty(previewContent)
}

const getPreviewContent = function (
  { percentage, time, description, priorityDescription, report },
  benchmarkDuration,
) {
  const descriptionA = getDescription({
    description,
    priorityDescription,
    benchmarkDuration,
  })
  return getContent({ percentage, time, description: descriptionA, report })
}

// At the beginning of the benchmark, we print newlines so that clearing the
// screen does not remove previous prompts
export const clearPreviewInit = async function () {
  const screenHeight = getScreenHeight()
  const newlines = '\n'.repeat(screenHeight - 1)
  await printToTty(newlines)
}

export const clearPreview = async function () {
  await pCursorTo(stdout, 0, 0)
  await pClearScreenDown(stdout)
}
