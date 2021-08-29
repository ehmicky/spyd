import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

import { getHeaderName, getHeaderLength } from './header.js'
import { getStatLength } from './row.js'

// Retrieved all `stats.*` properties that are not `undefined`, for the columns.
export const getColumns = function (combinations) {
  return STAT_NAMES.map((statName) => getColumn(statName, combinations)).filter(
    columnHasAnyStat,
  )
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
  const headerName = getHeaderName(statName)
  const headerLengths = [getHeaderLength(headerName)]
  const cellStats = combinations.map(({ stats }) => stats[statName])
  return { headerName, headerLengths, cellStats }
}

const columnHasAnyStat = function ({ cellStats }) {
  return cellStats.some(Boolean)
}

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function (combinations, columns) {
  return Math.max(
    ...columns.map((column) => getStatColumnWidth(combinations, column)),
  )
}

const getStatColumnWidth = function (
  combinations,
  { cellStats, headerLengths },
) {
  const cellLengths = cellStats.filter(Boolean).map(getStatLength)
  return Math.max(...cellLengths, ...headerLengths)
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
