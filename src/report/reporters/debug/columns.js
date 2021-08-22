import { getCombinationNameWidth } from '../../utils/name.js'
import { getResponsiveColumns } from '../../utils/responsive.js'
import { SEPARATOR_WIDTH } from '../../utils/separator.js'

import { getHeaderName } from './header.js'
import { getStatLength } from './row.js'

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
export const getColumns = function ([{ stats }]) {
  return COLUMNS.filter((column) => stats[column] !== undefined)
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
export const getColumnWidth = function ([{ stats }], columns) {
  return Math.max(...columns.map((column) => getStatColumnWidth(stats, column)))
}

const getStatColumnWidth = function (stats, column) {
  return Math.max(getStatLength(stats, column), getHeaderName(column).length)
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
    separatorWidth: SEPARATOR_WIDTH,
    columns,
  })
}
