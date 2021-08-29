import { getRow } from '../common/row.js'

import { getColumns, getColumnWidth, getAllColumns } from './columns.js'
import { getHeader } from './header.js'

// Retrieve all stats shown in tables
export const getTables = function (combinations, screenWidth) {
  const columns = getColumns(combinations)
  const columnWidth = getColumnWidth(combinations, columns)
  const allColumns = getAllColumns({
    combinations,
    columns,
    screenWidth,
    columnWidth,
  })
  return allColumns.map((columnsA) =>
    getTable(combinations, columnsA, columnWidth),
  )
}

const getTable = function (combinations, columns, columnWidth) {
  const header = getHeader(combinations, columns, columnWidth)
  const rows = getRows(combinations, columns, columnWidth)
  return `${header}\n${rows}`
}

const getRows = function (combinations, columns, columnWidth) {
  return combinations
    .map((combination, rowIndex) =>
      getRow({ combination, rowIndex, columns, columnWidth }),
    )
    .join('\n')
}
