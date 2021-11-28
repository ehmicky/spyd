export const getTablesRows = function ({
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
