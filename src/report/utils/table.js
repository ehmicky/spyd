import stringWidth from 'string-width'

import { joinSections } from './join.js'
import { padString } from './pad.js'
import {
  NAME_SEPARATOR,
  NAME_SEPARATOR_COLORED,
  COLUMN_SEPARATOR,
  COLUMN_SEPARATOR_COLORED,
} from './separator.js'
import { NON_TRIMMABLE_SPACE } from './space.js'

// Serialize a matrix of strings to a table.
// Rows might have different array lengths, including 0.
// In the output, each column has the same width.
// If the table is too big for the `screenWidth`, columns are split into several
// tables.
// The first column is special:
//  - It is repeated in each table
//  - It does not use a column separator
//  - It has its own width
export const getTables = function (rows, screenWidth) {
  const rowsLeft = rows.map(getRowLeft)
  const rowsRight = rows.map(getRowRight)
  const leftWidth = Math.max(...rowsLeft.map(stringWidth))
  const columnsWidth = Math.max(...rowsRight.flat().map(stringWidth))
  const availableWidth = screenWidth - leftWidth - NAME_SEPARATOR.length
  const tablesRows = getTablesRows(rowsRight, availableWidth, columnsWidth)
  const sections = tablesRows.map((tableRows) =>
    getTable({ tableRows, rowsLeft, leftWidth, columnsWidth }),
  )
  return joinSections(sections)
}

const getRowLeft = function ([leftCell = '']) {
  return leftCell
}

const getRowRight = function ([, ...rightCells]) {
  return rightCells
}

const getTablesRows = function (rows, availableWidth, columnsWidth) {
  const separatorWidth = COLUMN_SEPARATOR.length
  const columnsCount = Math.max(
    Math.floor(
      (availableWidth + separatorWidth) / (columnsWidth + separatorWidth),
    ),
    1,
  )
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

const getTable = function ({ tableRows, rowsLeft, leftWidth, columnsWidth }) {
  return tableRows
    .map((row, rowIndex) =>
      getRow({ row, leftCell: rowsLeft[rowIndex], leftWidth, columnsWidth }),
    )
    .join('\n')
}

const getRow = function ({ row, leftCell, leftWidth, columnsWidth }) {
  const leftCellA = padString(leftCell, leftWidth)
  const rowA = row
    .map((cell) => padString(cell, columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  const rowB = `${leftCellA}${NAME_SEPARATOR_COLORED}${rowA}`
  return rowB.trim() === '' ? NON_TRIMMABLE_SPACE : rowB
}
