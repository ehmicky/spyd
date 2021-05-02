import { PADDING_WIDTH, SEPARATOR_WIDTH } from '../../utils/separator.js'

import { NAME_RIGHT_PADDING_WIDTH, STAT_NAMES } from './column.js'
import { getEmptyRowWidth, getColumnWidth } from './header.js'

export const getAllStatNames = function ({ titles, stats }, screenWidth) {
  const availableWidth =
    screenWidth - getEmptyRowWidth(titles) - NAME_RIGHT_PADDING_WIDTH
  const { allStatNames } = STAT_NAMES.reduce(
    (state, statName) =>
      addStatName(state, { statName, stats, availableWidth }),
    { allStatNames: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allStatNames.reverse()
}

const addStatName = function (
  {
    allStatNames,
    allStatNames: [statNames, ...previousStatNames],
    remainingWidth,
  },
  { statName, stats, availableWidth },
) {
  const columnWidth = getColumnWidth(stats, statName)
  const remainingWidthA = remainingWidth - columnWidth - SEPARATOR_WIDTH
  return remainingWidthA >= 0
    ? {
        allStatNames: [[...statNames, statName], ...previousStatNames],
        remainingWidth: remainingWidthA,
      }
    : {
        allStatNames: [[statName], ...allStatNames],
        remainingWidth: availableWidth - columnWidth - PADDING_WIDTH,
      }
}
