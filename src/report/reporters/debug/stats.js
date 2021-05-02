import { PADDING_WIDTH, SEPARATOR_WIDTH } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_COLUMNS } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allStatColumns } = STAT_COLUMNS.reduce(
    (state, name) =>
      reduceAllStateColumns(state, { name, stats, availableWidth }),
    { allStatColumns: [[]], widthLeft: availableWidth, paddingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allStatColumns.reverse()
}

const reduceAllStateColumns = function (
  {
    allStatColumns: [statColumns, ...previousStatColumns],
    widthLeft,
    paddingWidth,
  },
  { name, stats, availableWidth },
) {
  const widthLeftA = widthLeft - paddingWidth
  const columnWidth = getColumnWidth(stats, name)

  return statColumns.length === 0 || widthLeftA >= columnWidth + SEPARATOR_WIDTH
    ? {
        allStatColumns: [[...statColumns, name], ...previousStatColumns],
        widthLeft: widthLeftA - columnWidth,
        paddingWidth:
          statColumns.length === 0 ? PADDING_WIDTH : SEPARATOR_WIDTH,
      }
    : {
        allStatColumns: [[name], statColumns, ...previousStatColumns],
        widthLeft: availableWidth - columnWidth,
        paddingWidth: PADDING_WIDTH,
      }
}
