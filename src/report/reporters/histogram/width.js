import { getCombinationTitlePad } from '../../utils/combination_title.js'

import { getPaddedStatLength, getTickLength } from './abscissa.js'

// Compute the width of each column.
export const getWidths = function (combinations, mini, screenWidth) {
  const titlesWidth = getCombinationTitlePad(combinations[0]).length
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
        ...combinations.map(
          ({ stats }) => getPaddedStatWidth(stats[statName]) + getTickLength(),
        ),
      )
}

const getPaddedStatWidth = function (stat) {
  return stat === undefined ? 0 : getPaddedStatLength(stat)
}
