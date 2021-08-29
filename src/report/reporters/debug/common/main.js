import { getAllColumns } from './columns.js'
import { getHeader } from './header.js'
import { getRow } from './row.js'

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
  const header = getHeader(firstColumn, columns, columnsWidth)
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
