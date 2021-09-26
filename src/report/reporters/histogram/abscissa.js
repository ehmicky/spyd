import { centerString } from '../../utils/center.js'
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
  const paddedMin = getPaddedStat(min)
  const bottomLine = separatorColor(getBottomLine(contentWidth, medianIndex))
  const paddedMax = getPaddedStat(max)
  return `${combinationTitles}${paddedMin}${bottomLine}${paddedMax}\n`
}

const getPaddedStat = function ({ prettyPaddedColor }) {
  return `${STAT_PADDING}${prettyPaddedColor}${STAT_PADDING}`
}

export const getPaddedStatLength = function ({ prettyPadded }) {
  return prettyPadded.length + STAT_PADDING_WIDTH * 2
}

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)

export const getTickLength = function () {
  return TICK_LEFT.length
}

const getBottomLine = function (contentWidth, medianIndex) {
  const startPadding = HORIZONTAL_LINE.repeat(medianIndex)
  const bottomLine = `${startPadding}${TICK_MIDDLE}`.padEnd(
    contentWidth,
    HORIZONTAL_LINE,
  )
  return `${TICK_LEFT}${bottomLine}${TICK_RIGHT}`
}

const getLabelLine = function ({
  titlesWidth,
  minBlockWidth,
  contentWidth,
  median,
  medianIndex,
}) {
  const tickLength = getTickLength()
  const centeredMedian = centerString(
    median.prettyColor,
    medianIndex,
    contentWidth + tickLength * 2,
  )
  const initialSpace = ' '.repeat(titlesWidth + minBlockWidth - tickLength)
  return `${initialSpace}${centeredMedian}\n`
}
