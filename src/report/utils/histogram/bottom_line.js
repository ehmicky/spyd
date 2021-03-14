import { separatorColor } from '../colors.js'

// Retrieve the horizontal line separating the main content and the abscissa.
// Includes the ticks above each of the following stats: low, median, high
export const getBottomLine = function (width, medianIndex) {
  const leftLineWidth = medianIndex - TICK_LEFT.length
  const rightLineWidth =
    width -
    leftLineWidth -
    TICK_LEFT.length -
    TICK_MIDDLE.length -
    TICK_RIGHT.length
  const tickMiddle = leftLineWidth < 0 || rightLineWidth < 0 ? '' : TICK_MIDDLE
  const leftLine = getHorizontalLine(leftLineWidth)
  const rightLine = getHorizontalLine(rightLineWidth)
  return separatorColor(
    `${TICK_LEFT}${leftLine}${tickMiddle}${rightLine}${TICK_RIGHT}`,
  )
}

const getHorizontalLine = function (lineWidth) {
  return HORIZONTAL_LINE.repeat(Math.max(lineWidth, 0))
}

// Characters to display the horizontal separator, including its ticks
const HORIZONTAL_LINE = '\u2500'
const TICK_LEFT = '\u250C'
const TICK_MIDDLE = '\u252C'
const TICK_RIGHT = '\u2510'
