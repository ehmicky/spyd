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
    getTable(firstColumn, combinations, columnsA, columnsWidth),
  )
}

const getTable = function (firstColumn, combinations, columns, columnsWidth) {
  const header = getHeader(firstColumn, columns, columnsWidth)
  const rows = getRows(combinations, columns, columnsWidth)
  return `${header}\n${rows}`
}

const getRows = function (combinations, columns, columnsWidth) {
  return combinations
    .map((combination, rowIndex) =>
      getRow({ combination, rowIndex, columns, columnsWidth }),
    )
    .join('\n')
}
