import stringWidth from 'string-width'

import { fieldColor } from '../../utils/colors.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getCombinationName } from '../../utils/title.js'

import { getCell } from './cell.js'
import { STAT_COLUMNS, COLUMN_SEPARATOR } from './column.js'

// Retrieve the header row
export const getHeader = function ({ titles, stats }) {
  const emptyRowName = getEmptyRowName(titles)
  const headerCells = getHeaderCells(stats)
  return `${emptyRowName} ${headerCells}`
}

// Retrieve the spaces left instead of combination name in the header
const getEmptyRowName = function (titles) {
  const combinationName = getCombinationName(titles)
  return ' '.repeat(stringWidth(combinationName))
}

const getHeaderCells = function (stats) {
  return STAT_COLUMNS.map((name) => getHeaderCell(stats, name)).join(
    COLUMN_SEPARATOR,
  )
}

// Retrieve a cell in the header row
const getHeaderCell = function (stats, name) {
  const length = stringWidth(getCell(stats, name))
  const headerName = STAT_TITLES[name].padStart(length)
  return fieldColor(headerName)
}
