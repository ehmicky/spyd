import stringWidth from 'string-width'

import { fieldColor } from '../../utils/colors.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

import { getCell } from './cell.js'
import { STAT_COLUMNS, COLUMN_SEPARATOR } from './column.js'
import { getEmptyRowName } from './row.js'

// Retrieve the header row
export const getHeader = function ({ row, stats }) {
  const emptyRowName = getEmptyRowName(row)
  const headerCells = STAT_COLUMNS.map((name) =>
    getHeaderCell(stats, name),
  ).join(COLUMN_SEPARATOR)
  return `${emptyRowName} ${headerCells}`
}

// Retrieve a cell in the header row
const getHeaderCell = function (stats, name) {
  const length = stringWidth(getCell(stats, name))
  const headerName = STAT_TITLES[name].padStart(length)
  return fieldColor(headerName)
}
