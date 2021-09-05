import { graphGradientColor } from '../../utils/colors.js'

import {
  HISTOGRAM_CHARS,
  EMPTY_HISTOGRAM_CHAR,
  FULL_HISTOGRAM_CHAR,
} from './characters.js'
import { getFrequencies } from './frequencies.js'

// Serialize the main part of the histogram, i.e. rows and columns
export const getHistogramRows = function ({
  histogram,
  width,
  height,
  medianIndex,
}) {
  const frequencies = getFrequencies(histogram, width)
  const columns = getHistogramColumns({
    frequencies,
    medianIndex,
    width,
    height,
  })
  return Array.from({ length: height }, (_, index) =>
    getHistogramRow(index, columns, height),
  ).join('\n')
}

// Computes the terminal height of each column for reporting.
const getHistogramColumns = function ({
  frequencies,
  medianIndex,
  width,
  height,
}) {
  const medianMaxWidth = Math.max(medianIndex, width - 1 - medianIndex)
  const maxHeight = getMaxHeight(frequencies, height)
  return frequencies.map(
    getHistogramColumn.bind(undefined, {
      maxHeight,
      medianIndex,
      medianMaxWidth,
    }),
  )
}

// Retrieve max terminal height of columns
const getMaxHeight = function (frequencies, height) {
  return height / Math.max(...frequencies)
}

// Retrieve the height of each column.
// `heightLevel` is the integer part (full character) and `charIndex` is the
// fractional part (final character on top of column).
const getHistogramColumn = function (
  { maxHeight, medianIndex, medianMaxWidth },
  frequency,
  columnIndex,
) {
  const columnHeight = maxHeight * frequency
  const heightLevel = Math.floor(columnHeight)
  const charIndex = Math.ceil(
    (columnHeight - heightLevel) * (HISTOGRAM_CHARS.length - 1),
  )
  const color = getColumnColor(columnIndex, medianIndex, medianMaxWidth)
  return { heightLevel, charIndex, color }
}

// Computes the column gradient color.
const getColumnColor = function (columnIndex, medianIndex, medianMaxWidth) {
  const colorPercentage =
    medianMaxWidth === 0
      ? 0
      : Math.abs(medianIndex - columnIndex) / medianMaxWidth
  return graphGradientColor(colorPercentage)
}

// Serialize a single row, i.e. terminal line
const getHistogramRow = function (index, columns, height) {
  const inverseIndex = height - index - 1
  return columns.map(getHistogramCell.bind(undefined, inverseIndex)).join('')
}

// Retrieve the character to display for a specific row and column
const getHistogramCell = function (
  inverseIndex,
  { heightLevel, charIndex, color },
) {
  if (heightLevel < inverseIndex) {
    return EMPTY_HISTOGRAM_CHAR
  }

  if (heightLevel > inverseIndex) {
    return color(FULL_HISTOGRAM_CHAR)
  }

  return color(HISTOGRAM_CHARS[charIndex])
}
