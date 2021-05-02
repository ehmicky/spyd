import { PADDING_WIDTH, SEPARATOR_WIDTH } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_COLUMNS } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allStatColumns } = STAT_COLUMNS.reduce(
    (state, name) =>
      reduceAllStateColumns(state, { name, stats, availableWidth }),
    { allStatColumns: [], widthLeft: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allStatColumns.reverse()
}

const reduceAllStateColumns = function (
  {
    allStatColumns,
    allStatColumns: [statColumns, ...previousStatColumns],
    widthLeft,
  },
  { name, stats, availableWidth },
) {
  const columnWidth = getColumnWidth(stats, name)
  const widthLeftA = widthLeft - columnWidth - SEPARATOR_WIDTH
  return widthLeftA >= 0
    ? {
        allStatColumns: [[...statColumns, name], ...previousStatColumns],
        widthLeft: widthLeftA,
      }
    : {
        allStatColumns: [[name], ...allStatColumns],
        widthLeft: availableWidth - columnWidth - PADDING_WIDTH,
      }
}
