import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

import { getHeaderLength } from './header.js'
import { getStatLength } from './row.js'

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
export const getColumns = function (combinations) {
  return COLUMNS.filter(
    (column) => getAnyCombinationColumn(combinations, column) !== undefined,
  )
}

const getAnyCombinationColumn = function (combinations, column) {
  return combinations.map(({ stats }) => stats[column]).find(Boolean)
}

// List of columns, with their `stats.*` property.
// Order is significant as it is displayed in that order.
const COLUMNS = [
  'median',
  'medianMin',
  'medianMax',
  'mean',
  'min',
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

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function (combinations, columns) {
  return Math.max(
    ...columns.map((column) => getStatColumnWidth(combinations, column)),
  )
}

const getStatColumnWidth = function (combinations, column) {
  const cellLengths = combinations
    .map(({ stats }) => stats[column])
    .filter(Boolean)
    .map(getStatLength)
  return Math.max(...cellLengths, getHeaderLength(column))
}

export const getAllColumns = function ({
  combinations,
  columns,
  screenWidth,
  columnWidth,
}) {
  const availableWidth = screenWidth - getCombinationNameWidth(combinations[0])
  return getResponsiveColumns({
    availableWidth,
    columnWidth,
    separatorWidth: COLUMN_SEPARATOR.length,
    columns,
  })
}
