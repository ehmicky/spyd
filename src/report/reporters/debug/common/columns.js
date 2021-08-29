import stringWidth from 'string-width'

import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

export const getAllColumns = function (firstColumn, columns, screenWidth) {
  const columnsWidth = Math.max(...columns.map(getColumnWidth))
  const firstColumnWidth = Math.max(...firstColumn.map(stringWidth))
  const availableWidth = screenWidth - firstColumnWidth
  const allColumns = getResponsiveColumns({
    availableWidth,
    columnsWidth,
    separatorWidth: COLUMN_SEPARATOR.length,
    columns,
  })
  return { allColumns, columnsWidth, firstColumnWidth }
}

// Each column is padded to the same width, so that they align vertically
const getColumnWidth = function ({ cellStats, headerNames }) {
  const cellLengths = cellStats.map(stringWidth)
  const headerLengths = headerNames.map(stringWidth)
  return Math.max(...cellLengths, ...headerLengths)
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
