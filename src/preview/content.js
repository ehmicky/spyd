import { getBottomBarElements, getBottomBar } from './bottom.js'
import { addInitialScrollAction, addScrollAction } from './scrolling_action.js'
import { updateScrolling } from './scrolling_update.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters either:
//   - have `reporter.quiet: true`
//   - return nothing in `reporter.report()
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
  const bottomBarA = getBottomBar({
    previewState,
    separator,
    leftWidth,
    progressRow,
    counterRow,
  })
  return `${report}${bottomBarA}`
}
