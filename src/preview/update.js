import { stderr } from 'process'
import { cursorTo, clearScreenDown } from 'readline'
import { promisify } from 'util'

import { getContent } from './content.js'
import { getDescription } from './set.js'
import { getTimeProps } from './time_props.js'

const pCursorTo = promisify(cursorTo)
const pClearScreenDown = promisify(clearScreenDown)

// Print preview
export const updatePreview = async function (previewState, benchmarkDuration) {
  await clearScreen(1)
  const previewContent = getPreviewContent(previewState, benchmarkDuration)
  await writeToStderr(previewContent)
}

const getPreviewContent = function (previewState, benchmarkDuration) {
  const { percentage, time } = getTimeProps(previewState, benchmarkDuration)
  const description = getDescription(previewState, benchmarkDuration)
  return getContent({ percentage, time, description })
}

// At the beginning of the benchmark, we print newlines so that clearing the
// screen does not remove previous prompts
export const clearPreviewInit = async function () {
  const newlines = '\n'.repeat(stderr.rows - 1)
  await writeToStderr(newlines)
}

// The final screen cleaning prints one less empty row.
export const clearPreviewFinal = async function () {
  await clearScreen(0)
}

const clearScreen = async function (row) {
  await pCursorTo(stderr, 0, row)
  await pClearScreenDown(stderr)
}

const writeToStderr = async function (string) {
  await promisify(stderr.write.bind(stderr))(string)
}
