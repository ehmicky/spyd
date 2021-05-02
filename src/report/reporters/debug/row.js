import stringWidth from 'string-width'

import { padStart } from '../../utils/padding.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getCombinationName } from '../../utils/title.js'

// Retrieve a single row, including the row name
export const getRow = function ({ titles, stats }, columns) {
  const combinationName = getCombinationName(titles)
  const cells = getCells(stats, columns)
  return `${combinationName}${NAME_RIGHT_PADDING}${cells}`
}

// Retrieve a single row, except the row name
const getCells = function (stats, columns) {
  return columns.map((column) => getCell(stats, column)).join(COLUMN_SEPARATOR)
}

// Retrieve a single cell in the table, with a specific stat
export const getCell = function (stats, column) {
  const stat = stats[`${column}Padded`]
  const headerLength = STAT_TITLES[column].length
  const padSize = Math.max(headerLength, stringWidth(stat))

  const statA = padStart(stat, padSize)
  return statA
}

// Padding between the name column and the second column
export const NAME_RIGHT_PADDING_WIDTH = 2
export const NAME_RIGHT_PADDING = ' '.repeat(NAME_RIGHT_PADDING_WIDTH)
