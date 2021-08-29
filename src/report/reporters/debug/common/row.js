import { getCombinationNameColor } from '../../../utils/name.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

// Retrieve a single row, including the row name
export const getRow = function ({
  combination,
  rowIndex,
  columns,
  columnsWidth,
}) {
  const combinationName = getCombinationNameColor(combination)
  const cells = columns
    .map(({ cellStats }) => getCell(cellStats[rowIndex], columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${combinationName}${cells}`
}

// Retrieve a single cell in the table, with a specific stat
const getCell = function (stat, columnsWidth) {
  if (stat === undefined) {
    return ' '.repeat(columnsWidth)
  }

  const paddingWidth = columnsWidth - getStatLength(stat)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${stat.prettyColor}`
}

export const getStatLength = function ({ pretty }) {
  return pretty.length
}
