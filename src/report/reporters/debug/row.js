import { titleColor } from '../../utils/colors.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { getCombinationName } from '../../utils/title.js'

// Retrieve a single row, including the row name
export const getRow = function ({ titles, stats }, columns, columnWidth) {
  const firstCell = titleColor(getFirstCell(titles))
  const cells = columns
    .map((column) => getCell(stats, column, columnWidth))
    .join(COLUMN_SEPARATOR)
  return `${firstCell}${cells}`
}

export const getFirstCellWidth = function (titles) {
  return getFirstCell(titles).length
}

const getFirstCell = function (titles) {
  const combinationName = getCombinationName(titles)
  return `${combinationName}${FIRST_CELL_PADDING}`
}

const FIRST_CELL_PADDING_WIDTH = 2
const FIRST_CELL_PADDING = ' '.repeat(FIRST_CELL_PADDING_WIDTH)

const getCell = function (stats, column, columnWidth) {
  const stat = getStat(stats, column)
  const paddingWidth = Math.max(columnWidth - getStatLength(stats, column), 0)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${stat}`
}

// Retrieve a single cell in the table, with a specific stat
const getStat = function (stats, column) {
  return stats[column].prettyPaddedColor
}

export const getStatLength = function (stats, column) {
  return stats[column].prettyPadded.length
}
