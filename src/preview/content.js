import { getScreenWidth, getScreenHeight } from '../report/tty.js'

import { getBottomBarElements, getBottomBar } from './bottom.js'
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
  const {
    leftWidth,
    separator,
    progressRow,
    counterRow,
  } = getBottomBarElements(previewState, screenWidth)
  const bottomBar = getBottomBar({
    previewState,
    separator,
    leftWidth,
    progressRow,
    counterRow,
  })
  const { report, maxScrollTop } = updateScrolling(
    previewState,
    screenHeight,
    bottomBar,
  )
  addScrollAction({ previewState, maxScrollTop })
  const bottomBarA = getBottomBar({
    previewState,
    separator,
    leftWidth,
    progressRow,
    counterRow,
  })
  return `${report}${bottomBarA}`
}
