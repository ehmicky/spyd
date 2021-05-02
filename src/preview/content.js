import { getScreenWidth, getScreenHeight } from '../report/tty.js'
import { separatorColor } from '../report/utils/colors.js'

import { getPreviewBottom } from './bottom.js'
import { updateScrolling } from './scrolling.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters either:
//   - have `reporter.quiet: true`
//   - return nothing in `reporter.report()
export const getPreviewContent = function (previewState) {
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  const report = updateScrolling(previewState, screenHeight)
  const separator = getSeparator(previewState, screenWidth)
  const bottom = getPreviewBottom(previewState, screenWidth)
  return `${report}${separator}${bottom}`
}

const getSeparator = function ({ report }, screenWidth) {
  if (report === undefined) {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
}

// Works with all terminals
const LINE_CHAR = '\u2500'
