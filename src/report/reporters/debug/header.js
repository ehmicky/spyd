import { fieldColor } from '../../utils/colors.js'
import { getCombinationNameWidth } from '../../utils/name.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

// Retrieve the header row
export const getHeader = function ([combination], columns, columnWidth) {
  if (columns.length === 0) {
    return NON_TRIMMABLE_SPACE
  }

  const combinationNamePadding = ' '.repeat(
    getCombinationNameWidth(combination),
  )
  const headerCells = getHeaderCells(columns, columnWidth)
  return `${combinationNamePadding}${headerCells}`
}

// Keep space for the header to avoid jitter due to trimming, while still
const NON_TRIMMABLE_SPACE = '\u200B'

const getHeaderCells = function (columns, columnWidth) {
  return columns
    .map((column) => getHeaderCell(column, columnWidth))
    .join(COLUMN_SEPARATOR)
}

// Retrieve a cell in the header row
const getHeaderCell = function (column, columnWidth) {
  const headerName = getHeaderName(column).padStart(columnWidth)
  return fieldColor(headerName)
}

export const getHeaderName = function (column) {
  return STAT_TITLES[column]
}
