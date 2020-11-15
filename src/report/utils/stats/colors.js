import { badColor, goodColor } from '../colors.js'

import { getPercentageDirection } from './percentage.js'

// Add colors on `diff`
export const addColors = function (stat, statPretty, name) {
  const getColor = STAT_COLORS[name]

  if (getColor === undefined) {
    return statPretty
  }

  const color = getColor(stat)

  if (color === undefined) {
    return statPretty
  }

  return color(statPretty)
}

const getRelPercentageColor = function (percentage) {
  return DIRECTIONS[getPercentageDirection(percentage)]
}

const DIRECTIONS = { positive: badColor, negative: goodColor }

const STAT_COLORS = {
  diff: getRelPercentageColor,
}
