import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

import { getResponsiveColumns } from './responsive.js'
import { getStatLength } from './row.js'

// Each column is padded to the same width, so that they align vertically
export const getColumnsWidth = function (columns) {
  return Math.max(...columns.map(getColumnWidth))
}

const getColumnWidth = function ({ cellStats, headerNames }) {
  const cellLengths = cellStats.filter(Boolean).map(getStatLength)
  const headerLengths = headerNames.map(getLength)
  return Math.max(...cellLengths, ...headerLengths)
}

export const getAllColumns = function ({
  firstColumn,
  columns,
  screenWidth,
  columnsWidth,
}) {
  const firstColumnWidth = Math.max(...firstColumn.map(getLength))
  const availableWidth = screenWidth - firstColumnWidth
  return getResponsiveColumns({
    availableWidth,
    columnsWidth,
    separatorWidth: COLUMN_SEPARATOR.length,
    columns,
  })
}

const getLength = function ({ length }) {
  return length
}
