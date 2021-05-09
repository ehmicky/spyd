import { badColor, goodColor, suffixColor } from '../colors.js'

// Add `stat.prettyColor` and `stat.prettyPaddedColor`
export const addStatColor = function ({
  name,
  combination,
  combination: {
    stats,
    stats: {
      [name]: stat,
      [name]: { raw, pretty, prettyPadded },
    },
  },
}) {
  const prettyColor = addItemsColor(pretty, raw, name)
  const prettyPaddedColor = addItemsColor(prettyPadded, raw, name)
  return {
    ...combination,
    stats: { ...stats, [name]: { ...stat, prettyColor, prettyPaddedColor } },
  }
}

const addItemsColor = function (pretty, raw, name) {
  if (pretty === '') {
    return ''
  }

  return Array.isArray(pretty)
    ? pretty.map((item) => addItemColor(item, raw, name))
    : addItemColor(pretty, raw, name)
}

const addItemColor = function (pretty, raw, name) {
  const prettyA = addSuffixColors(pretty)
  const prettyB = addSpecificColors(prettyA, raw, name)
  return prettyB
}

// Add colors to suffixes (units, exponents, %) so they are easy to distinguish
// from the number they are attached to.
const addSuffixColors = function (pretty) {
  const [, number, suffix] = SUFFIX_REGEXP.exec(pretty)
  return `${number}${suffixColor(suffix)}`
}

const SUFFIX_REGEXP = /^([^a-z%]*)(.*)$/u

// Add stat-specific colors, e.g. on `diff`
const addSpecificColors = function (pretty, raw, name) {
  if (raw === undefined) {
    return pretty
  }

  const getColor = STAT_COLORS[name]

  if (getColor === undefined) {
    return pretty
  }

  const color = getColor(raw)

  if (color === undefined) {
    return pretty
  }

  return color(pretty)
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
