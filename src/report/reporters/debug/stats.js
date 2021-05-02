import { PADDING_WIDTH, SEPARATOR_WIDTH } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_COLUMNS } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allStatColumns } = STAT_COLUMNS.reduce(
    (state, name) =>
      reduceAllStateColumns(state, { name, stats, availableWidth }),
    { allStatColumns: [] },
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

  if (statColumns === undefined) {
    return {
      allStatColumns: [[name], ...allStatColumns],
      widthLeft: availableWidth - columnWidth - PADDING_WIDTH,
    }
  }

  if (widthLeft - columnWidth - SEPARATOR_WIDTH < 0) {
    return {
      allStatColumns: [[name], ...allStatColumns],
      widthLeft: availableWidth - columnWidth - PADDING_WIDTH,
    }
  }

  return {
    allStatColumns: [[...statColumns, name], ...previousStatColumns],
    widthLeft: widthLeft - columnWidth - SEPARATOR_WIDTH,
  }
}
