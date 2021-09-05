import { getCombinationPaddedName } from '../../utils/name.js'

import { getMinBlockWidth, getMaxBlockWidth } from './min_max.js'

// Retrieve the width of all blocks, in order:
//  - Combination titles
//  - Padding space reserved for the leftmost `min`
//  - Content, i.e. box plot and their labels
//  - Padding space reserved for the rightmost `max`
export const getWidths = function (combinations, mini, screenWidth) {
  const titleBlockWidth = getCombinationPaddedName(combinations[0]).length
  const minBlockWidth = getMinBlockWidth(combinations, mini)
  const maxBlockWidth = getMaxBlockWidth(combinations, mini)
  const contentWidth = Math.max(
    screenWidth - titleBlockWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titleBlockWidth, minBlockWidth, contentWidth }
}
