import stringWidth from 'string-width'

import { SEPARATOR_WIDTH } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

import { getEmptyRowWidth } from './header.js'
import { NAME_RIGHT_PADDING_WIDTH } from './row.js'

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function ({ stats }) {
  return Math.max(...COLUMNS.map((column) => getColumnSize(stats, column)))
}

const getColumnSize = function (stats, column) {
  const stat = stats[`${column}Padded`]
  const headerLength = STAT_TITLES[column].length
  return Math.max(headerLength, stringWidth(stat))
}

// Group all column names into several tables so they fit the screen width
export const getAllColumns = function ({ titles }, screenWidth, columnWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allColumns } = COLUMNS.reduce(
    addColumn.bind(undefined, { availableWidth, columnWidth }),
    { allColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allColumns.reverse()
}

const addColumn = function (
  { availableWidth, columnWidth },
  { allColumns, allColumns: [columns, ...previousColumns], remainingWidth },
  column,
) {
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
