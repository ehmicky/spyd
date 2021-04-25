import { reportPreview } from '../report/main.js'
import { printToTty, clearScreen } from '../report/tty.js'

import { updateCompletion } from './completion.js'
import { getPreviewContent } from './content.js'

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
export const updatePreview = async function (previewState) {
  updateCompletion(previewState)
  await refreshPreview(previewState)
}

export const updatePreviewReport = async function (previewState, result) {
  updateCompletion(previewState)
  await updateReport({ previewState, result })
  await refreshPreview(previewState)
}

const updateReport = async function ({
  previewState,
  previewState: { durationLeft, percentage, index, total, reporters, titles },
  result,
}) {
  const preview = { durationLeft, percentage, index: index + 1, total }
  const report = await reportPreview(
    { ...result, preview },
    { reporters, titles },
  )
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = report
}

const refreshPreview = async function (previewState) {
  const previewContent = getPreviewContent(previewState)

  await clearScreen()
  await printToTty(previewContent)
}

// Set the preview description
export const updateDescription = async function (previewState, description) {
  if (previewState.quiet) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.description = description
  await updatePreview(previewState)
}
