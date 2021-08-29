import { getCombinationNamePadded } from '../../../utils/name.js'

import { getColumnsWidth, getAllColumns } from './columns.js'
import { getHeader } from './header.js'
import { getRow } from './row.js'

export const getTables = function (combinations, columns, screenWidth) {
  const firstColumn = combinations.map(getCombinationNamePadded)
  const columnsWidth = getColumnsWidth(columns)
  const allColumns = getAllColumns({
    firstColumn,
    columns,
    screenWidth,
    columnsWidth,
  })
  return allColumns.map((columnsA) =>
    getTable(firstColumn, columnsA, columnsWidth),
  )
}

const getTable = function (firstColumn, columns, columnsWidth) {
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
