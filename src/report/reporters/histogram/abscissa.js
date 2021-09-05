import { separatorColor } from '../../utils/colors.js'

import { TICK_MIDDLE, HORIZONTAL_LINE } from './characters.js'

// Retrieve the horizontal line and the abscissa below the main content.
// Includes the tick above the median and its label.
export const getAbscissa = function (width, median, medianIndex) {
  const bottomLine = separatorColor(getBottomLine(width, medianIndex))
  const labels = getLabels(width, median, medianIndex)
  return `${bottomLine}\n${labels}`
}

const getBottomLine = function (width, medianIndex) {
  const startPadding = medianIndex + TICK_MIDDLE.length
  return TICK_MIDDLE.padStart(startPadding, HORIZONTAL_LINE).padEnd(
    width,
    HORIZONTAL_LINE,
  )
}

const getLabels = function (width, { pretty, prettyColor }, medianIndex) {
  const spacesWidth = Math.max(medianIndex - pretty.length + 1, 0)
  const labelsLength = spacesWidth + pretty.length
  const spaces = ' '.repeat(spacesWidth)
  const labels = `${spaces}${prettyColor}`
  const labelsA = trimWidth(labels, labelsLength, width)
  return labelsA
}

// When some labels are close to the end, they might go over the maximum width.
// We fix this by pushing them leftward by removing any spaces before them until
// they fit within the maximum width.
// Uses imperative code for performance.
// eslint-disable-next-line complexity, max-statements
const trimWidth = function (labels, labelsLength, width) {
  // eslint-disable-next-line fp/no-let
  let excessWidth = labelsLength - width

  if (excessWidth <= 0) {
    return labels
  }

  // eslint-disable-next-line fp/no-let
  let previousIsSpace = false
  // eslint-disable-next-line fp/no-let
  let labelsA = ''

  // eslint-disable-next-line fp/no-loops, fp/no-mutating-methods
  for (const char of [...labels].reverse()) {
    const isSpace = char === ' '

    // eslint-disable-next-line max-depth
    if (excessWidth !== 0 && isSpace && previousIsSpace) {
      // eslint-disable-next-line fp/no-mutation
      excessWidth -= 1
    } else {
      // eslint-disable-next-line fp/no-mutation
      previousIsSpace = isSpace
      // eslint-disable-next-line fp/no-mutation
      labelsA = `${char}${labelsA}`
    }
  }

  return labelsA
}

// How many terminal lines the bottom line takes
export const ABSCISSA_BOTTOM_HEIGHT = 1
// How many terminal lines the labels take
export const ABSCISSA_LABELS_HEIGHT = 1
