import stringWidth from 'string-width'

import { padString } from '../pad.js'
import {
  TITLE_SEPARATOR,
  TITLE_SEPARATOR_COLORED,
  getColSeparator,
  getColSeparatorColored,
} from '../separator.js'

// Serialize a matrix of strings to a table.
// Rows might have different array lengths, including 0.
// In the output, each column has the same width.
// If the table is too big for the `screenWidth`, columns are split into several
// tables.
// The first column is special:
//  - It is repeated in each table
//  - It does not use a column separator
//  - It has its own width
//  - It is omitted if only filled with empty strings
export const getTables = function (rows, screenWidth, mini = false) {
  const rowsLeft = rows.map(getRowLeft)
  const rowsRight = rows.map(getRowRight)
  const leftWidth = Math.max(...rowsLeft.map(stringWidth))
  const columnsWidth = Math.max(...rowsRight.flat().map(stringWidth))
  const availableWidth = getAvailableWidth(screenWidth, leftWidth)
  const columnSeparator = getColSeparator(mini)
  const columnSeparatorColored = getColSeparatorColored(mini)
  const tablesRows = getTablesRows({
    rows: rowsRight,
    availableWidth,
    columnsWidth,
    columnSeparator,
  })
  return tablesRows
    .map((tableRows) =>
      getTable({
        tableRows,
        rowsLeft,
        leftWidth,
        columnsWidth,
        columnSeparatorColored,
      }),
    )
    .join('\n')
}

const getRowLeft = function ([leftCell = '']) {
  return leftCell
}

const getRowRight = function ([, ...rightCells]) {
  return rightCells
}

const getAvailableWidth = function (screenWidth, leftWidth) {
  return leftWidth === 0
    ? screenWidth
    : screenWidth - leftWidth - TITLE_SEPARATOR.length
}

const getTablesRows = function ({
  rows,
  availableWidth,
  columnsWidth,
  columnSeparator,
}) {
  const separatorWidth = columnSeparator.length
  const columnsCountFloat =
    (availableWidth + separatorWidth) / (columnsWidth + separatorWidth)
  const columnsCount = Math.max(Math.floor(columnsCountFloat), 1)
  const rowsMaxLength = Math.max(...rows.map(getRowLength))
  const tablesCount = Math.max(Math.ceil(rowsMaxLength / columnsCount), 1)
  return Array.from({ length: tablesCount }, (_, tableIndex) =>
    getTableRows({ rows, rowsMaxLength, tableIndex, columnsCount }),
  )
}

const getRowLength = function ({ length }) {
  return length
}

const getTableRows = function ({
  rows,
  rowsMaxLength,
  tableIndex,
  columnsCount,
}) {
  const tableColumnsCount = Math.min(
    columnsCount,
    rowsMaxLength - columnsCount * tableIndex,
  )
  return rows.map((row) =>
    getTableRow({ row, tableIndex, columnsCount, tableColumnsCount }),
  )
}

const getTableRow = function ({
  row,
  tableIndex,
  columnsCount,
  tableColumnsCount,
}) {
  const tableRow = row.slice(
    columnsCount * tableIndex,
    columnsCount * (tableIndex + 1),
  )
  const emptyCells = new Array(tableColumnsCount - tableRow.length).fill('')
  return [...tableRow, ...emptyCells]
}

const getTable = function ({
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
