import { getBottomBar } from './bottom_bar.js'
import { getBottomBarElements } from './bottom_elements.js'
import { addInitialScrollAction, addScrollAction } from './scrolling_action.js'
import { updateScrolling } from './scrolling_update.js'

// Retrieve preview content.
export const getPreviewContent = function (previewState) {
  addInitialScrollAction(previewState)
  const { leftWidth, separator, progressRow, counterRow } =
    getBottomBarElements(previewState)
  const bottomBar = getBottomBar({
    previewState,
    separator,
    leftWidth,
    progressRow,
    counterRow,
  })
  const { report, maxScrollTop } = updateScrolling(previewState, bottomBar)
  addScrollAction({ previewState, maxScrollTop })
  const separatorA = report === '' ? '' : separator
  const bottomBarA = getBottomBar({
    previewState,
    leftWidth,
    progressRow,
    counterRow,
  })
  return `${report}${separatorA}${bottomBarA}`
}
