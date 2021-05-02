import { getScreenWidth, getScreenHeight } from '../report/tty.js'
import { separatorColor } from '../report/utils/colors.js'

import { getPreviewBottom } from './bottom.js'
import { applyScrolling } from './scrolling.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters either:
//   - have `reporter.quiet: true`
//   - return nothing in `reporter.report()
export const getPreviewContent = function (previewState) {
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  const {
    report: reportA,
    scrollAction,
    scrollTop: scrollTopA,
    availableHeight,
  } = applyScrolling(previewState, screenHeight)
  const separator = getSeparator(previewState, screenWidth)
  const bottom = getPreviewBottom(previewState, screenWidth)
  const previewContent = `${reportA}${separator}${bottom}\n`
  return { previewContent, scrollTop: scrollTopA, availableHeight }
}

const getSeparator = function ({ report }, screenWidth) {
  if (report === undefined) {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
}

// Works with all terminals
const LINE_CHAR = '\u2500'
