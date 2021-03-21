import stringWidth from 'string-width'

import { separatorColor } from '../colors.js'

// Retrieve the blocks that show the lowest|highest value of the histogram, on
// the left|right of it
const getBlock = function (getStat, stats, height) {
  const newlines = '\n'.repeat(height)
  const statPadded = getStat(stats)
  return `${newlines}${statPadded}`
}

// Retrieve the width of those blocks
const getBlockWidth = function (padStat, combinations) {
  return Math.max(
    ...combinations.map((combination) =>
      getCombinationWidth(combination, padStat),
    ),
  )
}

const getCombinationWidth = function ({ stats }, getStat) {
  return stringWidth(getStat(stats))
}

const getLowStat = function ({ lowPadded }) {
  return `${PADDING}${lowPadded}${PADDING}${TICK_LEFT}`
}

const getHighStat = function ({ highPadded }) {
  return `${TICK_RIGHT}${PADDING}${highPadded}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

// Characters to display on each end of the horizontal separator
const TICK_LEFT = separatorColor('\u250C')
const TICK_RIGHT = separatorColor('\u2510')

export const getLowBlock = getBlock.bind(undefined, getLowStat)
export const getLowBlockWidth = getBlockWidth.bind(undefined, getLowStat)
export const getHighBlock = getBlock.bind(undefined, getHighStat)
export const getHighBlockWidth = getBlockWidth.bind(undefined, getHighStat)
