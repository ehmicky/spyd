import { getBottomBar } from './bottom_bar.js'
import { addInitialScrollAction, addScrollAction } from './scrolling_action.js'
import { updateScrolling } from './scrolling_update.js'

// Retrieve preview content.
export const getPreviewContent = function (previewState) {
  addInitialScrollAction(previewState)
  const bottomBar = getBottomBar(previewState)
  const { report, maxScrollTop } = updateScrolling(previewState, bottomBar)
  addScrollAction({ previewState, maxScrollTop })
  return `${report}${bottomBar}`
}
