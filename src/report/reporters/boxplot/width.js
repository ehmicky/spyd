import { getCombinationPaddedName } from '../../utils/name.js'

import { addStatPadding } from './content.js'

// Retrieve the width of all blocks, in order:
//  - Combination titles
//  - Padding space reserved for the leftmost `min`
//  - Content, i.e. box plot and their labels
//  - Padding space reserved for the rightmost `max`
export const getWidths = function (combinations, screenWidth, mini) {
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
  if (mini) {
    return 0
  }

  return Math.max(
    ...combinations.map(({ quantiles }) =>
      getSingleMinMaxWidth(quantiles, statName),
    ),
  )
}

const getSingleMinMaxWidth = function (quantiles, statName) {
  return quantiles === undefined
    ? 0
    : addStatPadding(quantiles[statName].pretty).length
}
