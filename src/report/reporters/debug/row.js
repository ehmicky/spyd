import { getCombinationNameColor } from '../../utils/first.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'

// Retrieve a single row, including the row name
export const getRow = function (combination, columns, columnWidth) {
  const firstCell = getCombinationNameColor(combination)
  const cells = columns
    .map((column) => getCell(combination, column, columnWidth))
    .join(COLUMN_SEPARATOR)
  return `${firstCell}${cells}`
}

const getCell = function ({ stats }, column, columnWidth) {
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
