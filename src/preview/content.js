import { getScreenWidth } from '../report/tty.js'
import { separatorColor } from '../report/utils/colors.js'

import { getPreviewBottom } from './bottom.js'

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
}) {
  const screenWidth = getScreenWidth()
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
  return `${report}${separator}${bottom}\n`
}

const getSeparator = function (report, screenWidth) {
  if (report === '') {
    return ''
  }

  return separatorColor(`${LINE_CHAR.repeat(screenWidth)}\n`)
}

// Works with all terminals
const LINE_CHAR = '\u2500'
