import { PADDED_SEPARATOR } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_COLUMNS } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatColumns = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const separatorWidth = PADDED_SEPARATOR.length
  const { allStatColumns } = STAT_COLUMNS.reduce(
    (state, name) =>
      reduceAllStateColumns(state, {
        name,
        stats,
        separatorWidth,
        availableWidth,
      }),
    { allStatColumns: [[]], widthLeft: availableWidth },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allStatColumns.reverse()
}

const reduceAllStateColumns = function (
  { allStatColumns: [statColumns, ...previousStatColumns], widthLeft },
  { name, stats, separatorWidth, availableWidth },
) {
  const statWidth = getColumnWidth(stats, name) + separatorWidth
  const widthLeftA = widthLeft - statWidth

  return statColumns.length === 0 || widthLeftA >= 0
    ? {
        allStatColumns: [[...statColumns, name], ...previousStatColumns],
        widthLeft: widthLeftA,
      }
    : {
        allStatColumns: [[name], statColumns, ...previousStatColumns],
        widthLeft: availableWidth,
      }
}
