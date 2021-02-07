import { printToTty, clearScreen, clearScreenFull } from '../report/tty.js'

import { getContent } from './content.js'
import { getDescription } from './set.js'
import { updateTimeProps } from './time_props.js'

// Print first preview
export const firstPreview = async function ({
  previewState,
  combinations,
  duration,
}) {
  await clearScreenFull()
  await updatePreview({ previewState, combinations, duration })
}

// Refresh preview
export const updatePreview = async function ({
  previewState,
  combinations,
  duration,
}) {
  await clearScreen()

  const benchmarkDuration = getBenchmarkDuration(combinations, duration)
  updateTimeProps(previewState, benchmarkDuration)
  const previewContent = getPreviewContent(previewState, benchmarkDuration)

  await printToTty(previewContent)
}

const getBenchmarkDuration = function (combinations, duration) {
  if (duration === 0 || duration === 1) {
    return duration
  }

  return combinations.length * duration
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
