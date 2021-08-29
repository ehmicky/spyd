import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

import { getStatLength } from './row.js'

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function (columns) {
  return Math.max(...columns.map(getStatColumnWidth))
}

const getStatColumnWidth = function ({ cellStats, headerNames }) {
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
