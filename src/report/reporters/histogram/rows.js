import {
  HISTOGRAM_CHARS,
  EMPTY_HISTOGRAM_CHAR,
  FULL_HISTOGRAM_CHAR,
} from './characters.js'
import { getHistogramColumns } from './columns.js'
import { getFrequencies } from './frequencies.js'

// Serialize the main part of the histogram, i.e. rows and columns
export const getHistogramRows = function ({
  histogram,
  combinationTitles,
  titlesWidth,
  minBlockWidth,
  contentWidth,
  height,
  medianIndex,
  mini,
}) {
  const frequencies = getFrequencies(histogram, contentWidth)
  const columns = getHistogramColumns({
    frequencies,
    medianIndex,
    contentWidth,
    height,
  })
  return Array.from({ length: height }, (_, index) =>
    getHistogramRow({
      index,
      columns,
      combinationTitles,
      titlesWidth,
      minBlockWidth,
      height,
      mini,
    }),
  ).join('')
}

// Serialize a single row, i.e. terminal line
const getHistogramRow = function ({
  index,
  columns,
  combinationTitles,
  titlesWidth,
  minBlockWidth,
  height,
  mini,
}) {
  const titlesSpace =
    mini && index === height - 1 ? combinationTitles : ' '.repeat(titlesWidth)
  const minSpace = ' '.repeat(minBlockWidth)
  const inverseIndex = height - index - 1
  const row = columns
    .map((column) => getHistogramCell(column, inverseIndex))
    .join('')
  return `${titlesSpace}${minSpace}${row}\n`
}

// Retrieve the character to display for a specific row and column
const getHistogramCell = function (
  { heightLevel, charIndex, color },
  inverseIndex,
) {
  if (heightLevel < inverseIndex) {
    return EMPTY_HISTOGRAM_CHAR
  }

  if (heightLevel > inverseIndex) {
    return color(FULL_HISTOGRAM_CHAR)
  }

  return color(HISTOGRAM_CHARS[charIndex])
}
