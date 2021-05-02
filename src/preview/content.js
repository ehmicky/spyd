import { getScreenWidth, getScreenHeight } from '../report/tty.js'

import { getBottomBar } from './bottom.js'
import { updateScrolling } from './scrolling_update.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters either:
//   - have `reporter.quiet: true`
//   - return nothing in `reporter.report()
export const getPreviewContent = function (previewState) {
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  const report = updateScrolling(previewState, screenHeight)
  const bottomBar = getBottomBar(previewState, screenWidth)
  return `${report}${bottomBar}`
}
