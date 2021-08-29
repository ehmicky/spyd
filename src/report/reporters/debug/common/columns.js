import { getCombinationNameWidth } from '../../../utils/name.js'
import { COLUMN_SEPARATOR } from '../../../utils/separator.js'

import { getResponsiveColumns } from './responsive.js'
import { getStatLength } from './row.js'

// Each column is padded to the same width, so that they align vertically
export const getColumnsWidth = function (columns) {
  return Math.max(...columns.map(getColumnWidth))
}

const getColumnWidth = function ({ cellStats, headerNames }) {
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
  columnsWidth,
}) {
  const availableWidth = screenWidth - getCombinationNameWidth(combinations[0])
  return getResponsiveColumns({
    availableWidth,
    columnsWidth,
    separatorWidth: COLUMN_SEPARATOR.length,
    columns,
  })
}
