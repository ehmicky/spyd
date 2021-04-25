import { reportPreview } from '../report/main.js'
import { printToTty, clearScreen } from '../report/tty.js'

import { getCompletionProps } from './completion.js'
import { getPreviewContent } from './content.js'

export const refreshPreviewReport = async function (previewConfig, result) {
  const previewConfigA = getCompletionProps({ previewConfig })
  const report = await getReport(previewConfigA, result)
  const previewConfigB = { ...previewConfigA, report }
  await refreshPreview(previewConfigB)
  return previewConfigB
}

const getReport = async function (
  { durationLeft, percentage, index, total, reporters, titles },
  result,
) {
  const preview = { durationLeft, percentage, index: index + 1, total }
  return await reportPreview({ ...result, preview }, { reporters, titles })
}

// Refresh preview.
// Done:
//  - At the beginning of the benchmark, to show the report without results yet
//  - At the beginning of each combination, to update the `index`
//  - At the end of each combination, to make its percentage complete
//  - After each sample
// We do not use `setInterval()` to decrease the `durationLeft` in real-time.
//  - Instead we rely on updating the preview after each sample
//  - If the task is slow, this means `durationLeft` will not decrease in
//    real-time
//  - However, this prevents jitter due the `setInterval()` decrease going
//    against the sample updates
export const updatePreview = async function (previewConfig) {
  const previewConfigA = getCompletionProps({ previewConfig })
  await refreshPreview(previewConfigA)
}

const refreshPreview = async function (previewConfig) {
  const previewContent = getPreviewContent(previewConfig)

  await clearScreen()
  await printToTty(previewContent)
}

// Set the preview description
export const updateDescription = async function (previewConfig, description) {
  if (previewConfig.quiet) {
    return previewConfig
  }

  const previewConfigA = setDescription(previewConfig, description)
  await updatePreview(previewConfigA)
  return previewConfigA
}

export const setDescription = function (previewConfig, description) {
  return { ...previewConfig, description }
}
