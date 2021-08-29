import { padString } from '../../../utils/pad.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

// Retrieve a single row, including the row name
export const getRow = function ({
  firstCell,
  rowIndex,
  columns,
  columnsWidth,
}) {
  const cells = columns
    .map(({ cellStats }) => padString(cellStats[rowIndex], columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${firstCell}${cells}`
}
