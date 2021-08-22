import { getCombinationNameWidth } from '../../utils/name.js'
import { getResponsiveColumns } from '../../utils/responsive.js'
import { SEPARATOR_WIDTH } from '../../utils/separator.js'

import { getHeaderName } from './header.js'
import { getStatLength } from './row.js'

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
export const getColumns = function (combinations) {
  return COLUMNS.filter((column) => hasColumn(combinations, column))
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

const hasColumn = function (combinations, column) {
  return combinations.some(({ stats }) => stats[column] !== undefined)
}

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function (combinations, columns) {
  return Math.max(
    ...columns.map((column) => getStatColumnWidth(combinations, column)),
  )
}

const getStatColumnWidth = function (combinations, column) {
  const { stats } = combinations.find(
    (combination) => combination.stats[column] !== undefined,
  )
  return Math.max(getStatLength(stats[column]), getHeaderName(column).length)
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
