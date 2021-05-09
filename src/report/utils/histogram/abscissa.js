import { separatorColor } from '../colors.js'

import { TICK_MIDDLE, HORIZONTAL_LINE } from './characters.js'

// Retrieve the horizontal line and the abscissa below the main content.
// Includes the tick above the median positions and their labels.
export const getAbscissa = function (width, positions) {
  const bottomLine = getBottomLine(width, positions)
  const labels = getLabels(width, positions)
  return `${separatorColor(bottomLine)}
${labels}`
}

const getBottomLine = function (width, positions) {
  return positions
    .reduce(addTick.bind(undefined, width), '')
    .padEnd(width, HORIZONTAL_LINE)
}

const addTick = function (width, bottomLine, { index }) {
  const lineWidth = index - bottomLine.length
  return lineWidth < 0
    ? bottomLine
    : `${bottomLine}${HORIZONTAL_LINE.repeat(lineWidth)}${TICK_MIDDLE}`
}

const getLabels = function (width, positions) {
  const labels = positions.reduce(addLabel.bind(undefined, width), '')
  const labelsA = trimWidth(labels, width)
  return labelsA
}

// First label is padded in the opposite direction. This works well with two
// labels since they are padded in opposite ways which allows them not to take
// space from the other one.
const addLabel = function (width, labels, { index, pretty, prettyColor }) {
  const spacesWidth =
    labels === ''
      ? Math.max(index - pretty.length + 1, 0)
      : Math.max(index - labels.length, 1)
  const spaces = ' '.repeat(spacesWidth)
  return `${labels}${spaces}${prettyColor}`
}

// When some labels are close to the end, they might go over the maximum width.
// We fix this by pushing them leftward by removing any spaces before them until
// they fit within the maximum width.
// Uses imperative code for performance.
// eslint-disable-next-line complexity, max-statements
const trimWidth = function (labels, width) {
  // eslint-disable-next-line fp/no-let
  let excessWidth = labels.length - width

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
