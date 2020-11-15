import { red, cyan } from 'chalk'

import { getPercentageDirection } from './percentage.js'

// Add colors on `diff`
export const addColors = function (stat, statPretty, name) {
  const getColor = COLORS[name]

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

const DIRECTIONS = { positive: red, negative: cyan }

const COLORS = {
  diff: getRelPercentageColor,
}
