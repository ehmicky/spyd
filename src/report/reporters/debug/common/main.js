import { padString } from '../../../utils/pad.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

import { getAllColumns } from './columns.js'

export const getTables = function (firstColumn, columns, screenWidth) {
  const { allColumns, columnsWidth, firstColumnWidth } = getAllColumns(
    firstColumn,
    columns,
    screenWidth,
  )
  return allColumns.map((columnsA) =>
    getTable({
      firstColumn,
      columns: columnsA,
      columnsWidth,
      firstColumnWidth,
    }),
  )
}

const getTable = function ({
  firstColumn,
  columns,
  columnsWidth,
  firstColumnWidth,
}) {
  const header = getHeader(columns, columnsWidth, firstColumnWidth)
  const rows = getRows(firstColumn, columns, columnsWidth)
  return `${header}\n${rows}`
}

// Retrieve the header rows
const getHeader = function (columns, columnsWidth, firstColumnWidth) {
  const combinationNamePadding = ' '.repeat(firstColumnWidth)
  const { length } = columns[0].headerNames
  return Array.from({ length }, (_, rowIndex) =>
    getHeaderRow({ columns, columnsWidth, rowIndex, combinationNamePadding }),
  ).join('\n')
}

const getHeaderRow = function ({
  columns,
  columnsWidth,
  rowIndex,
  combinationNamePadding,
}) {
  const headerCells = columns
    .map(({ headerNames }) => padString(headerNames[rowIndex], columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${combinationNamePadding}${headerCells}`
}

const getRows = function (firstColumn, columns, columnsWidth) {
  return firstColumn
    .map((firstCell, rowIndex) =>
      getRow({ firstCell, rowIndex, columns, columnsWidth }),
    )
    .join('\n')
}

// Retrieve a single row, including the row name
const getRow = function ({ firstCell, rowIndex, columns, columnsWidth }) {
  const cells = columns
    .map(({ cellStats }) => padString(cellStats[rowIndex] || '', columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${firstCell}${cells}`
}
