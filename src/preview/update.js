import { getScreenHeight, printToTty, clearScreen } from '../report/tty.js'

import { getContent } from './content.js'
import { getDescription } from './set.js'
import { updateTimeProps } from './time_props.js'

// Print preview
export const updatePreview = async function (previewState, benchmarkDuration) {
  updateTimeProps(previewState, benchmarkDuration)
  const previewContent = getPreviewContent(previewState, benchmarkDuration)

  await clearScreen()
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
