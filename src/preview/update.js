import { printToTty, clearScreen } from '../report/tty.js'

import { getContent } from './content.js'
import { getDescription } from './set.js'
import { updateTimeProps } from './time_props.js'

// Refresh preview
export const updatePreview = async function (previewState, benchmarkDuration) {
  await clearScreen()

  updateTimeProps(previewState, benchmarkDuration)
  const previewContent = getPreviewContent(previewState)

  await printToTty(previewContent)
}

const getPreviewContent = function ({
  percentage,
  time,
  description,
  priorityDescription,
  report,
}) {
  const descriptionA = getDescription(description, priorityDescription)
  return getContent({ percentage, time, description: descriptionA, report })
}
