import { getScreenWidth, getScreenHeight } from '../report/tty.js'
import { separatorColor } from '../report/utils/colors.js'

import { getPreviewBottom } from './bottom.js'
import { applyScrolling } from './scrolling.js'

// Retrieve preview content.
// `report` is `undefined` when all reporters have `reporter.quiet: true`.
export const getPreviewContent = function ({
  report = '',
  durationLeft,
  percentage,
  index,
  total,
  combinationName,
  description,
  actions,
  scrollTop,
}) {
  const screenWidth = getScreenWidth()
  const screenHeight = getScreenHeight()
  const {
    report: reportA,
    scrollAction,
    scrollTop: scrollTopA,
    availableHeight,
  } = applyScrolling(report, scrollTop, screenHeight)
  const separator = getSeparator(report, screenWidth)
  const bottom = getPreviewBottom({
    durationLeft,
    percentage,
    index,
    total,
    combinationName,
    description,
    actions,
    screenWidth,
  })
  const previewContent = `${reportA}${separator}${bottom}\n`
  return { previewContent, scrollTop: scrollTopA, availableHeight }
}

const getSeparator = function (report, screenWidth) {
  if (report === '') {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
}

// Works with all terminals
const LINE_CHAR = '\u2500'
