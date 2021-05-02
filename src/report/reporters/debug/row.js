import stringWidth from 'string-width'

import { padStart } from '../../utils/padding.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { getCombinationName } from '../../utils/title.js'

// Retrieve a single row, including the row name
export const getRow = function ({ titles, stats }, columns, columnWidth) {
  const firstCell = getFirstCell(titles)
  const cells = getCells(stats, columns, columnWidth)
  return `${firstCell}${cells}`
}

export const getFirstCellWidth = function (titles) {
  return stringWidth(getFirstCell(titles))
}

const getFirstCell = function (titles) {
  const combinationName = getCombinationName(titles)
  return `${combinationName}${FIRST_CELL_PADDING}`
}

const FIRST_CELL_PADDING_WIDTH = 2
const FIRST_CELL_PADDING = ' '.repeat(FIRST_CELL_PADDING_WIDTH)

// Retrieve a single row, except the row name
const getCells = function (stats, columns, columnWidth) {
  return columns
    .map((column) => getCell(stats, column, columnWidth))
    .join(COLUMN_SEPARATOR)
}

// Retrieve a single cell in the table, with a specific stat
const getCell = function (stats, column, columnWidth) {
  return padStart(getStat(stats, column), columnWidth)
}

export const getStat = function (stats, column) {
  return stats[`${column}Padded`]
}
