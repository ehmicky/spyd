import { PADDING_WIDTH, SEPARATOR_WIDTH } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_NAMES } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allStatColumns } = STAT_NAMES.reduce(
    (state, statName) =>
      reduceAllStateColumns(state, { statName, stats, availableWidth }),
    { allStatColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allStatColumns.reverse()
}

const reduceAllStateColumns = function (
  {
    allStatColumns,
    allStatColumns: [statColumns, ...previousStatColumns],
    remainingWidth,
  },
  { statName, stats, availableWidth },
) {
  const columnWidth = getColumnWidth(stats, statName)
  const remainingWidthA = remainingWidth - columnWidth - SEPARATOR_WIDTH
  return remainingWidthA >= 0
    ? {
        allStatColumns: [[...statColumns, statName], ...previousStatColumns],
        remainingWidth: remainingWidthA,
      }
    : {
        allStatColumns: [[statName], ...allStatColumns],
        remainingWidth: availableWidth - columnWidth - PADDING_WIDTH,
      }
}
