import { SEPARATOR_WIDTH } from '../../utils/separator.js'

import { getEmptyRowWidth, getColumnWidth } from './header.js'
import { NAME_RIGHT_PADDING_WIDTH } from './row.js'

// Group all column names into several tables so they fit the screen width
export const getAllColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allColumns } = COLUMNS.reduce(
    addColumn.bind(undefined, { stats, availableWidth }),
    { allColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allColumns.reverse()
}

const addColumn = function (
  { stats, availableWidth },
  { allColumns, allColumns: [columns, ...previousColumns], remainingWidth },
  column,
) {
  const columnWidth = getColumnWidth(stats, column)
  const remainingWidthA = remainingWidth - columnWidth - SEPARATOR_WIDTH
  return remainingWidthA >= 0
    ? {
        allColumns: [[...columns, column], ...previousColumns],
        remainingWidth: remainingWidthA,
      }
    : {
        allColumns: [[column], ...allColumns],
        remainingWidth: availableWidth - columnWidth,
      }
}

// List of columns, with their `stats.*` property
const COLUMNS = [
  'median',
  'mean',
  'min',
  'low',
  'high',
  'max',
  'diff',
  'stdev',
  'rstdev',
  'moe',
  'rmoe',
  'times',
  'loops',
  'repeat',
  'samples',
  'minLoopDuration',
]
