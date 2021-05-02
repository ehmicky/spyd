import { PADDING_WIDTH, SEPARATOR_WIDTH } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_COLUMNS } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allStatColumns } = STAT_COLUMNS.reduce(
    (state, name) =>
      reduceAllStateColumns(state, { name, stats, availableWidth }),
    { allStatColumns: [[]], widthLeft: availableWidth },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allStatColumns.reverse()
}

const reduceAllStateColumns = function (
  { allStatColumns: [statColumns, ...previousStatColumns], widthLeft },
  { name, stats, availableWidth },
) {
  const isFirstColumn = statColumns.length === 0
  const columnWidth = getColumnWidth(stats, name)

  return isFirstColumn || widthLeft >= columnWidth + SEPARATOR_WIDTH
    ? {
        allStatColumns: [[...statColumns, name], ...previousStatColumns],
        widthLeft:
          widthLeft -
          columnWidth -
          (isFirstColumn ? PADDING_WIDTH : SEPARATOR_WIDTH),
      }
    : {
        allStatColumns: [[name], statColumns, ...previousStatColumns],
        widthLeft: availableWidth - columnWidth - PADDING_WIDTH,
      }
}
