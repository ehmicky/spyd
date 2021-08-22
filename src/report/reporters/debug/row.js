import { getCombinationNameColor } from '../../utils/name.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'

// Retrieve a single row, including the row name
export const getRow = function (combination, columns, columnWidth) {
  const combinationName = getCombinationNameColor(combination)
  const cells = columns
    .map((column) => getCell(column, combination, columnWidth))
    .join(COLUMN_SEPARATOR)
  return `${combinationName}${cells}`
}

// Retrieve a single cell in the table, with a specific stat
const getCell = function (column, { stats: { [column]: stat } }, columnWidth) {
  if (stat === undefined) {
    return ' '.repeat(columnWidth)
  }

  const statString = getStat(stat)
  const paddingWidth = Math.max(columnWidth - getStatLength(stat), 0)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${statString}`
}

const getStat = function ({ prettyPaddedColor }) {
  return prettyPaddedColor
}

export const getStatLength = function ({ prettyPadded }) {
  return prettyPadded.length
}
