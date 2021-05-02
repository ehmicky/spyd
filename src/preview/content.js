import { getScreenWidth, getScreenHeight } from '../report/tty.js'

import { getBottomBar } from './bottom.js'
import { addInitialScrollAction, addScrollAction } from './scrolling_action.js'
import { updateScrolling } from './scrolling_update.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters either:
//   - have `reporter.quiet: true`
//   - return nothing in `reporter.report()
export const getPreviewContent = function (previewState) {
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  addInitialScrollAction(previewState)
  const bottomBar = getBottomBar(previewState, screenWidth)
  const { report, maxScrollTop } = updateScrolling(previewState, screenHeight)
  addScrollAction({ previewState, maxScrollTop })
  return `${report}${bottomBar}`
}
