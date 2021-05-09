import stringWidth from 'string-width'

import { separatorColor } from '../colors.js'

import { TICK_LEFT, TICK_RIGHT } from './characters.js'

// Retrieve the blocks that show the lowest|highest value of the histogram, on
// the left|right of it
const getBlock = function (getStat, { stats, height, showStats }) {
  if (!showStats) {
    return ''
  }

  const newlines = '\n'.repeat(height)
  const statPadded = getStat(stats)
  return `${newlines}${statPadded}`
}

// Retrieve the width of those blocks
const getBlockWidth = function (padStat, combinations, showStats) {
  if (!showStats) {
    return 0
  }

  return Math.max(
    ...combinations.map((combination) =>
      getCombinationWidth(combination, padStat),
    ),
  )
}

const getCombinationWidth = function ({ stats }, getStat) {
  return stringWidth(getStat(stats))
}

const getLowStat = function ({ low }) {
  return `${PADDING}${low.prettyPaddedColor}${PADDING}${separatorColor(
    TICK_LEFT,
  )}`
}

const getHighStat = function ({ high }) {
  return `${separatorColor(TICK_RIGHT)}${PADDING}${high.prettyPaddedColor}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

export const getLowBlock = getBlock.bind(undefined, getLowStat)
export const getLowBlockWidth = getBlockWidth.bind(undefined, getLowStat)
export const getHighBlock = getBlock.bind(undefined, getHighStat)
export const getHighBlockWidth = getBlockWidth.bind(undefined, getHighStat)
