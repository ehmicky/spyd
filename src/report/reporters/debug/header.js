import { fieldColor } from '../../utils/colors.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

import { getFirstCellWidth } from './row.js'

// Retrieve the header row
export const getHeader = function ([{ titles }], columns, columnWidth) {
  const firstCell = ' '.repeat(getFirstCellWidth(titles))
  const headerCells = getHeaderCells(columns, columnWidth)
  return `${firstCell}${headerCells}`
}

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
