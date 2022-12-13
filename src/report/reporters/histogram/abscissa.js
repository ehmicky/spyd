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
export const getAbscissa = ({
  combinationTitles,
  titlesWidth,
  minBlockWidth,
  contentWidth,
  median,
  medianIndex,
  min,
  max,
}) => {
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

const getBottomFullLine = ({
  combinationTitles,
  contentWidth,
  medianIndex,
  min,
  max,
}) => {
  const paddedMin = getPaddedStat(min)
  const bottomLine = separatorColor(getBottomLine(contentWidth, medianIndex))
  const paddedMax = getPaddedStat(max)
  return `${combinationTitles}${paddedMin}${bottomLine}${paddedMax}\n`
}

const getPaddedStat = ({ prettyPaddedColor }) =>
  `${STAT_PADDING}${prettyPaddedColor}${STAT_PADDING}`

export const getPaddedStatLength = ({ prettyPadded }) =>
  prettyPadded.length + STAT_PADDING_WIDTH * 2

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)

export const getTickLength = () => TICK_LEFT.length

const getBottomLine = (contentWidth, medianIndex) => {
  const startPadding = HORIZONTAL_LINE.repeat(medianIndex)
  const bottomLine = `${startPadding}${TICK_MIDDLE}`.padEnd(
    contentWidth,
    HORIZONTAL_LINE,
  )
  return `${TICK_LEFT}${bottomLine}${TICK_RIGHT}`
}

const getLabelLine = ({
  titlesWidth,
  minBlockWidth,
  contentWidth,
  median,
  medianIndex,
}) => {
  const centeredMedian = centerString(
    median.prettyColor,
    medianIndex,
    contentWidth,
  )
  const initialSpace = ' '.repeat(titlesWidth + minBlockWidth)
  return `${initialSpace}${centeredMedian}\n`
}
