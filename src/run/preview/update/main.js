import { printToStdout, clearScreen } from '../../../report/tty.js'

import { getBottomBar } from './bottom_bar.js'
import { updateCompletion } from './completion.js'
import { addInitialScrollAction, addScrollAction } from './scrolling_action.js'
import { updateScrolling } from './scrolling_update.js'

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
export const updatePreview = async (previewState) => {
  if (previewState.quiet) {
    return
  }

  updateCompletion(previewState)
  await refreshPreview(previewState)
}

export const refreshPreview = async (previewState) => {
  if (previewState.quiet) {
    return
  }

  const previewContent = getPreviewContent(previewState)

  await clearScreen()
  await printToStdout(previewContent)
}

// Retrieve preview content.
const getPreviewContent = (previewState) => {
  addInitialScrollAction(previewState)
  const bottomBar = getBottomBar(previewState)
  const { report, maxScrollTop } = updateScrolling(previewState, bottomBar)
  addScrollAction({ previewState, maxScrollTop })
  const bottomBarA = getBottomBar(previewState)
  return `${report}${bottomBarA}`
}
