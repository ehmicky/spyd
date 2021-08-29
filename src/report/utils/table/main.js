import { padString } from '../pad.js'
import { COLUMN_SEPARATOR_COLORED } from '../separator.js'
import { NON_TRIMMABLE_SPACE } from '../space.js'

import { getAllColumns } from './columns.js'

export const getTables = function ({
  firstColumn,
  columns,
  headerHeight,
  screenWidth,
}) {
  const { allColumns, columnsWidth, firstColumnWidth } = getAllColumns(
    firstColumn,
    columns,
    screenWidth,
  )
  return allColumns.map((columnsA) =>
    getTable({
      firstColumn,
      columns: columnsA,
      headerHeight,
      columnsWidth,
      firstColumnWidth,
    }),
  )
}

const getTable = function ({
  firstColumn,
  columns,
  headerHeight,
  columnsWidth,
  firstColumnWidth,
}) {
  const header = getHeader({
    columns,
    headerHeight,
    columnsWidth,
    firstColumnWidth,
  })
  const rows = getRows(firstColumn, columns, columnsWidth)
  return `${header}\n${rows}`
}

// Retrieve the header rows
const getHeader = function ({
  columns,
  headerHeight,
  columnsWidth,
  firstColumnWidth,
}) {
  const firstColumnPadding = ' '.repeat(firstColumnWidth)
  return Array.from({ length: headerHeight }, (_, rowIndex) =>
    getHeaderRow({ columns, columnsWidth, rowIndex, firstColumnPadding }),
  ).join('\n')
}

const getHeaderRow = function ({
  columns,
  columnsWidth,
  rowIndex,
  firstColumnPadding,
}) {
  if (columns.length === 0) {
    return NON_TRIMMABLE_SPACE
  }

  const headerCells = columns
    .map(({ headerNames }) => padString(headerNames[rowIndex], columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${firstColumnPadding}${headerCells}`
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
