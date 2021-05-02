import stringWidth from 'string-width'

import { fieldColor } from '../../utils/colors.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getCombinationName } from '../../utils/title.js'

import { getCell } from './cell.js'
import { NAME_RIGHT_PADDING } from './column.js'

// Retrieve the header row
export const getHeader = function ({ titles, stats }, statColumns) {
  const emptyRowName = getEmptyRowName(titles)
  const headerCells = getHeaderCells(stats, statColumns)
  return `${emptyRowName}${NAME_RIGHT_PADDING}${headerCells}`
}

// Retrieve the spaces left instead of combination name in the header
const getEmptyRowName = function (titles) {
  return ' '.repeat(getEmptyRowWidth(titles))
}

export const getEmptyRowWidth = function (titles) {
  return stringWidth(getCombinationName(titles))
}

const getHeaderCells = function (stats, statColumns) {
  return statColumns
    .map((name) => getHeaderCell(stats, name))
    .join(COLUMN_SEPARATOR)
}

// Retrieve a cell in the header row
const getHeaderCell = function (stats, name) {
  const columnWidth = getColumnWidth(stats, name)
  const headerName = STAT_TITLES[name].padStart(columnWidth)
  return fieldColor(headerName)
}

export const getColumnWidth = function (stats, name) {
  return stringWidth(getCell(stats, name))
}
