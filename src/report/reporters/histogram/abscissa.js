import { separatorColor } from '../../utils/colors.js'

import { TICK_MIDDLE, HORIZONTAL_LINE } from './characters.js'

// Retrieve the horizontal line and the abscissa below the main content.
// Includes the tick above the median and its label.
export const getAbscissa = function (width, median, medianIndex) {
  const bottomLine = separatorColor(getBottomLine(width, medianIndex))
  const label = getLabel(width, median, medianIndex)
  return `${bottomLine}\n${label}`
}

const getBottomLine = function (width, medianIndex) {
  const startPadding = HORIZONTAL_LINE.repeat(medianIndex)
  return `${startPadding}${TICK_MIDDLE}`.padEnd(width, HORIZONTAL_LINE)
}

const getLabel = function (width, median, medianIndex) {
  const labelPaddingWidth = Math.min(medianIndex, width - median.pretty.length)
  const labelPadding = ' '.repeat(labelPaddingWidth)
  return `${labelPadding}${median.prettyColor}`
}

// How many terminal lines the bottom line takes
export const ABSCISSA_BOTTOM_HEIGHT = 1
// How many terminal lines the labels take
export const ABSCISSA_LABELS_HEIGHT = 1
