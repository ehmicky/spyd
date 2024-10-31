import stringWidth from 'string-width'

import {
  getColSeparator,
  getColSeparatorColored,
  TITLE_SEPARATOR,
} from '../separator.js'

import { getTablesRows } from './rows.js'
import { getSingleTable } from './single.js'

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
export const getTables = (rows, screenWidth, mini = false) => {
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
      getSingleTable({
        tableRows,
        rowsLeft,
        leftWidth,
        columnsWidth,
        columnSeparatorColored,
      }),
    )
    .join('\n')
}

const getRowLeft = ([leftCell = '']) => leftCell

const getRowRight = ([, ...rightCells]) => rightCells

const getAvailableWidth = (screenWidth, leftWidth) =>
  leftWidth === 0
    ? screenWidth
    : screenWidth - leftWidth - TITLE_SEPARATOR.length
