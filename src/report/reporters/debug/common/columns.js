import stringWidth from 'string-width'

import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

import { getResponsiveColumns } from './responsive.js'

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
