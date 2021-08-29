import stringWidth from 'string-width'

import { COLUMN_SEPARATOR } from '../../../utils/separator.js'
import { NON_TRIMMABLE_SPACE } from '../../../utils/space.js'

export const getAllColumns = function (firstColumn, columns, screenWidth) {
  const columnsA = columns.length === 0 ? EMPTY_COLUMNS : columns
  const columnsWidth = Math.max(...columnsA.map(getColumnWidth))
  const firstColumnWidth = Math.max(...firstColumn.map(stringWidth))
  const availableWidth = screenWidth - firstColumnWidth
  const allColumns = getResponsiveColumns({
    availableWidth,
    columnsWidth,
    separatorWidth: COLUMN_SEPARATOR.length,
    columns: columnsA,
  })
  return { allColumns, columnsWidth, firstColumnWidth }
}

const EMPTY_COLUMNS = [{ headerNames: [NON_TRIMMABLE_SPACE], cellStats: [] }]

// Each column is padded to the same width, so that they align vertically
const getColumnWidth = function ({ cellStats, headerNames }) {
  return Math.max(...[...cellStats, ...headerNames].map(stringWidth))
}

// Fit several `columns` of same width (`columnsWidth`) responsively in a
// terminal of `availableWidth` by putting them into several groups meant to be
// printed on different lines.
const getResponsiveColumns = function ({
  availableWidth,
  columnsWidth,
  separatorWidth,
  columns,
}) {
  const { allColumns } = columns.reduce(
    addColumn.bind(undefined, { availableWidth, columnsWidth, separatorWidth }),
    { allColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allColumns.reverse()
}

const addColumn = function (
  { availableWidth, columnsWidth, separatorWidth },
  { allColumns, allColumns: [columns, ...previousColumns], remainingWidth },
  column,
) {
  const remainingWidthA = remainingWidth - columnsWidth - separatorWidth
  return remainingWidthA >= 0
    ? {
        allColumns: [[...columns, column], ...previousColumns],
        remainingWidth: remainingWidthA,
      }
    : {
        allColumns: [[column], ...allColumns],
        remainingWidth: availableWidth - columnsWidth,
      }
}
