import { getCombinationPaddedName } from '../../utils/name.js'

import { getPaddedStat } from './box.js'

// Retrieve the width of all blocks, in order:
//  - Combination titles
//  - Padding space reserved for the leftmost `min`
//  - Content, i.e. box plot and their labels
//  - Padding space reserved for the rightmost `max`
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
  return Math.max(
    ...combinations.map((combination) =>
      getSingleMinMaxWidth(combination, mini, statName),
    ),
  )
}

const getSingleMinMaxWidth = function ({ quantiles }, mini, statName) {
  return quantiles === undefined
    ? 0
    : getPaddedStat(quantiles[statName].pretty, mini).length
}
