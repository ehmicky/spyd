import { graphGradientColor } from '../colors.js'

import { getFrequencies } from './frequencies.js'

// Serialize the main part of the histogram, i.e. rows and columns
export const getHistogramRows = function ({
  histogram,
  width,
  medianIndex,
  medianMaxWidth,
}) {
  const frequencies = getFrequencies(histogram, width)
  const columns = getHistogramColumns(frequencies, medianIndex, medianMaxWidth)
  return Array.from({ length: HISTOGRAM_HEIGHT }, (_, index) =>
    getHistogramRow(index, columns),
  ).join('\n')
}

// Computes the terminal height of each column for reporting.
const getHistogramColumns = function (
  frequencies,
  medianIndex,
  medianMaxWidth,
) {
  const maxHeight = getMaxHeight(frequencies)
  return frequencies.map(
    getHistogramColumn.bind(undefined, {
      maxHeight,
      medianIndex,
      medianMaxWidth,
    }),
  )
}

// Retrieve max terminal height of columns
const getMaxHeight = function (frequencies) {
  return HISTOGRAM_HEIGHT / Math.max(...frequencies)
}

// Retrieve the height of each column.
// `heightLevel` is the integer part (full character) and `charIndex` is the
// fractional part (final character on top of column).
const getHistogramColumn = function (
  { maxHeight, medianIndex, medianMaxWidth },
  frequency,
  columnIndex,
) {
  const height = maxHeight * frequency
  const heightLevel = Math.floor(height)
  const charIndex = Math.ceil(
    (height - heightLevel) * (HISTOGRAM_CHARS.length - 1),
  )
  const color = getColumnColor(columnIndex, medianIndex, medianMaxWidth)
  return { heightLevel, charIndex, color }
}

// Computes the column gradient color.
const getColumnColor = function (columnIndex, medianIndex, medianMaxWidth) {
  const colorPercentage = Math.abs(medianIndex - columnIndex) / medianMaxWidth
  return graphGradientColor(colorPercentage)
}

// Serialize a single row, i.e. terminal line
const getHistogramRow = function (index, columns) {
  const inverseIndex = HISTOGRAM_HEIGHT - index - 1
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

// Number of terminal lines to display the histogram main content
const HISTOGRAM_HEIGHT = 8
// Characters displaying an increasing percentage visually
const HISTOGRAM_CHARS = [
  ' ',
  '\u2581',
  '\u2582',
  '\u2583',
  '\u2584',
  '\u2585',
  '\u2586',
  '\u2587',
  '\u2588',
]
// Characters displaying 0% and 100% visually
const [EMPTY_HISTOGRAM_CHAR] = HISTOGRAM_CHARS
const FULL_HISTOGRAM_CHAR = HISTOGRAM_CHARS[HISTOGRAM_CHARS.length - 1]
