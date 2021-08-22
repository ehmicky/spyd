import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { SEPARATOR_WIDTH } from '../../../utils/separator.js'

import { getStatLength } from './row.js'

export const getColumnWidth = function (columns) {
  const widths = columns.flat().filter(Boolean).map(getStatLength)
  return Math.max(...widths)
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
