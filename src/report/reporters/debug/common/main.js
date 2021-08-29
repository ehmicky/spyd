import { padString } from '../../../utils/pad.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

import { getAllColumns } from './columns.js'
import { getHeader } from './header.js'

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
