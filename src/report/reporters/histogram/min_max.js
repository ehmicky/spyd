import stringWidth from 'string-width'

import { separatorColor } from '../../utils/colors.js'

import { TICK_LEFT, TICK_RIGHT } from './characters.js'

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
  return min === undefined ? '' : padMinStat(min)
}

const getMaxStat = function ({ max }) {
  return max === undefined ? '' : padMaxStat(max)
}

export const padMinStat = function (min) {
  return `${PADDING}${min.prettyPaddedColor}${PADDING}${separatorColor(
    TICK_LEFT,
  )}`
}

export const padMaxStat = function (max) {
  return `${separatorColor(TICK_RIGHT)}${PADDING}${
    max.prettyPaddedColor
  }${PADDING}`
}

const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)

export const getMinBlockWidth = getBlockWidth.bind(undefined, getMinStat)
export const getMaxBlockWidth = getBlockWidth.bind(undefined, getMaxStat)
