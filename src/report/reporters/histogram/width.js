import stringWidth from 'string-width'

import { getCombinationPaddedName } from '../../utils/name.js'

import { getPaddedMin, getPaddedMax } from './abscissa.js'

// Retrieve the width of all blocks, in order:
//  - Combination titles
//  - Padding space reserved for the leftmost `min`
//  - Content, i.e. box plot and their labels
//  - Padding space reserved for the rightmost `max`
export const getWidths = function (combinations, mini, screenWidth) {
  const titlesWidth = getCombinationPaddedName(combinations[0]).length
  const minBlockWidth = getMinBlockWidth(combinations, mini)
  const maxBlockWidth = getMaxBlockWidth(combinations, mini)
  const contentWidth = Math.max(
    screenWidth - titlesWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titlesWidth, minBlockWidth, contentWidth }
}

// Retrieve the width of those blocks
const getBlockWidth = function (getStat, combinations, mini) {
  if (mini) {
    return 0
  }

  return Math.max(
    ...combinations.map((combination) =>
      getCombinationWidth(combination, getStat),
    ),
  )
}

const getCombinationWidth = function ({ stats }, getStat) {
  return stringWidth(getStat(stats))
}

const getMinStat = function ({ min }) {
  return min === undefined ? '' : getPaddedMin(min)
}

const getMaxStat = function ({ max }) {
  return max === undefined ? '' : getPaddedMax(max)
}

const getMinBlockWidth = getBlockWidth.bind(undefined, getMinStat)
const getMaxBlockWidth = getBlockWidth.bind(undefined, getMaxStat)
