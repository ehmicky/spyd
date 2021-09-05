import { getCombinationPaddedName } from '../../utils/name.js'

import { getPaddedStatLength } from './abscissa.js'

// Compute the width of each column.
export const getWidths = function (combinations, mini, screenWidth) {
  const titlesWidth = getCombinationPaddedName(combinations[0]).length
  const minBlockWidth = getMinMaxBlockWidth(combinations, mini, 'min')
  const maxBlockWidth = getMinMaxBlockWidth(combinations, mini, 'max')
  const contentWidth = Math.max(
    screenWidth - titlesWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titlesWidth, minBlockWidth, contentWidth }
}

const getMinMaxBlockWidth = function (combinations, mini, statName) {
  return mini
    ? 0
    : Math.max(
        ...combinations.map(({ stats }) => getPaddedStatWidth(stats[statName])),
      )
}

const getPaddedStatWidth = function (stat) {
  return stat === undefined ? 0 : getPaddedStatLength(stat)
}
