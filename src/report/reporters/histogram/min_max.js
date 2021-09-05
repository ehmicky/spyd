import stringWidth from 'string-width'

import { separatorColor } from '../../utils/colors.js'

import { TICK_LEFT, TICK_RIGHT } from './characters.js'

// Retrieve the blocks that show the lowest|highest value of the histogram, on
// the left|right of it
const getBlock = function (getStat, { stats, height, mini }) {
  if (mini) {
    return ''
  }

  const newlines = '\n'.repeat(height)
  const statPadded = getStat(stats)
  return `${newlines}${statPadded}`
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
  return min === undefined
    ? ''
    : `${PADDING}${min.prettyPaddedColor}${PADDING}${separatorColor(TICK_LEFT)}`
}

const getMaxStat = function ({ max }) {
  return max === undefined
    ? ''
    : `${separatorColor(TICK_RIGHT)}${PADDING}${
        max.prettyPaddedColor
      }${PADDING}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

export const getMinBlock = getBlock.bind(undefined, getMinStat)
export const getMinBlockWidth = getBlockWidth.bind(undefined, getMinStat)
export const getMaxBlock = getBlock.bind(undefined, getMaxStat)
export const getMaxBlockWidth = getBlockWidth.bind(undefined, getMaxStat)
