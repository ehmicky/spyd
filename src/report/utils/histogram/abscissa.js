import stringWidth from 'string-width'

import { separatorColor } from '../colors.js'

// Retrieve the horizontal line and the abscissa below the main content.
// Includes the tick below the median.
export const getAbscissa = function (width, medianIndex, medianPretty) {
  const bottomLine = getBottomRow(TICK_MIDDLE, HORIZONTAL_LINE, {
    width,
    medianIndex,
  })
  const abscissa = getBottomRow(medianPretty, ' ', { width, medianIndex })
  return `${bottomLine}
${abscissa}`
}

// Characters to display the horizontal separator, including its ticks
const TICK_MIDDLE = separatorColor('\u252C')
const HORIZONTAL_LINE = separatorColor('\u2500')

const getBottomRow = function (middle, fillCharacter, { width, medianIndex }) {
  const middleWidth = stringWidth(middle)
  const leftSpacesWidth = Math.min(
    medianIndex,
    Math.max(width - middleWidth, 0),
  )
  const rightSpacesWidth = Math.max(width - leftSpacesWidth - middleWidth, 0)
  const leftSpaces = fillCharacter.repeat(leftSpacesWidth)
  const rightSpaces = fillCharacter.repeat(rightSpacesWidth)
  return `${leftSpaces}${middle}${rightSpaces}`
}
