import { badColor, goodColor, suffixColor } from '../colors.js'

// Add colors to suffixes (units, exponents, %) so they are easy to distinguish
// from the number they are attached to.
export const addSuffixColors = function (statPretty) {
  const [, number, suffix] = SUFFIX_REGEXP.exec(statPretty)
  return `${number}${suffixColor(suffix)}`
}

const SUFFIX_REGEXP = /^([^a-z%]*)(.*)$/u

// Add colors on `diff`
export const addDiffColors = function (stat, statPretty, name) {
  if (stat === undefined) {
    return statPretty
  }

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

const getDiffColor = function (diff) {
  if (diff > DIFF_COLOR_THRESHOLD) {
    return badColor
  }

  if (diff < -DIFF_COLOR_THRESHOLD) {
    return goodColor
  }
}

const DIFF_COLOR_THRESHOLD = 1e-2

const STAT_COLORS = {
  diff: getDiffColor,
}
