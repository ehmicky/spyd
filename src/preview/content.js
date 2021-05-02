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
  const bottomBar = `${separator}${bottom}\n`
  const reportA = applyScrolling({ report, bottomBar, scrollTop, screenHeight })
  const previewContent = `${reportA}${bottomBar}`
  return previewContent
}

const getSeparator = function (report, screenWidth) {
  if (report === '') {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
}

// Works with all terminals
const LINE_CHAR = '\u2500'
