import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { COLUMN_SEPARATOR } from '../../../utils/separator.js'
import { NON_TRIMMABLE_SPACE } from '../../../utils/space.js'
import { getStatLength } from '../common/row.js'

import { getHeaderNames } from './header.js'

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
export const getColumns = function (combinations) {
  const columns = STAT_NAMES.map((statName) =>
    getColumn(statName, combinations),
  ).filter(columnHasAnyStat)
  return columns.length === 0 ? EMPTY_COLUMNS : columns
}

// List of columns, with their `stats.*` property.
// Order is significant as it is displayed in that order.
const STAT_NAMES = [
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

const getColumn = function (statName, combinations) {
  const headerNames = getHeaderNames(statName)
  const cellStats = combinations.map(({ stats }) => stats[statName])
  return { headerNames, cellStats }
}

const columnHasAnyStat = function ({ cellStats }) {
  return cellStats.some(Boolean)
}

const EMPTY_COLUMNS = [{ headerNames: [NON_TRIMMABLE_SPACE], cellStats: [] }]

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function (combinations, columns) {
  return Math.max(
    ...columns.map((column) => getStatColumnWidth(combinations, column)),
  )
}

const getStatColumnWidth = function (combinations, { cellStats, headerNames }) {
  const cellLengths = cellStats.filter(Boolean).map(getStatLength)
  const headerLengths = headerNames.map(getHeaderLength)
  return Math.max(...cellLengths, ...headerLengths)
}

const getHeaderLength = function ({ length }) {
  return length
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
