import { padStart } from '../../utils/padding.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { getCombinationName } from '../../utils/title.js'

// Retrieve a single row, including the row name
export const getRow = function ({ titles, stats }, columns, columnWidth) {
  const combinationName = getCombinationName(titles)
  const cells = getCells(stats, columns, columnWidth)
  return `${combinationName}${FIRST_PADDING}${cells}`
}

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

// Padding between the name column and the second column
export const FIRST_PADDING_WIDTH = 2
const FIRST_PADDING = ' '.repeat(FIRST_PADDING_WIDTH)
