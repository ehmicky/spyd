import { graphGradientColor } from '../../utils/colors.js'

import { HISTOGRAM_CHARS } from './characters.js'

// Computes the terminal height of each column for reporting.
export const getHistogramColumns = function ({
  frequencies,
  medianIndex,
  contentWidth,
  height,
}) {
  const medianMaxWidth = Math.max(medianIndex, contentWidth - 1 - medianIndex)
  const maxHeight = getMaxHeight(frequencies, height)
  return frequencies.map((frequency, columnIndex) =>
    getHistogramColumn({
      frequency,
      columnIndex,
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
const getHistogramColumn = function ({
  frequency,
  columnIndex,
  maxHeight,
  medianIndex,
  medianMaxWidth,
}) {
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
