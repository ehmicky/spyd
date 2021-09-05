import { separatorColor } from '../../utils/colors.js'

import {
  TICK_LEFT,
  TICK_RIGHT,
  TICK_MIDDLE,
  HORIZONTAL_LINE,
} from './characters.js'

// Retrieve the horizontal line and the abscissa below the main content.
// Includes the tick above the median and its label.
export const getAbscissa = function ({
  combinationTitles,
  titlesWidth,
  minBlockWidth,
  contentWidth,
  median,
  medianIndex,
  min,
  max,
}) {
  const titlesSpace = ' '.repeat(titlesWidth)
  const minSpace = ' '.repeat(minBlockWidth)
  const paddedMin = getPaddedMin(min)
  const paddedMax = getPaddedMax(max)
  const bottomLine = separatorColor(getBottomLine(contentWidth, medianIndex))
  const label = getLabel(contentWidth, median, medianIndex)
  return `${combinationTitles}${paddedMin}${bottomLine}${paddedMax}\n${titlesSpace}${minSpace}${label}\n`
}

export const getPaddedMin = function ({ prettyPaddedColor }) {
  return `${STAT_PADDING}${prettyPaddedColor}${STAT_PADDING}${separatorColor(
    TICK_LEFT,
  )}`
}

export const getPaddedMax = function ({ prettyPaddedColor }) {
  return `${separatorColor(
    TICK_RIGHT,
  )}${STAT_PADDING}${prettyPaddedColor}${STAT_PADDING}`
}

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)

const getBottomLine = function (contentWidth, medianIndex) {
  const startPadding = HORIZONTAL_LINE.repeat(medianIndex)
  return `${startPadding}${TICK_MIDDLE}`.padEnd(contentWidth, HORIZONTAL_LINE)
}

const getLabel = function (contentWidth, median, medianIndex) {
  const labelPaddingWidth = Math.min(
    medianIndex,
    contentWidth - median.pretty.length,
  )
  const labelPadding = ' '.repeat(labelPaddingWidth)
  return `${labelPadding}${median.prettyColor}`
}

// How many terminal lines the bottom line takes
export const ABSCISSA_BOTTOM_HEIGHT = 1
// How many terminal lines the labels take
export const ABSCISSA_LABELS_HEIGHT = 1
