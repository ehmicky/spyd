import { getColumns, getColumnWidth, getAllColumns } from './columns.js'
import { getRow } from './row.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations, screenWidth) {
  const columns = getColumns(history, combinations)
  const columnWidth = getColumnWidth(columns)
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
  return combinations
    .map((combination, rowIndex) =>
      getRow({ combination, rowIndex, columns, columnWidth }),
    )
    .join('\n')
}
