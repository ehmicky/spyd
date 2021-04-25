import { separatorColor } from '../colors.js'

import { TICK_MIDDLE, HORIZONTAL_LINE } from './characters.js'

// Retrieve the horizontal line and the abscissa below the main content.
// Includes the tick below the median.
export const getAbscissa = function (width, medianIndex, medianPretty) {
  const bottomLine = getBottomRow(TICK_MIDDLE, HORIZONTAL_LINE, {
    width,
    medianIndex,
  })
  const abscissa = getBottomRow(medianPretty, ' ', { width, medianIndex })
  return `${separatorColor(bottomLine)}
${abscissa}`
}

const getBottomRow = function (middle, fillCharacter, { width, medianIndex }) {
  const leftSpacesWidth = Math.min(
    medianIndex,
    Math.max(width - middle.length, 0),
  )
  const rightSpacesWidth = Math.max(width - leftSpacesWidth - middle.length, 0)
  const leftSpaces = fillCharacter.repeat(leftSpacesWidth)
  const rightSpaces = fillCharacter.repeat(rightSpacesWidth)
  return `${leftSpaces}${middle}${rightSpaces}`
}
