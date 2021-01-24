import { badColor, goodColor, suffixColor } from '../colors.js'

import { getPercentageDirection } from './percentage.js'

// Add colors to suffixes (units, exponents, %) so they are easy to distinguish
// from the number they are attached to.
export const addSuffixColors = function (statPretty) {
  const [, number, suffix] = SUFFIX_REGEXP.exec(statPretty)
  return `${number}${suffixColor(suffix)}`
}

const SUFFIX_REGEXP = /^([^a-z%]*)(.*)$/u

// Add colors on `diff`
export const addDiffColors = function (stat, statPretty, name) {
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
