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
  const bottomFullLine = getBottomFullLine({
    combinationTitles,
    contentWidth,
    medianIndex,
    min,
    max,
  })
  const labelLine = getLabelLine({
    titlesWidth,
    minBlockWidth,
    contentWidth,
    median,
    medianIndex,
  })
  return `${bottomFullLine}${labelLine}`
}

const getBottomFullLine = function ({
  combinationTitles,
  contentWidth,
  medianIndex,
  min,
  max,
}) {
  const paddedMin = getPaddedMin(min)
  const bottomLine = separatorColor(getBottomLine(contentWidth, medianIndex))
  const paddedMax = getPaddedMax(max)
  return `${combinationTitles}${paddedMin}${bottomLine}${paddedMax}\n`
}

const getPaddedMin = function ({ prettyPaddedColor }) {
  return `${STAT_PADDING}${prettyPaddedColor}${STAT_PADDING}${separatorColor(
    TICK_LEFT,
  )}`
}

const getPaddedMax = function ({ prettyPaddedColor }) {
  return `${separatorColor(
    TICK_RIGHT,
  )}${STAT_PADDING}${prettyPaddedColor}${STAT_PADDING}`
}

export const getPaddedStatLength = function ({ prettyPadded }) {
  return prettyPadded.length + STAT_PADDING_WIDTH * 2 + TICK_LEFT.length
}

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)

const getBottomLine = function (contentWidth, medianIndex) {
  const startPadding = HORIZONTAL_LINE.repeat(medianIndex)
  return `${startPadding}${TICK_MIDDLE}`.padEnd(contentWidth, HORIZONTAL_LINE)
}

const getLabelLine = function ({
  titlesWidth,
  minBlockWidth,
  contentWidth,
  median,
  medianIndex,
}) {
  const leftSpace = ' '.repeat(titlesWidth + minBlockWidth)
  const label = getLabel(contentWidth, median, medianIndex)
  return `${leftSpace}${label}\n`
}

const getLabel = function (contentWidth, median, medianIndex) {
  const labelPaddingWidth = Math.min(
    medianIndex,
    contentWidth - median.pretty.length,
  )
  const labelPadding = ' '.repeat(labelPaddingWidth)
  return `${labelPadding}${median.prettyColor}`
}
