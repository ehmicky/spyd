import stringWidth from 'string-width'

import { getPaddedMin, getPaddedMax } from './abscissa.js'

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

export const getMinBlockWidth = getBlockWidth.bind(undefined, getMinStat)
export const getMaxBlockWidth = getBlockWidth.bind(undefined, getMaxStat)
