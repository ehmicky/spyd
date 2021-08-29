import { badColor, goodColor, suffixColor } from '../../utils/colors.js'

// Add `stat.prettyColor` and `stat.prettyPaddedColor`
export const addStatColor = function ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
}) {
  if (stat === undefined) {
    return combination
  }

  const { raw, pretty, prettyPadded } = stat
  const prettyColor = addItemsColor(pretty, { raw, name, stats })
  const prettyPaddedColor = addItemsColor(prettyPadded, { raw, name, stats })
  return {
    ...combination,
    stats: { ...stats, [name]: { ...stat, prettyColor, prettyPaddedColor } },
  }
}

const addItemsColor = function (pretty, { raw, name, stats }) {
  if (pretty === '') {
    return ''
  }

  return Array.isArray(pretty)
    ? pretty.map((item) => addItemColor(item, { raw, name, stats }))
    : addItemColor(pretty, { raw, name, stats })
}

const addItemColor = function (pretty, { raw, name, stats }) {
  const prettyA = addSuffixColors(pretty)
  const prettyB = addSpecificColors(prettyA, { raw, name, stats })
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
const addSpecificColors = function (pretty, { raw, name, stats }) {
  if (raw === undefined) {
    return pretty
  }

  const getColor = STAT_COLORS[name]

  if (getColor === undefined) {
    return pretty
  }

  const color = getColor(raw, stats)

  if (color === undefined) {
    return pretty
  }

  return color(pretty)
}

const getDiffColor = function (diff, { diffPrecise }) {
  if (!diffPrecise) {
    return
  }

  return diff > 0 ? badColor : goodColor
}

const STAT_COLORS = {
  diff: getDiffColor,
}
