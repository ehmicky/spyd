import { getCombinationNameColor } from '../../../utils/name.js'
import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

// Retrieve a single row, including the row name
export const getRow = function ({
  combination,
  rowIndex,
  columns,
  columnWidth,
}) {
  const combinationName = getCombinationNameColor(combination)
  const cells = columns
    .map((column) => getCell(column[rowIndex], columnWidth))
    .join(COLUMN_SEPARATOR)
  return `${combinationName}${cells}`
}

// Retrieve a single cell in the table, with a specific stat
const getCell = function (stat, columnWidth) {
  if (stat === undefined) {
    return ' '.repeat(columnWidth)
  }

  const paddingWidth = columnWidth - getStatLength(stat)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${stat.prettyColor}`
}

export const getStatLength = function ({ pretty }) {
  return pretty.length
}
