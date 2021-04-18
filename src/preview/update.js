import { printToTty, clearScreen } from '../report/tty.js'

import { getCompletionProps } from './completion.js'
import { getContent } from './content.js'
import { getDescription } from './description.js'

// Refresh preview.
// Also update `previewState.durationLeft|percentage` for reporters using it.
export const updatePreview = async function (previewState) {
  await clearScreen()

  const { durationLeft, percentage } = getCompletionProps(previewState)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { durationLeft, percentage })

  const previewContent = getPreviewContent(previewState)
  await printToTty(previewContent)
}

const getPreviewContent = function ({
  durationLeft,
  index,
  total,
  percentage,
  description,
  priorityDescription,
  report,
}) {
  const descriptionA = getDescription(description, priorityDescription)
  return getContent({
    durationLeft,
    index,
    total,
    percentage,
    description: descriptionA,
    report,
  })
}
