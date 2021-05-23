import { getResponsiveColumns } from '../../utils/responsive.js'
import { SEPARATOR_WIDTH } from '../../utils/separator.js'

import { getHeaderName } from './header.js'
import { getStatLength } from './row.js'

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function ([{ stats }]) {
  return Math.max(...COLUMNS.map((column) => getStatColumnWidth(stats, column)))
}

const getStatColumnWidth = function (stats, column) {
  return Math.max(getStatLength(stats, column), getHeaderName(column).length)
}

export const getAllColumns = function (combinations, screenWidth, columnWidth) {
  return getResponsiveColumns({
    combinations,
    screenWidth,
    columnWidth,
    separatorWidth: SEPARATOR_WIDTH,
    columns: COLUMNS,
  })
}

// List of columns, with their `stats.*` property
const COLUMNS = [
  'median',
  'medianLow',
  'medianHigh',
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
