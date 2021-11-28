import { padString } from '../pad.js'
import { TITLE_SEPARATOR_COLORED } from '../separator.js'

export const getSingleTable = function ({
  tableRows,
  rowsLeft,
  leftWidth,
  columnsWidth,
  columnSeparatorColored,
}) {
  return tableRows
    .map((row, rowIndex) =>
      getRow({
        row,
        leftCell: rowsLeft[rowIndex],
        leftWidth,
        columnsWidth,
        columnSeparatorColored,
      }),
    )
    .join('')
}

const getRow = function ({
  row,
  leftCell,
  leftWidth,
  columnsWidth,
  columnSeparatorColored,
}) {
  const rowA = row
    .map((cell) => padString(cell, columnsWidth))
    .join(columnSeparatorColored)
  return leftWidth === 0
    ? `${rowA}\n`
    : `${padString(leftCell, leftWidth)}${TITLE_SEPARATOR_COLORED}${rowA}\n`
}
